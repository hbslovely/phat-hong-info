import { Component, OnInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { CVService } from '../../services/cv.service';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
import { SkillItemComponent } from '../../components/skill-item/skill-item.component';
import { SkillDetailComponent, SkillInfo } from '../../components/skill-detail/skill-detail.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { CustomModalService } from '../../services/custom-modal.service';

// Extended SkillInfo interface to include experience
interface ExtendedSkillInfo extends SkillInfo {
  experience?: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
    imports: [
        CommonModule,
        NzIconModule,
        NzModalModule,
        TranslateModule,
        PageHeaderComponent,
        SectionHeaderComponent,
        SkillItemComponent,
        SkillDetailComponent,
        RouterLink
    ],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {
  @ViewChild('skillDetailDialog') skillDetailDialog!: TemplateRef<any>;

  selectedSkill: SkillInfo | null = null;
  selectedSkillProjectCount = 0;

  private readonly cvService = inject(CVService);
  private readonly modalService = inject(CustomModalService);
  private readonly translate = inject(TranslateService);
  cv = this.cvService.cv;
  modalRef: any;

  config = {
    className: 'skills-page',
    maxWidth: 1200
  };

  // Top skills to feature (add or modify as needed)
  private readonly featuredSkillsList = [
    'Angular',
    'ReactJS',
    'TypeScript',
    'JavaScript'
  ];

  protected readonly Object = Object;
  private skillsInfo: { [key: string]: ExtendedSkillInfo } = {};

  async ngOnInit() {
    await this.loadSkillDetails();
    this.translate.onLangChange.subscribe(() => {
      this.loadSkillDetails();
    });
  }

  private async loadSkillDetails() {
    try {
      const response = await fetch(`/assets/json/skill-detail.${this.translate.currentLang}.json`);
      this.skillsInfo = await response.json();
    } catch (error) {
      console.error('Error loading skill details:', error);
    }
  }

  // Get featured skills to display prominently
  getFeaturedSkills(): string[] {
    return this.featuredSkillsList;
  }

  // Get skill description for featured skills
  getSkillDescription(skill: string): string {
    const description = this.skillsInfo[skill]?.description;

    if (!description) {
      return `${skill} is one of my core professional skills.`;
    }

    return Array.isArray(description) ? description[0] : description;
  }

  // Get CSS class for experience level badge
  getExperienceClass(skill: string): string {
    const experience = this.getSkillExperience(skill);
    if (!experience) return '';

    const years = parseInt(experience.split(' ')[0]);
    if (years >= 5) return 'expert';
    if (years >= 3) return 'advanced';
    if (years >= 1) return 'intermediate';
    return 'beginner';
  }

  getTechnologyIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      programmingLanguages: 'code',
      frameworks: 'cluster',
      libraries: 'appstore',
      testing: 'bug',
      methodologies: 'deployment-unit',
      tools: 'tool',
      environments: 'desktop',
      frontEnd: 'layout',
      backEnd: 'api',
      database: 'database',
      devOps: 'cloud-server',
      mobile: 'mobile',
      cloud: 'cloud',
      other: 'appstore'
    };
    return iconMap[category] || 'code';
  }

  getTagColor(skill: string): string {
    const colorMap: { [key: string]: string } = {
      Angular: '#DD0031',
      'AngularJS': '#E23237',
      ReactJS: '#61DAFB',
      TypeScript: '#3178C6',
      JavaScript: '#F7DF1E',
      'HTML5': '#E34F26',
      'CSS': '#1572B6',
      'RxJS': '#B7178C',
      'NgRx': '#BA2BD2',
      'Chart.js': '#FF6384',
      'KendoUI': '#FF6358',
      'D3.js': '#F9A03C',
      'jQuery': '#0769AD',
      Git: '#F05032'
    };
    return colorMap[skill] || '#1890ff';
  }

  formatCategory(category: string): string {
    // Convert camelCase to Title Case with spaces
    return category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  getSkillExperience(skill: string): string {
    if (!this.skillsInfo[skill]) return '';
    return this.skillsInfo[skill].experience || '';
  }

  getExperiencePercentage(skill: string): number {
    if (!this.getSkillExperience(skill)) return 0;

    const expText = this.getSkillExperience(skill);
    const years = parseFloat(expText.split(' ')[0]);
    // Normalize to percentage (assuming 10 years is 100%)
    return Math.min(Math.round((years / 10) * 100), 100);
  }

  // View skill details
  showSkillInfo(skill: string): void {
    if (this.skillsInfo[skill]) {
      this.selectedSkill = this.skillsInfo[skill];
      this.selectedSkillProjectCount = (
        this.cv()?.projects?.projects || []
      ).filter(
        project =>
          project.technologies &&
          project.technologies.includes(skill)
      ).length;

      // Check if we're on mobile
      const isMobile = window.innerWidth < 768;

      // Calculate the navbar height for different screen sizes
      const navbarHeight = isMobile ? 50 : 64; // 50px on mobile, 64px on desktop
      const modalTopPosition = navbarHeight; // Add 10px margin from the navbar

      this.modalRef = this.modalService.create({
        nzContent: this.skillDetailDialog,
        nzFooter: null,
        nzWidth: isMobile ? '92%' : '600px',
        nzClassName: 'skill-detail-modal',
        nzCentered: false, // Changed to false to allow custom positioning
        nzMaskClosable: true,
        nzBodyStyle: { padding: '0', maxHeight: `calc(100vh - ${modalTopPosition + 10}px)` },
        nzStyle: { top: `${modalTopPosition}px` }
      });
    }
  }

  closeSkillDetailDialog(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
