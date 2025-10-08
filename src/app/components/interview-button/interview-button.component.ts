import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { InterviewChatComponent } from '../interview-chat/interview-chat.component';

@Component({
  selector: 'app-interview-button',
  imports: [CommonModule, NzIconModule, InterviewChatComponent],
  templateUrl: './interview-button.component.html',
  styleUrl: './interview-button.component.scss'
})
export class InterviewButtonComponent implements OnInit, OnDestroy {
  @ViewChild(InterviewChatComponent) interviewChat!: InterviewChatComponent;
  
  isMobile = false;
  isShaking = false;
  private shakeInterval: any;
  private shakeTimeout: any;

  ngOnInit() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.setupShakeAnimation();
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private clearTimers() {
    if (this.shakeInterval) {
      clearInterval(this.shakeInterval);
    }
    if (this.shakeTimeout) {
      clearTimeout(this.shakeTimeout);
    }
  }

  private setupShakeAnimation() {
    // Shake every 15 seconds (different from contact button)
    this.shakeInterval = setInterval(() => {
      this.startShake();
    }, 15000);
  }

  private startShake() {
    if (!this.isShaking) {
      this.isShaking = true;
      this.shakeTimeout = setTimeout(() => {
        this.isShaking = false;
      }, 1000);
    }
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.isShaking) {
      this.startShake();
    }
  }

  getIconType(): string {
    return 'message';
  }

  getTooltipText(): string {
    return 'Phỏng vấn tôi';
  }

  openInterview() {
    if (this.interviewChat) {
      this.interviewChat.openInterview();
    }
  }
}
