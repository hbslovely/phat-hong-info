import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface QuestionAnalysis {
  type: string;
  confidence: number;
  isQuestion: boolean;
  isGreeting: boolean;
  isFarewell: boolean;
  isPersonalInfo: boolean;
  context: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  complexity: 'simple' | 'moderate' | 'complex';
  intent: string[];
  priority: 'low' | 'medium' | 'high';
  followUpSuggestions: string[];
  domainExpertise: string[];
  responseStrategy: string;
  estimatedReadTime: string;
}

export interface QuestionPatterns {
  questionPatterns: { 
    [key: string]: { 
      patterns: string[], 
      weight: number, 
      type: string,
      priority?: string,
      context?: string[],
      expectedResponse?: string,
      followUpSuggestions?: string[]
    } 
  };
  contextClues: { 
    [key: string]: { 
      keywords: string[], 
      weight: number,
      category?: string,
      subcategories?: string[],
      relatedTopics?: string[]
    } 
  };
  sentimentAnalysis: { 
    [key: string]: { 
      keywords: string[], 
      weight: number,
      intensity?: string,
      emotionType?: string
    } 
  };
  complexityLevels?: {
    [key: string]: {
      indicators: string[],
      weight: number,
      responseStyle: string,
      estimatedReadTime?: string,
      detailLevel?: string
    }
  };
  intentAnalysis?: {
    [key: string]: {
      patterns: string[],
      weight: number,
      responseType: string,
      userGoal?: string,
      followUpLikelihood?: string
    }
  };
  responseStrategies?: {
    [key: string]: {
      characteristics: string[],
      useCases: string[],
      tone: string
    }
  };
  domainExpertise?: {
    [key: string]: {
      technologies?: string[],
      concepts?: string[],
      practices?: string[],
      tools?: string[],
      domains?: string[],
      areas?: string[],
      experienceLevel: string,
      yearsOfExperience: number
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class QuestionAnalysisService {
  private patterns: QuestionPatterns | null = null;

  constructor(private http: HttpClient) {
    this.loadPatterns();
  }

  private async loadPatterns(): Promise<void> {
    try {
      const data = await this.http.get<QuestionPatterns>('assets/json/question-patterns.json').toPromise();
      this.patterns = data || null;
    } catch (error) {
      console.error('Failed to load question patterns:', error);
      this.patterns = null;
    }
  }

  public analyzeQuestion(text: string): QuestionAnalysis {
    if (!this.patterns) {
      return this.getDefaultAnalysis();
    }

    const normalizedText = this.normalizeVietnamese(text.toLowerCase());
    
    // Analyze question type
    const questionType = this.detectQuestionType(normalizedText);
    
    // Analyze context
    const context = this.detectContext(normalizedText);
    
    // Analyze sentiment
    const sentiment = this.detectSentiment(normalizedText);
    
    // Check if it's a question
    const isQuestion = this.isQuestionSentence(normalizedText);
    
    // Check specific types
    const isGreeting = questionType.type === 'greeting';
    const isFarewell = questionType.type === 'farewell';
    const isPersonalInfo = this.isPersonalInfoQuestion(normalizedText, context);

    return {
      type: questionType.type,
      confidence: questionType.confidence,
      isQuestion,
      isGreeting,
      isFarewell,
      isPersonalInfo,
      context,
      sentiment,
      complexity: this.detectComplexity(text, questionType.type),
      intent: this.detectIntent(text),
      priority: this.determinePriority(questionType.type, isGreeting, isFarewell),
      followUpSuggestions: this.generateFollowUpSuggestions(questionType.type),
      domainExpertise: this.identifyDomainExpertise(text),
      responseStrategy: this.determineResponseStrategy(questionType.type, context),
      estimatedReadTime: this.estimateReadTime(questionType.type)
    };
  }

  private detectQuestionType(text: string): { type: string, confidence: number } {
    if (!this.patterns) return { type: 'unknown', confidence: 0 };

    let bestMatch = { type: 'unknown', confidence: 0 };

    for (const [type, config] of Object.entries(this.patterns.questionPatterns)) {
      let score = 0;
      let matches = 0;

      for (const pattern of config.patterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(text)) {
          score += config.weight;
          matches++;
        }
      }

      if (matches > 0) {
        const confidence = (score / config.patterns.length) * (matches / config.patterns.length);
        if (confidence > bestMatch.confidence) {
          bestMatch = { type, confidence };
        }
      }
    }

    return bestMatch;
  }

  private detectContext(text: string): string[] {
    if (!this.patterns) return [];

    const contexts: string[] = [];

    for (const [contextType, config] of Object.entries(this.patterns.contextClues)) {
      let score = 0;
      for (const keyword of config.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += config.weight;
        }
      }
      
      if (score > 0) {
        contexts.push(contextType);
      }
    }

    return contexts.sort();
  }

  private detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    if (!this.patterns) return 'neutral';

    let positiveScore = 0;
    let negativeScore = 0;

    // Check positive keywords
    if (this.patterns.sentimentAnalysis['positive']) {
      for (const keyword of this.patterns.sentimentAnalysis['positive'].keywords) {
        if (text.includes(keyword.toLowerCase())) {
          positiveScore += this.patterns.sentimentAnalysis['positive'].weight;
        }
      }
    }

    // Check negative keywords
    if (this.patterns.sentimentAnalysis['negative']) {
      for (const keyword of this.patterns.sentimentAnalysis['negative'].keywords) {
        if (text.includes(keyword.toLowerCase())) {
          negativeScore += this.patterns.sentimentAnalysis['negative'].weight;
        }
      }
    }

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  private isQuestionSentence(text: string): boolean {
    // Check for question marks
    if (text.includes('?')) return true;
    
    // Check for question words at the beginning
    const questionWords = [
      'gì', 'ai', 'đâu', 'nào', 'sao', 'thế nào', 'ra sao', 'như thế nào',
      'what', 'who', 'where', 'when', 'why', 'how', 'which', 'whose',
      'có phải', 'có đúng', 'có thể', 'có được',
      'is', 'are', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should'
    ];

    for (const word of questionWords) {
      if (text.includes(word.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  private isPersonalInfoQuestion(text: string, context: string[]): boolean {
    // If context includes personal, it's likely personal info
    if (context.includes('personal')) return true;

    // Check for personal info keywords
    const personalKeywords = [
      'tên', 'tuổi', 'sở thích', 'gia đình', 'quê', 'học', 'trường',
      'name', 'age', 'hobby', 'family', 'from', 'education', 'university',
      'bản thân', 'cá nhân', 'riêng', 'myself', 'about you', 'yourself'
    ];

    for (const keyword of personalKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        return true;
      }
    }

    return false;
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

  private getDefaultAnalysis(): QuestionAnalysis {
    return {
      type: 'unknown',
      confidence: 0,
      isQuestion: false,
      isGreeting: false,
      isFarewell: false,
      isPersonalInfo: false,
      context: [],
      sentiment: 'neutral',
      complexity: 'simple',
      intent: [],
      priority: 'low',
      followUpSuggestions: [],
      domainExpertise: [],
      responseStrategy: 'direct',
      estimatedReadTime: '30 seconds'
    };
  }

  private generateFollowUpSuggestions(questionType: string): string[] {
    if (!this.patterns?.questionPatterns) return [];
    
    const pattern = this.patterns.questionPatterns[questionType];
    return pattern?.followUpSuggestions || [];
  }

  private identifyDomainExpertise(text: string): string[] {
    if (!this.patterns?.domainExpertise) return [];
    
    const expertise: string[] = [];
    const normalizedText = text.toLowerCase();
    
    for (const [domain, data] of Object.entries(this.patterns.domainExpertise)) {
      const allKeywords = [
        ...(data.technologies || []),
        ...(data.concepts || []),
        ...(data.practices || []),
        ...(data.tools || []),
        ...(data.domains || []),
        ...(data.areas || [])
      ];
      
      if (allKeywords.some(keyword => normalizedText.includes(keyword.toLowerCase()))) {
        expertise.push(domain);
      }
    }
    
    return expertise;
  }

  private determineResponseStrategy(questionType: string, context: string[]): string {
    if (!this.patterns?.responseStrategies) return 'direct';
    
    // Map question types to response strategies
    const strategyMap: { [key: string]: string } = {
      'experience_question': 'storytelling',
      'challenge_question': 'storytelling',
      'achievement_question': 'storytelling',
      'technology_question': 'educational',
      'skill_question': 'educational',
      'how_question': 'educational',
      'advice_question': 'consultative',
      'future_question': 'consultative',
      'comparison_question': 'consultative',
      'yes_no_question': 'direct',
      'greeting': 'direct',
      'farewell': 'direct'
    };
    
    return strategyMap[questionType] || 'direct';
  }

  private estimateReadTime(questionType: string): string {
    if (!this.patterns?.complexityLevels) return '30 seconds';
    
    // Map question types to complexity and read time
    const complexQuestions = ['experience_question', 'challenge_question', 'technology_question'];
    const moderateQuestions = ['skill_question', 'work_question', 'personal_question'];
    
    if (complexQuestions.includes(questionType)) {
      return this.patterns.complexityLevels['complex']?.estimatedReadTime || '2-3 minutes';
    } else if (moderateQuestions.includes(questionType)) {
      return this.patterns.complexityLevels['moderate']?.estimatedReadTime || '1-2 minutes';
    } else {
      return this.patterns.complexityLevels['simple']?.estimatedReadTime || '30 seconds';
    }
  }

  private detectComplexity(text: string, questionType: string): 'simple' | 'moderate' | 'complex' {
    let complexityScore = 0;
    
    // Length factor
    if (text.length > 100) complexityScore += 1;
    if (text.length > 200) complexityScore += 1;
    
    // Question type factor
    if (questionType.includes('comparison') || questionType.includes('opinion')) complexityScore += 2;
    if (questionType.includes('how') || questionType.includes('why')) complexityScore += 1;
    
    // Technical keywords
    const technicalKeywords = ['angular', 'react', 'javascript', 'typescript', 'framework', 'architecture'];
    if (technicalKeywords.some(keyword => text.includes(keyword))) complexityScore += 1;
    
    // Multiple questions
    if (text.split('?').length > 2) complexityScore += 1;
    
    if (complexityScore >= 4) return 'complex';
    if (complexityScore >= 2) return 'moderate';
    return 'simple';
  }

  private detectIntent(text: string): string[] {
    if (!this.patterns?.intentAnalysis) return [];
    
    const intents: string[] = [];
    
    for (const [intentName, intentData] of Object.entries(this.patterns.intentAnalysis)) {
      for (const pattern of intentData.patterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(text)) {
          intents.push(intentName);
          break;
        }
      }
    }
    
    return intents;
  }

  private determinePriority(questionType: string, isGreeting: boolean, isFarewell: boolean): 'low' | 'medium' | 'high' {
    if (isGreeting || isFarewell) return 'high';
    if (questionType === 'yes_no_question') return 'high';
    if (questionType === 'personal_question') return 'medium';
    if (questionType === 'work_question' || questionType === 'skill_question') return 'medium';
    return 'low';
  }
}
