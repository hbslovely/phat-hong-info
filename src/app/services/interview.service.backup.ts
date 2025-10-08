import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { CVService } from './cv.service';
import { PersonalInfo, WorkExperience, Skills } from '../models/cv.models';
import { QuestionAnalysisService, QuestionAnalysis } from './question-analysis.service';
import { ConversationManagerService } from './conversation-manager.service';
import { ResponseManagementService } from './response-management.service';
import { ScoringService } from './scoring.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface InterviewSession {
  id: string;
  messages: ChatMessage[];
  isActive: boolean;
  startTime: Date;
}

interface InterviewResponse {
  id?: string;
  keywords: string[];
  answer: string;
  yes?: string;
  no?: string;
}

interface InterviewData {
  responses: InterviewResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private currentSession = new BehaviorSubject<InterviewSession | null>(null);
  private isTyping = new BehaviorSubject<boolean>(false);
  private interviewData: InterviewData | null = null;
  private lastResponseId: string | null = null; // Track last response for follow-up
  
  currentSession$ = this.currentSession.asObservable();
  isTyping$ = this.isTyping.asObservable();

  constructor(
    private http: HttpClient,
    private cvService: CVService,
    private questionAnalysisService: QuestionAnalysisService,
    private conversationManagerService: ConversationManagerService,
    private responseManagementService: ResponseManagementService,
    private scoringService: ScoringService
  ) {
    this.loadInterviewData();
  }

  private async loadInterviewData(): Promise<void> {
    try {
      const data = await this.http.get<InterviewData>('assets/json/interview-responses.json').toPromise();
      this.interviewData = data || null;
    } catch (error) {
      console.error('Failed to load interview data:', error);
      this.interviewData = null;
    }
  }

  startInterview(): InterviewSession {
    const personalInfo = this.cvService.cv()?.personalInfo;
    const experience = this.cvService.cv()?.experience?.workExperience;
    const skills = this.cvService.cv()?.skills;

    const systemPrompt = this.createSystemPrompt(personalInfo, experience, skills);
    
    const session: InterviewSession = {
      id: this.generateSessionId(),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: 'Xin chào! Tôi là Phát - Senior Software Developer với hơn 10 năm kinh nghiệm. Tôi rất vui được trò chuyện với bạn. Bạn có muốn tôi giới thiệu về bản thân hoặc có câu hỏi nào về kinh nghiệm làm việc của tôi không?',
          timestamp: new Date()
        }
      ],
      isActive: true,
      startTime: new Date()
    };

    this.currentSession.next(session);
    return session;
  }

  async sendMessage(message: string): Promise<void> {
    const session = this.currentSession.value;
    if (!session) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    session.messages.push(userMessage);
    this.currentSession.next(session);
    this.isTyping.next(true);

    try {
      // Add thinking delay for more natural conversation
      const thinkingTime = Math.random() * 2000 + 1000; // 1-3 seconds
      await new Promise(resolve => setTimeout(resolve, thinkingTime));
      
      // Call OpenAI API
      const response = await this.callOpenAI(session.messages);
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      session.messages.push(assistantMessage);
      this.currentSession.next(session);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        role: 'assistant',
        content: 'Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Bạn có thể thử lại sau được không? Hoặc bạn có thể liên hệ trực tiếp với tôi qua LinkedIn.',
        timestamp: new Date()
      };

      session.messages.push(fallbackMessage);
      this.currentSession.next(session);
    } finally {
      this.isTyping.next(false);
    }
  }

  private async callOpenAI(messages: ChatMessage[]): Promise<string> {
    // Use smart keyword matching with JSON responses
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop();
    
    if (lastUserMessage && this.interviewData) {
      return this.findBestResponse(lastUserMessage.content);
    }
    
    // Fallback if no data loaded
    return this.getDefaultResponse();
  }

  private findBestResponse(userMessage: string): string {
    if (!this.interviewData || !this.interviewData.responses) {
      return this.getDefaultResponse();
    }

    // Analyze the question first
    const analysis = this.questionAnalysisService.analyzeQuestion(userMessage);
    
    // Handle greetings and farewells with high priority
    if (analysis.isGreeting) {
      const greetingResponse = this.findResponseById('1');
      if (greetingResponse) {
        this.lastResponseId = greetingResponse.id || null;
        return greetingResponse.answer;
      }
    }
    
    if (analysis.isFarewell) {
      const farewellResponse = this.findResponseById('3');
      if (farewellResponse) {
        this.lastResponseId = null;
        return farewellResponse.answer;
      }
    }

    const normalizedMessage = this.normalizeVietnamese(userMessage.toLowerCase());
    
    // Check if this is a yes/no response to a previous question
    if (this.lastResponseId) {
      if (this.isYesResponse(normalizedMessage)) {
        return this.handleYesResponse();
      }
      
      if (this.isNoResponse(normalizedMessage)) {
        this.lastResponseId = null; // Reset follow-up tracking
        const noResponse = this.findResponseById('100');
        return noResponse ? noResponse.answer : this.getDefaultResponse();
      }
    }
    
    let matches: Array<{response: InterviewResponse, score: number}> = [];

    // Find all matching responses based on keywords
    for (const response of this.interviewData.responses) {
      // Skip special trigger responses from normal matching
      if (response.id === '999' || response.answer === 'trigger_yes') {
        continue;
      }
      
      let score = 0;
      let keywordPosition = 0;

      for (const keyword of response.keywords) {
        const normalizedKeyword = this.normalizeVietnamese(keyword.toLowerCase());
        
        if (normalizedMessage.includes(normalizedKeyword)) {
          // Earlier keywords have higher weight
          const positionWeight = response.keywords.length - keywordPosition;
          score += positionWeight * 10;
          
          // Bonus for exact word match (not just substring)
          const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegExp(normalizedKeyword)}\\b`);
          if (wordBoundaryRegex.test(normalizedMessage)) {
            score += 5;
          }
          
          // Boost score if question analysis indicates this is personal info
          if (analysis.isPersonalInfo && this.isPersonalInfoResponse(response)) {
            score += 15;
          }
          
          // Boost score based on question type match
          if (this.matchesQuestionType(response, analysis.type)) {
            score += 10;
          }
        }
        keywordPosition++;
      }

      if (score > 0) {
        matches.push({ response, score });
      }
    }

    // Sort matches by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
      // If no matches found but it's clearly a question about personal info, 
      // don't use default "xin lỗi" response
      if (analysis.isQuestion && analysis.isPersonalInfo) {
        return 'Tôi chưa có thông tin cụ thể về câu hỏi này. Bạn có thể hỏi tôi về kinh nghiệm làm việc, kỹ năng, sở thích, hoặc thông tin cá nhân khác không?';
      }
      return this.getDefaultResponse();
    }

    // Check if we have multiple high-scoring matches (for multi-part questions)
    const topScore = matches[0].score;
    const highScoreMatches = matches.filter(match => match.score >= topScore * 0.7); // 70% of top score

    if (highScoreMatches.length > 1) {
      // Check if one of the matches is more specific (higher score) and should take priority
      const specificMatches = highScoreMatches.filter(match => match.score === topScore);
      
      if (specificMatches.length === 1) {
        // One specific match should take priority
        const bestMatch = specificMatches[0].response;
        
        // Check if this response has follow-up options
        if (bestMatch.yes || bestMatch.no) {
          this.lastResponseId = bestMatch.id || null;
        } else {
          this.lastResponseId = null;
        }
        
        return bestMatch.answer;
      } else {
        // Multiple relevant responses - combine them
        const combinedAnswers = highScoreMatches.map(match => match.response.answer).join('\n\n');
        
        // Check if any response has follow-up options (use the first one)
        const firstMatch = highScoreMatches[0].response;
        if (firstMatch.yes || firstMatch.no) {
          this.lastResponseId = firstMatch.id || null;
        } else {
          this.lastResponseId = null;
        }
        
        return combinedAnswers;
      }
    } else {
      // Single best match
      const bestMatch = matches[0].response;
      
      // Check if this response has follow-up options
      if (bestMatch.yes || bestMatch.no) {
        this.lastResponseId = bestMatch.id || null;
      } else {
        this.lastResponseId = null;
      }
      
      return bestMatch.answer;
    }
  }

  private isPersonalInfoResponse(response: InterviewResponse): boolean {
    const personalKeywords = ['tên', 'tuổi', 'sở thích', 'gia đình', 'quê', 'học', 'name', 'age', 'hobby', 'family', 'education'];
    return response.keywords.some(keyword => 
      personalKeywords.some(pk => keyword.toLowerCase().includes(pk))
    );
  }

  private matchesQuestionType(response: InterviewResponse, questionType: string): boolean {
    const typeMapping: { [key: string]: string[] } = {
      'what_question': ['gì', 'what', 'là gì'],
      'where_question': ['đâu', 'where', 'ở đâu'],
      'why_question': ['tại sao', 'why', 'lý do'],
      'how_question': ['thế nào', 'how', 'cách'],
      'experience_question': ['kinh nghiệm', 'experience', 'career'],
      'skill_question': ['kỹ năng', 'skills', 'công nghệ'],
      'personal_question': ['tên', 'tuổi', 'sở thích', 'name', 'age', 'hobby'],
      'work_question': ['công việc', 'job', 'work', 'dự án']
    };

    const relevantKeywords = typeMapping[questionType] || [];
    return response.keywords.some(keyword => 
      relevantKeywords.some(rk => keyword.toLowerCase().includes(rk))
    );
  }

  private findResponseById(id: string): InterviewResponse | null {
    if (!this.interviewData || !this.interviewData.responses) {
      return null;
    }
    return this.interviewData.responses.find(response => response.id === id) || null;
  }

  private isYesResponse(normalizedMessage: string): boolean {
    const yesKeywords = ['co', 'yes', 'ok', 'duoc', 'vang', 'u', 'dong y', 'sure', 'of course', 'definitely'];
    return yesKeywords.some(keyword => normalizedMessage.includes(keyword));
  }

  private isNoResponse(normalizedMessage: string): boolean {
    const noKeywords = ['khong', 'no', 'nope', 'khong can', 'thoi'];
    return noKeywords.some(keyword => normalizedMessage.includes(keyword));
  }

  private handleYesResponse(): string {
    if (!this.lastResponseId) {
      return this.getDefaultResponse();
    }

    const lastResponse = this.findResponseById(this.lastResponseId);
    if (lastResponse && lastResponse.yes) {
      const yesResponse = this.findResponseById(lastResponse.yes);
      this.lastResponseId = null; // Reset follow-up tracking
      return yesResponse ? yesResponse.answer : this.getDefaultResponse();
    }

    this.lastResponseId = null;
    return this.getDefaultResponse();
  }

  private normalizeVietnamese(text: string): string {
    // Remove Vietnamese diacritics
    const vietnameseMap: { [key: string]: string } = {
      'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
      'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
      'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
      'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
      'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
      'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
      'đ': 'd',
      'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
      'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
      'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
      'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
      'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
      'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
      'Đ': 'D'
    };

    return text.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g, function(match) {
      return vietnameseMap[match] || match;
    });
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getDefaultResponse(): string {
    return 'Xin lỗi, hiện tại tôi chỉ trả lời các câu hỏi về thông tin cá nhân, kinh nghiệm làm việc và kỹ năng của tôi thôi. Bạn có muốn hỏi gì khác về background, dự án, hoặc sở thích của tôi không?';
  }

  private createSystemPrompt(personalInfo: any, experience: any, skills: any): string {
    return `Bạn là Hong Phung Phat (Phát), một Senior Software Developer từ TP. Hồ Chí Minh, Việt Nam. Hãy trả lời như chính bản thân Phát với thông tin sau:

THÔNG TIN CÁ NHÂN:
- Tên: ${personalInfo?.name || 'Hong Phung Phat'}
- Tuổi: ${this.calculateAge(personalInfo?.dateOfBirth)} tuổi (sinh ${personalInfo?.dateOfBirth})
- Địa chỉ: ${personalInfo?.location?.city}, ${personalInfo?.location?.country}
- Email: ${personalInfo?.contact?.email}
- LinkedIn: ${personalInfo?.contact?.linkedin}
- Ngôn ngữ: Tiếng Việt (bản địa), Tiếng Anh (trình độ làm việc)

KINH NGHIỆM LÀM VIỆC:
${this.formatExperience(experience)}

KỸ NĂNG CHUYÊN MÔN:
${this.formatSkills(skills)}

TÓM TẮT:
${personalInfo?.summary}

HƯỚNG DẪN TRẢ LỜI:
1. Trả lời bằng tiếng Việt một cách tự nhiên và thân thiện
2. Sử dụng ngôi thứ nhất ("tôi", "mình") 
3. Chia sẻ kinh nghiệm cụ thể khi được hỏi
4. Thể hiện sự nhiệt tình và chuyên nghiệp
5. Nếu không biết thông tin, hãy thành thật nói không biết
6. Giữ câu trả lời ngắn gọn nhưng đầy đủ thông tin (khoảng 2-4 câu)
7. Có thể kể về dự án, thử thách, và thành tựu cụ thể

Hãy trả lời như một người thật đang trong buổi phỏng vấn hoặc trò chuyện công việc.`;
  }

  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 32; // Default age
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private formatExperience(experience: any[]): string {
    if (!experience || !Array.isArray(experience)) return '';
    
    return experience.map(exp => 
      `- ${exp.position} tại ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.responsibilities?.join(', ') || ''}`
    ).join('\n');
  }

  private formatSkills(skills: any): string {
    if (!skills) return '';
    
    let skillText = '';
    if (skills.technicalSkills) {
      // Technical skills is an object with categories
      Object.keys(skills.technicalSkills).forEach(category => {
        const categorySkills = skills.technicalSkills[category];
        if (Array.isArray(categorySkills) && categorySkills.length > 0) {
          skillText += `${category}: ${categorySkills.join(', ')}\n`;
        }
      });
    }
    
    if (skills.softSkills && Array.isArray(skills.softSkills)) {
      skillText += `Soft Skills: ${skills.softSkills.join(', ')}\n`;
    }
    
    if (skills.languages) {
      const languageEntries = Object.entries(skills.languages).map(([lang, level]) => `${lang} (${level})`);
      skillText += `Languages: ${languageEntries.join(', ')}\n`;
    }
    
    return skillText;
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  endInterview(): void {
    const session = this.currentSession.value;
    if (session) {
      session.isActive = false;
      this.currentSession.next(session);
    }
  }

  clearSession(): void {
    this.currentSession.next(null);
  }
}
