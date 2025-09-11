import { Component, inject, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalInfoComponent } from '../../components/personal-info/personal-info.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { CVService } from '../../services/cv.service';
import { AboutPageProps } from './about.types';
import { ABOUT_PAGE_CONFIG, ABOUT_PAGE_SECTIONS } from './about.constants';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { RouterModule } from '@angular/router';
import { Project } from '../../models/cv.models';
import { CustomModalService } from '../../services/custom-modal.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    PersonalInfoComponent,
    PageHeaderComponent,
    NzIconModule,
    RouterModule,
    NzModalModule,
    TranslateModule
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  private readonly cvService = inject(CVService);
  private readonly modalService = inject(CustomModalService);

  // Constants
  readonly config: AboutPageProps = ABOUT_PAGE_CONFIG;
  readonly sections = ABOUT_PAGE_SECTIONS;

  // State
  readonly cv = this.cvService.cv;
  isMobileView = false;

  ngOnInit() {
    this.checkIfMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
  }

  private checkIfMobile(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  // Featured projects - get the 2 most recent projects
  readonly featuredProjects = computed(() => {
    const projects = this.cv()?.projects?.projects || [];
    return projects.slice(0, 2);
  });

  // Featured skill categories - get the 3 most important categories
  readonly featuredSkillCategories = computed(() => {
    const skills = this.cv()?.skills?.technicalSkills || {};
    const priorityCategories = ['programmingLanguages', 'frameworks', 'libraries'];

    return Object.keys(skills)
      .filter(category => priorityCategories.includes(category))
      .slice(0, 3);
  });

  // Helper methods for skills
  getSkillsForCategory(category: string): string[] {
    return this.cv()?.skills?.technicalSkills?.[category] || [];
  }

  formatCategoryName(category: string): string {
    // Convert camelCase to Title Case with spaces
    return category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  showFullscreenAvatar(): void {
    this.modalService.create({
      nzTitle: undefined,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: true,
      nzCentered: true,
      nzClassName: 'avatar-modal',
      nzContent: `
        <div class="fullscreen-avatar">
          <img 
            src="assets/images/avatar.jpeg" 
            alt="Profile Picture"
          >
        </div>
      `,
      nzWidth: this.isMobileView ? '90%' : 'auto',
      nzBodyStyle: { padding: '0' },
      nzStyle: { top: this.isMobileView ? '20px' : '20px' }
    });
  }
}
