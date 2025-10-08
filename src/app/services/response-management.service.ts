import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuestionAnalysis } from './question-analysis.service';
import { ScoringService, ResponseCandidate, ScoringResult } from './scoring.service';

export interface EnhancedInterviewResponse {
  id?: string;
  keywords: string[];
  answer: string;
  yes?: string;
  no?: string;
  category?: string;
  subcategory?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  responseType?: string;
  contextTags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface ResponseSelectionResult {
  selectedResponse: EnhancedInterviewResponse;
  scoringResult: ScoringResult;
  alternativeResponses: EnhancedInterviewResponse[];
  selectionReason: string;
  confidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResponseManagementService {
  private responses: EnhancedInterviewResponse[] = [];

  constructor(
    private http: HttpClient,
    private scoringService: ScoringService
  ) {
    this.loadResponses();
  }

  private async loadResponses(): Promise<void> {
    try {
      const data = await this.http.get<{responses: EnhancedInterviewResponse[]}>('assets/json/interview-responses.json').toPromise();
      this.responses = data?.responses || [];
    } catch (error) {
      console.error('Failed to load interview responses:', error);
      this.responses = [];
    }
  }

  public async selectBestResponse(
    userMessage: string, 
    analysis: QuestionAnalysis
  ): Promise<ResponseSelectionResult> {
    
    // Handle special cases first
    if (analysis.isGreeting && analysis.type === 'greeting') {
      return this.handleSpecialCase('1', 'greeting', analysis);
    }
    
    if (analysis.type === 'personal_introduction') {
      return this.handleSpecialCase('2', 'personal_introduction', analysis);
    }
    
    if (analysis.isFarewell) {
      return this.handleSpecialCase('3', 'farewell', analysis);
    }

    // Get all candidate responses
    const candidates = this.generateCandidates(userMessage, analysis);
    
    // Score each candidate
    const scoredCandidates = candidates.map(candidate => ({
      candidate,
      scoring: this.scoringService.scoreResponseCandidate(candidate, analysis, userMessage)
    }));

    // Sort by total score
    scoredCandidates.sort((a, b) => b.scoring.totalScore - a.scoring.totalScore);

    // Handle multiple high-scoring candidates
    const bestCandidates = this.selectTopCandidates(scoredCandidates);
    
    if (bestCandidates.length === 0) {
      return this.handleNoMatch(analysis);
    }

    // Determine if we should combine responses or select single best
    if (bestCandidates.length > 1 && this.shouldCombineResponses(bestCandidates, analysis)) {
      return this.combineResponses(bestCandidates, analysis);
    }

    // Return single best response
    const best = bestCandidates[0];
    const selectedResponse = this.findResponseById(best.candidate.id);
    
    return {
      selectedResponse: selectedResponse || this.getDefaultResponse(),
      scoringResult: best.scoring,
      alternativeResponses: bestCandidates.slice(1, 4).map(c => this.findResponseById(c.candidate.id)).filter(r => r) as EnhancedInterviewResponse[],
      selectionReason: this.generateSelectionReason(best.scoring, analysis),
      confidence: best.scoring.totalScore
    };
  }

  private generateCandidates(userMessage: string, analysis: QuestionAnalysis): ResponseCandidate[] {
    const normalizedMessage = this.normalizeVietnamese(userMessage.toLowerCase());
    const candidates: ResponseCandidate[] = [];

    for (const response of this.responses) {
      // Skip special responses
      if (response.id === '999' || response.answer === 'trigger_yes') {
        continue;
      }

      let score = 0;
      const matchedKeywords: string[] = [];

      // Calculate basic keyword matching score
      for (let i = 0; i < response.keywords.length; i++) {
        const keyword = this.normalizeVietnamese(response.keywords[i].toLowerCase());
        if (normalizedMessage.includes(keyword)) {
          score += (response.keywords.length - i) * 10;
          matchedKeywords.push(response.keywords[i]);
        }
      }

      if (score > 0 || this.isRelevantByContext(response, analysis)) {
        candidates.push({
          id: response.id || '',
          content: response.answer,
          keywords: response.keywords,
          score,
          matchedKeywords,
          contextAlignment: this.calculateContextAlignment(response, analysis)
        });
      }
    }

    return candidates;
  }

  private selectTopCandidates(scoredCandidates: Array<{candidate: ResponseCandidate, scoring: ScoringResult}>): Array<{candidate: ResponseCandidate, scoring: ScoringResult}> {
    if (scoredCandidates.length === 0) return [];

    const topScore = scoredCandidates[0].scoring.totalScore;
    const threshold = Math.max(topScore * 0.7, 10); // 70% of top score or minimum 10

    // Debug logging
    console.log('Top score:', topScore, 'Threshold:', threshold);
    console.log('Scored candidates:', scoredCandidates.slice(0, 3).map(sc => ({
      id: sc.candidate.id,
      score: sc.scoring.totalScore,
      keywords: sc.candidate.matchedKeywords
    })));

    return scoredCandidates.filter(sc => sc.scoring.totalScore >= threshold);
  }

  private shouldCombineResponses(
    candidates: Array<{candidate: ResponseCandidate, scoring: ScoringResult}>, 
    analysis: QuestionAnalysis
  ): boolean {
    // Don't combine for greetings, farewells, or yes/no questions
    if (analysis.isGreeting || analysis.isFarewell || analysis.type === 'yes_no_question') {
      return false;
    }

    // Combine if we have multiple high-scoring candidates with similar scores
    if (candidates.length > 1) {
      const topScore = candidates[0].scoring.totalScore;
      const secondScore = candidates[1].scoring.totalScore;
      return (topScore - secondScore) < 10; // Less than 10 point difference
    }

    return false;
  }

  private combineResponses(
    candidates: Array<{candidate: ResponseCandidate, scoring: ScoringResult}>, 
    analysis: QuestionAnalysis
  ): ResponseSelectionResult {
    const combinedContent = candidates
      .slice(0, 3) // Max 3 responses
      .map(c => c.candidate.content)
      .join('\n\n');

    const combinedResponse: EnhancedInterviewResponse = {
      id: 'combined_' + candidates.map(c => c.candidate.id).join('_'),
      keywords: candidates.flatMap(c => c.candidate.keywords),
      answer: combinedContent,
      category: 'combined',
      responseType: 'multi_aspect'
    };

    const avgScore = candidates.reduce((sum, c) => sum + c.scoring.totalScore, 0) / candidates.length;

    return {
      selectedResponse: combinedResponse,
      scoringResult: candidates[0].scoring, // Use best scoring as representative
      alternativeResponses: candidates.slice(1).map(c => this.findResponseById(c.candidate.id)).filter(r => r) as EnhancedInterviewResponse[],
      selectionReason: `Combined ${candidates.length} relevant responses for comprehensive answer`,
      confidence: avgScore
    };
  }

  private handleSpecialCase(responseId: string, caseType: string, analysis: QuestionAnalysis): ResponseSelectionResult {
    const response = this.findResponseById(responseId);
    if (!response) {
      return this.handleNoMatch(analysis);
    }

    return {
      selectedResponse: response,
      scoringResult: {
        totalScore: 100,
        confidenceLevel: 'high',
        scoringBreakdown: {
          patternMatch: 100,
          contextRelevance: 100,
          sentimentAlignment: 80,
          complexityFit: 80,
          intentMatch: 100
        },
        recommendedResponseStyle: caseType,
        priority: 'high'
      },
      alternativeResponses: [],
      selectionReason: `Direct match for ${caseType}`,
      confidence: 100
    };
  }

  private handleNoMatch(analysis: QuestionAnalysis): ResponseSelectionResult {
    let fallbackMessage: string;
    
    if (analysis.isQuestion && analysis.isPersonalInfo) {
      fallbackMessage = 'Tôi chưa có thông tin cụ thể về câu hỏi này. Bạn có thể hỏi tôi về kinh nghiệm làm việc, kỹ năng, sở thích, hoặc thông tin cá nhân khác không?';
    } else {
      fallbackMessage = 'Xin lỗi, hiện tại tôi chỉ trả lời các câu hỏi về thông tin cá nhân, kinh nghiệm làm việc và kỹ năng của tôi thôi. Bạn có muốn hỏi gì khác về background, dự án, hoặc sở thích của tôi không?';
    }

    const fallbackResponse: EnhancedInterviewResponse = {
      id: 'fallback',
      keywords: [],
      answer: fallbackMessage,
      category: 'fallback',
      responseType: 'no_match'
    };

    return {
      selectedResponse: fallbackResponse,
      scoringResult: {
        totalScore: 0,
        confidenceLevel: 'low',
        scoringBreakdown: {
          patternMatch: 0,
          contextRelevance: 0,
          sentimentAlignment: 50,
          complexityFit: 50,
          intentMatch: 0
        },
        recommendedResponseStyle: 'fallback',
        priority: 'low'
      },
      alternativeResponses: [],
      selectionReason: 'No suitable response found, using fallback',
      confidence: 0
    };
  }

  private isRelevantByContext(response: EnhancedInterviewResponse, analysis: QuestionAnalysis): boolean {
    // Check if response is contextually relevant even without direct keyword match
    if (analysis.isPersonalInfo && this.isPersonalInfoResponse(response)) {
      return true;
    }

    if (analysis.context.includes('technical') && this.isTechnicalResponse(response)) {
      return true;
    }

    if (analysis.context.includes('professional') && this.isProfessionalResponse(response)) {
      return true;
    }

    return false;
  }

  private calculateContextAlignment(response: EnhancedInterviewResponse, analysis: QuestionAnalysis): number {
    let alignment = 0;
    
    // Check context tag alignment
    if (response.contextTags) {
      const matchingTags = response.contextTags.filter(tag => analysis.context.includes(tag));
      alignment += matchingTags.length * 20;
    }

    // Check category alignment
    if (response.category) {
      if (analysis.context.includes(response.category)) {
        alignment += 30;
      }
    }

    return Math.min(alignment, 100);
  }

  private isPersonalInfoResponse(response: EnhancedInterviewResponse): boolean {
    const personalKeywords = ['tên', 'tuổi', 'sở thích', 'gia đình', 'quê', 'học', 'name', 'age', 'hobby', 'family', 'education'];
    return response.keywords.some(keyword => 
      personalKeywords.some(pk => keyword.toLowerCase().includes(pk))
    );
  }

  private isTechnicalResponse(response: EnhancedInterviewResponse): boolean {
    const technicalKeywords = ['angular', 'react', 'javascript', 'typescript', 'programming', 'development', 'code', 'framework'];
    return response.keywords.some(keyword => 
      technicalKeywords.some(tk => keyword.toLowerCase().includes(tk))
    );
  }

  private isProfessionalResponse(response: EnhancedInterviewResponse): boolean {
    const professionalKeywords = ['công việc', 'job', 'work', 'company', 'team', 'project', 'experience', 'career'];
    return response.keywords.some(keyword => 
      professionalKeywords.some(pk => keyword.toLowerCase().includes(pk))
    );
  }

  private findResponseById(id: string): EnhancedInterviewResponse | null {
    return this.responses.find(response => response.id === id) || null;
  }

  private getDefaultResponse(): EnhancedInterviewResponse {
    return {
      id: 'default',
      keywords: [],
      answer: 'Xin lỗi, hiện tại tôi chỉ trả lời các câu hỏi về thông tin cá nhân, kinh nghiệm làm việc và kỹ năng của tôi thôi. Bạn có muốn hỏi gì khác về background, dự án, hoặc sở thích của tôi không?',
      category: 'default',
      responseType: 'fallback'
    };
  }

  private generateSelectionReason(scoring: ScoringResult, analysis: QuestionAnalysis): string {
    const reasons: string[] = [];
    
    if (scoring.scoringBreakdown.patternMatch >= 70) {
      reasons.push('strong keyword match');
    }
    
    if (scoring.scoringBreakdown.contextRelevance >= 70) {
      reasons.push('high context relevance');
    }
    
    if (analysis.isPersonalInfo) {
      reasons.push('personal information question');
    }
    
    if (scoring.confidenceLevel === 'high') {
      reasons.push('high confidence match');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'best available match';
  }

  private normalizeVietnamese(text: string): string {
    const vietnameseMap: { [key: string]: string } = {
      'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
      'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
      'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
      'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
      'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
      'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
      'đ': 'd'
    };

    return text.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, function(match) {
      return vietnameseMap[match] || match;
    });
  }
}
