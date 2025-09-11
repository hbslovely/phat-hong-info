import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CVService } from '../../services/cv.service';
import { ExperiencePageProps } from './experience.types';
import {
  EXPERIENCE_PAGE_CONFIG,
  EXPERIENCE_SECTIONS,
  TIMELINE_CONFIG
} from './experience.constants';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
import { TranslateModule } from '@ngx-translate/core';
import { ExperienceCardComponent } from '../../components/experience-card/experience-card.component';
import { EducationCardComponent } from '../../components/education-card/education-card.component';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ContactCtaComponent } from '../../components/contact-cta/contact-cta.component';

// Define a Skill interface since it's not in the models file
interface Skill {
  name: string;
  category: string;
  level?: string;
}

@Component({
  selector: 'app-experience-page',
  standalone: true,
  imports: [
    CommonModule,
    NzTimelineModule,
    NzIconModule,
    SectionHeaderComponent,
    TranslateModule,
    ExperienceCardComponent,
    EducationCardComponent,
    RouterModule,
    PageHeaderComponent,
    ContactCtaComponent
  ],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperiencePageComponent {
  private readonly cvService = inject(CVService);

  // Constants
  readonly config: ExperiencePageProps = EXPERIENCE_PAGE_CONFIG;
  readonly sections = EXPERIENCE_SECTIONS;
  readonly timelineConfig = TIMELINE_CONFIG;

  // State
  readonly cv = this.cvService.cv;

  // Helper method to get company logo filename
  getCompanyLogo(company: string): string {
    // Convert company name to lowercase and replace spaces/special chars with hyphens
    const filename = company.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric chars with hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    return `${filename}.png`;
  }

  openLinkedIn(): void {
    const linkedInUrl = this.cv()?.personalInfo?.contact?.linkedin;
    if (linkedInUrl) {
      window.open(linkedInUrl, '_blank');
    }
  }

  getTotalYearsExperience(): number {
    const currentYear = new Date().getFullYear();
    return currentYear - 2014;
  }

  getTotalProjects(): number {
    const projects = this.cv()?.projects?.projects;
    return projects?.length || 0;
  }

  getTopSkillCategories(limit: number = 3): string[] {
    // Assuming skills is an array of objects with a category property
    const skillsData = this.getSkillsArray();
    if (!skillsData.length) return [];

    // Get unique categories
    const categories = [...new Set(skillsData.map(skill => skill.category))];
    return categories.slice(0, limit);
  }

  getSkillsByCategory(category: string, limit: number = 5): string[] {
    const skillsData = this.getSkillsArray();
    if (!skillsData.length) return [];

    // Filter skills by category and get their names
    const skillNames = skillsData
      .filter(skill => skill.category === category)
      .map(skill => skill.name);

    return skillNames.slice(0, limit);
  }

  // Helper method to convert skills object to array format we need
  private getSkillsArray(): Skill[] {
    const cvData = this.cv();
    if (!cvData || !cvData.skills || !cvData.skills.technicalSkills) {
      return [];
    }

    const result: Skill[] = [];

    // Convert the technicalSkills object to our Skill array format
    Object.entries(cvData.skills.technicalSkills).forEach(([category, skills]) => {
      skills.forEach((skillName: string) => {
        result.push({
          name: skillName,
          category: category
        });
      });
    });

    return result;
  }
}
