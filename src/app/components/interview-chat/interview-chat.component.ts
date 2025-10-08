import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InterviewService, InterviewSession, ChatMessage } from '../../services/interview.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-interview-chat',
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzSpinModule,
    NzTagModule
  ],
  templateUrl: './interview-chat.component.html',
  styleUrl: './interview-chat.component.scss'
})
export class InterviewChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  
  isVisible = false;
  currentSession: InterviewSession | null = null;
  newMessage = '';
  isTyping = false;
  showStats = false;
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private interviewService: InterviewService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.interviewService.currentSession$
      .pipe(takeUntil(this.destroy$))
      .subscribe(session => {
        this.currentSession = session;
        if (session && session.messages.length > 0) {
          this.shouldScrollToBottom = true;
        }
      });

    this.interviewService.isTyping$
      .pipe(takeUntil(this.destroy$))
      .subscribe(typing => {
        this.isTyping = typing;
        if (typing) {
          this.shouldScrollToBottom = true;
        }
      });
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openInterview() {
    this.isVisible = true;
    if (!this.currentSession) {
      this.startNewInterview();
    }
    // Focus on input after modal opens
    setTimeout(() => {
      this.focusInput();
    }, 300);
  }

  closeInterview() {
    this.isVisible = false;
  }

  startNewInterview() {
    try {
      this.interviewService.startInterview();
      this.shouldScrollToBottom = true;
    } catch (error) {
      console.error('Error starting interview:', error);
      this.message.error('Không thể bắt đầu phỏng vấn. Vui lòng kiểm tra cấu hình API key.');
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.currentSession) return;

    const message = this.newMessage.trim();
    this.newMessage = '';
    this.shouldScrollToBottom = true;

    try {
      await this.interviewService.sendMessage(message);
      // Focus back to input after sending message
      setTimeout(() => {
        this.focusInput();
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      this.message.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
      // Still focus back on error
      setTimeout(() => {
        this.focusInput();
      }, 100);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private focusInput() {
    if (this.messageInput && this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
    }
  }

  // Additional methods for the enhanced UI
  canSendMessage(): boolean {
    return this.newMessage.trim().length > 0 && !this.isTyping;
  }

  trackByMessage(index: number, message: ChatMessage): string {
    return `${message.timestamp.getTime()}-${message.role}`;
  }

  formatMessageContent(content: string): string {
    // Basic formatting for technical terms and preserve HTML links
    return content
      .replace(/\b(Angular|React|TypeScript|JavaScript|Node\.js|HTML|CSS)\b/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  getSessionStats() {
    return this.interviewService.getSessionStatistics();
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  getTopicColor(topic: string): string {
    const colors: { [key: string]: string } = {
      'technical': 'blue',
      'personal': 'green',
      'professional': 'purple',
      'educational': 'orange',
      'social': 'cyan',
      'biographical': 'geekblue'
    };
    return colors[topic] || 'default';
  }

  toggleStats() {
    this.showStats = !this.showStats;
  }

  isDevelopmentMode(): boolean {
    return false; // Always return false for now
  }

  exportChat() {
    const messages = this.getVisibleMessages();
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        confidence: msg.confidence
      })),
      statistics: this.getSessionStats()
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-chat-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 100);
    }
  }

  getVisibleMessages(): ChatMessage[] {
    if (!this.currentSession) return [];
    return this.currentSession.messages.filter(msg => msg.role !== 'system');
  }

  formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCurrentTime(): string {
    return this.formatTime(new Date());
  }

  endInterview() {
    this.interviewService.endInterview();
    this.closeInterview();
  }
}
