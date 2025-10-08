import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { QuestionAnalysisService, QuestionAnalysis } from './question-analysis.service';
import { ConversationManagerService } from './conversation-manager.service';
import { ResponseManagementService } from './response-management.service';
import { ScoringService } from './scoring.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  analysis?: QuestionAnalysis;
  confidence?: number;
}

export interface InterviewSession {
  id: string;
  messages: ChatMessage[];
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  totalMessages: number;
  averageConfidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private currentSession = new BehaviorSubject<InterviewSession | null>(null);
  private isTyping = new BehaviorSubject<boolean>(false);
  
  currentSession$ = this.currentSession.asObservable();
  isTyping$ = this.isTyping.asObservable();

  constructor(
    private http: HttpClient,
    private questionAnalysisService: QuestionAnalysisService,
    private conversationManagerService: ConversationManagerService,
    private responseManagementService: ResponseManagementService,
    private scoringService: ScoringService
  ) {}

  public startInterview(): InterviewSession {
    const session: InterviewSession = {
      id: this.generateSessionId(),
      messages: [
        {
          role: 'assistant',
          content: 'Xin chào! Tôi là Phát - Senior Software Developer với hơn 10 năm kinh nghiệm. Tôi rất vui được trò chuyện với bạn. Bạn có muốn tôi giới thiệu về bản thân hoặc có câu hỏi nào về kinh nghiệm làm việc của tôi không?',
          timestamp: new Date(),
          confidence: 100
        }
      ],
      isActive: true,
      startTime: new Date(),
      totalMessages: 1,
      averageConfidence: 100
    };

    this.currentSession.next(session);
    return session;
  }

  public async sendMessage(message: string): Promise<void> {
    const session = this.currentSession.value;
    if (!session || !message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    session.messages.push(userMessage);
    session.totalMessages++;
    this.currentSession.next(session);
    this.isTyping.next(true);

    try {
      // Add thinking delay for more natural conversation
      const thinkingTime = Math.random() * 2000 + 1000; // 1-3 seconds
      await new Promise(resolve => setTimeout(resolve, thinkingTime));
      
      // Analyze the question
      const analysis = this.questionAnalysisService.analyzeQuestion(message);
      
      // Process message through conversation manager
      const result = await this.conversationManagerService.processUserMessage(message, analysis);
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        analysis,
        confidence: result.selectionResult.confidence
      };

      session.messages.push(assistantMessage);
      session.totalMessages++;
      
      // Update session statistics
      this.updateSessionStatistics(session);
      
      this.currentSession.next(session);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add fallback response
      const fallbackMessage: ChatMessage = {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Bạn có thể thử hỏi lại câu hỏi khác không?',
        timestamp: new Date(),
        confidence: 0
      };
      
      session.messages.push(fallbackMessage);
      session.totalMessages++;
      this.currentSession.next(session);
      
    } finally {
      this.isTyping.next(false);
    }
  }

  public endInterview(): void {
    const session = this.currentSession.value;
    if (session) {
      session.isActive = false;
      session.endTime = new Date();
      this.currentSession.next(session);
    }
  }

  public closeInterview(): void {
    this.conversationManagerService.resetContext();
    this.currentSession.next(null);
    this.isTyping.next(false);
  }

  public getVisibleMessages(): ChatMessage[] {
    const session = this.currentSession.value;
    if (!session) return [];
    
    // Filter out system messages for display
    return session.messages.filter(msg => msg.role !== 'system');
  }

  public getCurrentSession(): InterviewSession | null {
    return this.currentSession.value;
  }

  public getSessionStatistics(): {
    totalMessages: number;
    averageConfidence: number;
    duration: number;
    topTopics: string[];
  } {
    const session = this.currentSession.value;
    if (!session) {
      return {
        totalMessages: 0,
        averageConfidence: 0,
        duration: 0,
        topTopics: []
      };
    }

    const duration = session.endTime 
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime();

    const topTopics = this.extractTopTopics(session);

    return {
      totalMessages: session.totalMessages,
      averageConfidence: session.averageConfidence,
      duration: Math.floor(duration / 1000), // in seconds
      topTopics
    };
  }

  private generateSessionId(): string {
    return 'interview_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private updateSessionStatistics(session: InterviewSession): void {
    const assistantMessages = session.messages.filter(msg => 
      msg.role === 'assistant' && msg.confidence !== undefined
    );
    
    if (assistantMessages.length > 0) {
      const totalConfidence = assistantMessages.reduce((sum, msg) => sum + (msg.confidence || 0), 0);
      session.averageConfidence = totalConfidence / assistantMessages.length;
    }
  }

  private extractTopTopics(session: InterviewSession): string[] {
    const topicCounts: { [key: string]: number } = {};
    
    session.messages.forEach(msg => {
      if (msg.analysis && msg.analysis.context) {
        msg.analysis.context.forEach(context => {
          topicCounts[context] = (topicCounts[context] || 0) + 1;
        });
      }
    });

    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  // Utility methods for backwards compatibility
  public formatTime(date: Date): string {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  public getCurrentTime(): string {
    return this.formatTime(new Date());
  }

  // Debug methods for development
  public getAnalysisForMessage(messageIndex: number): QuestionAnalysis | null {
    const session = this.currentSession.value;
    if (!session || !session.messages[messageIndex]) return null;
    
    return session.messages[messageIndex].analysis || null;
  }

  public getConversationHistory() {
    return this.conversationManagerService.getConversationHistory();
  }

  public getUserPreferences() {
    return this.conversationManagerService.getUserPreferences();
  }
}
