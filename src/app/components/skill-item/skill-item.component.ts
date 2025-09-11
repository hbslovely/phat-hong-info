import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

export interface SkillLevel {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years: number;
}

type ExperienceLevels = Record<SkillLevel['level'], SkillLevel>;

@Component({
  selector: 'app-skill-item',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule
  ],
  templateUrl: './skill-item.component.html',
  styleUrls: ['./skill-item.component.scss']
})
export class SkillItemComponent {
  @Input() name = '';
  @Input() experience = '';
  @Input() clickable = true;
  @Input() color = '';
  @Input() experiencePercentage = 0;
  @Output() onClick = new EventEmitter<void>();

  private readonly experienceLevels: ExperienceLevels = {
    beginner: { level: 'beginner', years: 1 },
    intermediate: { level: 'intermediate', years: 3 },
    advanced: { level: 'advanced', years: 5 },
    expert: { level: 'expert', years: 8 }
  };

  handleClick(): void {
    if (this.clickable) {
      this.onClick.emit();
    }
  }

  getExperienceLevel(): SkillLevel {
    const years = this.getYearsOfExperience();
    
    if (years >= this.experienceLevels['expert'].years) return this.experienceLevels['expert'];
    if (years >= this.experienceLevels['advanced'].years) return this.experienceLevels['advanced'];
    if (years >= this.experienceLevels['intermediate'].years) return this.experienceLevels['intermediate'];
    return this.experienceLevels['beginner'];
  }

  getExperiencePercentage(): number {
    if (this.experiencePercentage > 0) {
      return this.experiencePercentage;
    }
    const years = this.getYearsOfExperience();
    return Math.min(100, (years / this.experienceLevels['expert'].years) * 100);
  }

  formatExperience(): string {
    if (!this.experience) return '';
    
    if (this.experience.includes('project')) {
      const count = parseInt(this.experience);
      return `${count} project${count > 1 ? 's' : ''}`;
    }
    
    const years = parseFloat(this.experience);
    return `${years} year${years > 1 ? 's' : ''}`;
  }

  private getYearsOfExperience(): number {
    if (!this.experience) return 0;
    
    if (this.experience.includes('project')) {
      const projects = parseInt(this.experience);
      return !isNaN(projects) ? Math.min(projects / 2, 8) : 0;
    }
    
    const years = parseFloat(this.experience);
    return !isNaN(years) ? years : 0;
  }
} 