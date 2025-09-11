import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { TranslateModule } from '@ngx-translate/core';
import { PersonalInfo } from '../../models/cv.models';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, NzIconModule, NzTagModule, TranslateModule],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent {
  @Input() info?: PersonalInfo;

  emailCopied = signal(false);
  phoneCopied = signal(false);

  copyToClipboard(event: Event, text?: string) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const isEmail = text.includes('@');
      if (isEmail) {
        this.emailCopied.set(true);
        setTimeout(() => this.emailCopied.set(false), 2000);
      } else {
        this.phoneCopied.set(true);
        setTimeout(() => this.phoneCopied.set(false), 2000);
      }
    });
  }

  showFullscreenAvatar() {
    // Existing method
  }

  getLangColor(level: string): string {
    const colorMap: Record<string, string> = {
      'Native': 'green',
      'Fluent': 'blue',
      'Professional': 'geekblue',
      'Working Proficiency': 'cyan',
      'Elementary': 'orange'
    };
    return colorMap[level] || 'blue';
  }

  getInterestIcon(interest: string): string {
    const iconMap: Record<string, string> = {
      'AI': 'robot',
      'Machine Learning': 'experiment',
      'Cloud Computing': 'cloud',
      'DevOps': 'cluster',
      'Web Development': 'global',
      'Mobile Development': 'mobile',
      'UI/UX': 'layout',
      'Security': 'safety',
      'Blockchain': 'link',
      'IoT': 'api',
      'Data Science': 'bar-chart',
      'Performance': 'dashboard',
      'Architecture': 'cluster',
      'Fintech': 'bank'
    };
    return iconMap[interest] || 'star';
  }
} 