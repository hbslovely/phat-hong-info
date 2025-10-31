import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CVService } from '../../services/cv.service';

@Component({
  selector: 'app-v2-about',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzTypographyModule,
    NzTagModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './v2-about.component.html',
  styleUrls: ['./v2-about.component.scss']
})
export class V2AboutComponent implements OnInit {
  private readonly cvService = inject(CVService);

  readonly cv = this.cvService.cv;

  readonly personalInfo = computed(() => this.cv()?.personalInfo);
  
  readonly featuredProjects = computed(() => {
    const projects = this.cv()?.projects?.projects || [];
    return projects.slice(0, 2);
  });

  readonly featuredSkillCategories = computed(() => {
    const skills = this.cv()?.skills?.technicalSkills || {};
    const priorityCategories = ['programmingLanguages', 'frameworks', 'libraries'];
    return Object.keys(skills)
      .filter(category => priorityCategories.includes(category))
      .slice(0, 3);
  });

  get totalExperience(): number {
    return 5; // You can calculate this from experience data
  }

  get totalProjects(): number {
    return this.cv()?.projects?.projects?.length || 0;
  }

  get totalSkills(): number {
    const skills = this.cv()?.skills?.technicalSkills || {};
    return Object.values(skills).flat().length;
  }

  readonly features = [
    {
      icon: 'code',
      title: 'Full-Stack Development',
      description: 'End-to-end web application development using modern frameworks and best practices.'
    },
    {
      icon: 'rocket',
      title: 'Performance Optimization',
      description: 'Building fast, scalable applications with optimal user experience and load times.'
    },
    {
      icon: 'team',
      title: 'Collaborative Approach',
      description: 'Working effectively with cross-functional teams to deliver high-quality solutions.'
    }
  ];

  ngOnInit(): void {
    // Component initialization
  }

  getSkillsForCategory(category: string): string[] {
    return this.cv()?.skills?.technicalSkills?.[category] || [];
  }

  formatCategoryName(category: string): string {
    return category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  getSkillColor(skill: string): string {
    const colors = ['blue', 'green', 'orange', 'purple', 'cyan', 'magenta'];
    const index = skill.length % colors.length;
    return colors[index];
  }
}
