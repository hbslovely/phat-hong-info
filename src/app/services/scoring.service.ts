import { Injectable } from '@angular/core';
import { QuestionAnalysis } from './question-analysis.service';

export interface ScoringResult {
  totalScore: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  scoringBreakdown: {
    patternMatch: number;
    contextRelevance: number;
    sentimentAlignment: number;
    complexityFit: number;
    intentMatch: number;
  };
  recommendedResponseStyle: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ResponseCandidate {
  id: string;
  content: string;
  keywords: string[];
  score: number;
  matchedKeywords: string[];
  contextAlignment: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoringService {
  
  constructor() {}

  public scoreResponseCandidate(
    candidate: ResponseCandidate,
    analysis: QuestionAnalysis,
    userMessage: string
  ): ScoringResult {
    
    const scoringBreakdown = {
      patternMatch: this.calculatePatternMatchScore(candidate, userMessage),
      contextRelevance: this.calculateContextRelevanceScore(candidate, analysis),
      sentimentAlignment: this.calculateSentimentAlignmentScore(candidate, analysis),
      complexityFit: this.calculateComplexityFitScore(candidate, analysis),
      intentMatch: this.calculateIntentMatchScore(candidate, analysis)
    };

    const totalScore = this.calculateTotalScore(scoringBreakdown);
    const confidenceLevel = this.determineConfidenceLevel(totalScore, scoringBreakdown);
    const recommendedResponseStyle = this.determineResponseStyle(analysis, totalScore);
    const priority = this.determinePriority(analysis, totalScore);

    return {
      totalScore,
      confidenceLevel,
      scoringBreakdown,
      recommendedResponseStyle,
      priority
    };
  }

  private calculatePatternMatchScore(candidate: ResponseCandidate, userMessage: string): number {
    const normalizedMessage = userMessage.toLowerCase();
    let score = 0;
    let totalKeywords = candidate.keywords.length;
    
    if (totalKeywords === 0) return 0;

    for (let i = 0; i < candidate.keywords.length; i++) {
      const keyword = candidate.keywords[i].toLowerCase();
      if (normalizedMessage.includes(keyword)) {
        // Earlier keywords have higher weight
        const positionWeight = (totalKeywords - i) / totalKeywords;
        score += positionWeight * 10;
        
        // Bonus for exact word match
        const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegExp(keyword)}\\b`);
        if (wordBoundaryRegex.test(normalizedMessage)) {
          score += 5;
        }
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  private calculateContextRelevanceScore(candidate: ResponseCandidate, analysis: QuestionAnalysis): number {
    let score = 0;
    
    // Base score for question type alignment
    const questionTypeMapping: { [key: string]: string[] } = {
      'personal_question': ['tên', 'tuổi', 'sở thích', 'gia đình', 'name', 'age', 'hobby'],
      'work_question': ['công việc', 'job', 'work', 'dự án', 'project'],
      'skill_question': ['kỹ năng', 'skills', 'công nghệ', 'technology'],
      'experience_question': ['kinh nghiệm', 'experience', 'career']
    };

    const relevantKeywords = questionTypeMapping[analysis.type] || [];
    const keywordMatches = candidate.keywords.filter(keyword => 
      relevantKeywords.some(rk => keyword.toLowerCase().includes(rk))
    );
    
    score += keywordMatches.length * 15;

    // Context alignment bonus
    if (analysis.context.length > 0) {
      const contextMatch = analysis.context.some(ctx => 
        candidate.keywords.some(keyword => keyword.toLowerCase().includes(ctx))
      );
      if (contextMatch) score += 20;
    }

    // Personal info bonus
    if (analysis.isPersonalInfo && this.isPersonalInfoCandidate(candidate)) {
      score += 25;
    }

    return Math.min(score, 100);
  }

  private calculateSentimentAlignmentScore(candidate: ResponseCandidate, analysis: QuestionAnalysis): number {
    // For now, neutral alignment unless specific sentiment patterns are detected
    let score = 50; // Base neutral score
    
    // Adjust based on sentiment appropriateness
    if (analysis.sentiment === 'positive') {
      // Positive questions should get positive or neutral responses
      score += 10;
    } else if (analysis.sentiment === 'negative') {
      // Negative questions might need empathetic responses
      score += 5;
    }

    return Math.min(score, 100);
  }

  private calculateComplexityFitScore(candidate: ResponseCandidate, analysis: QuestionAnalysis): number {
    let score = 50; // Base score
    
    // Simple heuristic: longer responses for more complex questions
    const responseLength = candidate.content.length;
    const questionComplexity = this.estimateQuestionComplexity(analysis);
    
    if (questionComplexity === 'simple' && responseLength < 200) score += 20;
    else if (questionComplexity === 'moderate' && responseLength >= 200 && responseLength < 500) score += 20;
    else if (questionComplexity === 'complex' && responseLength >= 500) score += 20;
    
    return Math.min(score, 100);
  }

  private calculateIntentMatchScore(candidate: ResponseCandidate, analysis: QuestionAnalysis): number {
    let score = 50; // Base score
    
    // Boost score based on question type and expected response type
    const intentMapping: { [key: string]: number } = {
      'greeting': analysis.isGreeting ? 30 : 0,
      'farewell': analysis.isFarewell ? 30 : 0,
      'yes_no_question': analysis.type === 'yes_no_question' ? 25 : 0,
      'personal_question': analysis.isPersonalInfo ? 25 : 0
    };

    for (const [intent, bonus] of Object.entries(intentMapping)) {
      score += bonus;
    }

    return Math.min(score, 100);
  }

  private calculateTotalScore(breakdown: ScoringResult['scoringBreakdown']): number {
    const weights = {
      patternMatch: 0.35,      // 35% - Most important
      contextRelevance: 0.25,  // 25% - Very important
      intentMatch: 0.20,       // 20% - Important
      sentimentAlignment: 0.10, // 10% - Moderate
      complexityFit: 0.10      // 10% - Moderate
    };

    return (
      breakdown.patternMatch * weights.patternMatch +
      breakdown.contextRelevance * weights.contextRelevance +
      breakdown.intentMatch * weights.intentMatch +
      breakdown.sentimentAlignment * weights.sentimentAlignment +
      breakdown.complexityFit * weights.complexityFit
    );
  }

  private determineConfidenceLevel(totalScore: number, breakdown: ScoringResult['scoringBreakdown']): 'low' | 'medium' | 'high' {
    if (totalScore >= 80 && breakdown.patternMatch >= 60) return 'high';
    if (totalScore >= 60 && breakdown.contextRelevance >= 50) return 'medium';
    return 'low';
  }

  private determineResponseStyle(analysis: QuestionAnalysis, totalScore: number): string {
    if (analysis.isGreeting || analysis.isFarewell) return 'social';
    if (analysis.type === 'yes_no_question') return 'direct';
    if (analysis.isPersonalInfo) return 'personal';
    if (analysis.context.includes('technical')) return 'technical';
    if (totalScore >= 80) return 'comprehensive';
    return 'standard';
  }

  private determinePriority(analysis: QuestionAnalysis, totalScore: number): 'low' | 'medium' | 'high' {
    if (analysis.isGreeting || analysis.isFarewell) return 'high';
    if (analysis.type === 'yes_no_question') return 'high';
    if (totalScore >= 80) return 'high';
    if (totalScore >= 60) return 'medium';
    return 'low';
  }

  private isPersonalInfoCandidate(candidate: ResponseCandidate): boolean {
    const personalKeywords = ['tên', 'tuổi', 'sở thích', 'gia đình', 'quê', 'học', 'name', 'age', 'hobby', 'family', 'education'];
    return candidate.keywords.some(keyword => 
      personalKeywords.some(pk => keyword.toLowerCase().includes(pk))
    );
  }

  private estimateQuestionComplexity(analysis: QuestionAnalysis): 'simple' | 'moderate' | 'complex' {
    let complexityScore = 0;
    
    if (analysis.context.length > 2) complexityScore += 2;
    if (analysis.type.includes('comparison') || analysis.type.includes('opinion')) complexityScore += 2;
    if (analysis.context.includes('technical')) complexityScore += 1;
    
    if (complexityScore >= 4) return 'complex';
    if (complexityScore >= 2) return 'moderate';
    return 'simple';
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
