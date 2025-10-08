import { Injectable } from '@angular/core';
import { QuestionAnalysis } from './question-analysis.service';
import { ScoringService } from './scoring.service';
import { ResponseManagementService, ResponseSelectionResult } from './response-management.service';

export interface ConversationContext {
  lastResponseId: string | null;
  conversationHistory: Array<{
    userMessage: string;
    response: string;
    timestamp: Date;
    analysis: QuestionAnalysis;
  }>;
  userPreferences: {
    language: 'vi' | 'en' | 'mixed';
    responseStyle: 'concise' | 'detailed' | 'comprehensive';
    technicalLevel: 'basic' | 'intermediate' | 'advanced';
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConversationManagerService {
  private context: ConversationContext = {
    lastResponseId: null,
    conversationHistory: [],
    userPreferences: {
      language: 'mixed',
      responseStyle: 'detailed',
      technicalLevel: 'intermediate'
    }
  };

  constructor(
    private responseManagementService: ResponseManagementService,
    private scoringService: ScoringService
  ) {}

  public async processUserMessage(
    userMessage: string,
    analysis: QuestionAnalysis
  ): Promise<{
    response: string;
    selectionResult: ResponseSelectionResult;
    followUpSuggestions: string[];
  }> {
    
    // Handle follow-up questions based on context
    if (this.context.lastResponseId && this.isFollowUpResponse(userMessage, analysis)) {
      return this.handleFollowUp(userMessage, analysis);
    }

    // Get best response from response management service
    const selectionResult = await this.responseManagementService.selectBestResponse(userMessage, analysis);
    
    // Apply conversation context and personalization
    const personalizedResponse = this.personalizeResponse(selectionResult, analysis);
    
    // Generate follow-up suggestions
    const followUpSuggestions = this.generateFollowUpSuggestions(selectionResult, analysis);
    
    // Update conversation context
    this.updateContext(userMessage, personalizedResponse, analysis, selectionResult);
    
    return {
      response: personalizedResponse,
      selectionResult,
      followUpSuggestions
    };
  }

  private isFollowUpResponse(userMessage: string, analysis: QuestionAnalysis): boolean {
    if (!this.context.lastResponseId) return false;
    
    const yesPatterns = ['có', 'vâng', 'ok', 'được', 'yes', 'sure', 'yeah', 'yep'];
    const noPatterns = ['không', 'no', 'nope', 'thôi', 'chưa'];
    
    const normalizedMessage = userMessage.toLowerCase();
    
    return yesPatterns.some(pattern => normalizedMessage.includes(pattern)) ||
           noPatterns.some(pattern => normalizedMessage.includes(pattern));
  }

  private async handleFollowUp(
    userMessage: string,
    analysis: QuestionAnalysis
  ): Promise<{
    response: string;
    selectionResult: ResponseSelectionResult;
    followUpSuggestions: string[];
  }> {
    
    const normalizedMessage = userMessage.toLowerCase();
    const isYes = ['có', 'vâng', 'ok', 'được', 'yes', 'sure', 'yeah', 'yep']
      .some(pattern => normalizedMessage.includes(pattern));
    
    let targetResponseId: string;
    
    if (isYes) {
      // Find the "yes" target from the last response
      targetResponseId = this.getYesTargetId() || '2'; // Default to introduction
    } else {
      // Find the "no" target or use default
      targetResponseId = this.getNoTargetId() || '100';
    }
    
    const selectionResult = await this.responseManagementService.selectBestResponse(targetResponseId, analysis);
    const followUpSuggestions = this.generateFollowUpSuggestions(selectionResult, analysis);
    
    // Reset follow-up context
    this.context.lastResponseId = null;
    
    return {
      response: selectionResult.selectedResponse.answer,
      selectionResult,
      followUpSuggestions
    };
  }

  private personalizeResponse(selectionResult: ResponseSelectionResult, analysis: QuestionAnalysis): string {
    let response = selectionResult.selectedResponse.answer;
    
    // Apply language preference
    if (this.context.userPreferences.language === 'vi') {
      response = this.extractVietnamesePart(response);
    } else if (this.context.userPreferences.language === 'en') {
      response = this.extractEnglishPart(response);
    }
    
    // Apply response style
    if (this.context.userPreferences.responseStyle === 'concise') {
      response = this.makeConcise(response);
    } else if (this.context.userPreferences.responseStyle === 'comprehensive') {
      response = this.makeComprehensive(response, selectionResult);
    }
    
    // Update last response ID for follow-up tracking
    if (selectionResult.selectedResponse.yes || selectionResult.selectedResponse.no) {
      this.context.lastResponseId = selectionResult.selectedResponse.id || null;
    }
    
    return response;
  }

  private generateFollowUpSuggestions(selectionResult: ResponseSelectionResult, analysis: QuestionAnalysis): string[] {
    const suggestions: string[] = [];
    
    // Based on response category
    if (selectionResult.selectedResponse.category === 'personal') {
      suggestions.push('Bạn có muốn biết thêm về sở thích của tôi?');
      suggestions.push('Tôi có thể chia sẻ về gia đình nếu bạn quan tâm');
    } else if (selectionResult.selectedResponse.category === 'technical') {
      suggestions.push('Bạn có muốn biết về dự án cụ thể nào?');
      suggestions.push('Tôi có thể giải thích chi tiết hơn về công nghệ này');
    } else if (selectionResult.selectedResponse.category === 'professional') {
      suggestions.push('Bạn muốn biết về thử thách trong công việc?');
      suggestions.push('Tôi có thể chia sẻ về môi trường làm việc');
    }
    
    // Based on question type
    if (analysis.type === 'experience_question') {
      suggestions.push('Bạn có muốn biết về dự án cụ thể?');
      suggestions.push('Tôi có thể chia sẻ về thách thức đã gặp');
    }
    
    return suggestions.slice(0, 2); // Limit to 2 suggestions
  }

  private updateContext(
    userMessage: string,
    response: string,
    analysis: QuestionAnalysis,
    selectionResult: ResponseSelectionResult
  ): void {
    this.context.conversationHistory.push({
      userMessage,
      response,
      timestamp: new Date(),
      analysis
    });
    
    // Keep only last 10 exchanges
    if (this.context.conversationHistory.length > 10) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-10);
    }
    
    // Learn user preferences from conversation
    this.updateUserPreferences(analysis, selectionResult);
  }

  private updateUserPreferences(analysis: QuestionAnalysis, selectionResult: ResponseSelectionResult): void {
    // Detect language preference
    const recentMessages = this.context.conversationHistory.slice(-3);
    const englishCount = recentMessages.filter(msg => this.containsEnglish(msg.userMessage)).length;
    const vietnameseCount = recentMessages.filter(msg => this.containsVietnamese(msg.userMessage)).length;
    
    if (englishCount > vietnameseCount) {
      this.context.userPreferences.language = 'en';
    } else if (vietnameseCount > englishCount) {
      this.context.userPreferences.language = 'vi';
    }
    
    // Detect technical level
    if (analysis.context.includes('technical') && analysis.complexity === 'complex') {
      this.context.userPreferences.technicalLevel = 'advanced';
    } else if (analysis.context.includes('technical')) {
      this.context.userPreferences.technicalLevel = 'intermediate';
    }
  }

  private getYesTargetId(): string | null {
    // This would need to be implemented based on the last response data
    // For now, return a default
    return '2'; // Introduction
  }

  private getNoTargetId(): string | null {
    return '100'; // Default "what would you like to know" response
  }

  private extractVietnamesePart(response: string): string {
    if (response.includes(' / ')) {
      return response.split(' / ')[0];
    }
    return response;
  }

  private extractEnglishPart(response: string): string {
    if (response.includes(' / ')) {
      return response.split(' / ')[1] || response;
    }
    return response;
  }

  private makeConcise(response: string): string {
    // Simple implementation - take first sentence or first half
    const sentences = response.split('. ');
    return sentences.length > 2 ? sentences.slice(0, 2).join('. ') + '.' : response;
  }

  private makeComprehensive(response: string, selectionResult: ResponseSelectionResult): string {
    let comprehensive = response;
    
    // Add context from alternative responses if available
    if (selectionResult.alternativeResponses.length > 0) {
      const additionalInfo = selectionResult.alternativeResponses[0].answer;
      if (additionalInfo !== response) {
        comprehensive += '\n\nThêm thông tin: ' + additionalInfo;
      }
    }
    
    return comprehensive;
  }

  private containsEnglish(text: string): boolean {
    return /[a-zA-Z]/.test(text) && /\b(the|and|or|is|are|was|were|have|has|do|does|did)\b/i.test(text);
  }

  private containsVietnamese(text: string): boolean {
    return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(text);
  }

  public getConversationHistory(): ConversationContext['conversationHistory'] {
    return this.context.conversationHistory;
  }

  public getUserPreferences(): ConversationContext['userPreferences'] {
    return this.context.userPreferences;
  }

  public resetContext(): void {
    this.context = {
      lastResponseId: null,
      conversationHistory: [],
      userPreferences: {
        language: 'mixed',
        responseStyle: 'detailed',
        technicalLevel: 'intermediate'
      }
    };
  }
}
