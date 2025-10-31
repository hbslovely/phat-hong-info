import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CVService } from '../../services/cv.service';

@Component({
  selector: 'app-v2-experience',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzTypographyModule,
    NzTagModule,
    NzTimelineModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './v2-experience.component.html',
  styleUrls: ['./v2-experience.component.scss']
})
export class V2ExperienceComponent {
  private readonly cvService = inject(CVService);

  readonly cv = this.cvService.cv;

  readonly experiences = computed(() => this.cv()?.experience?.workExperience || []);

  get totalYearsExperience(): number {
    return 5; // Calculate from experience data
  }

  get totalCompanies(): number {
    return this.experiences().length;
  }

  get totalProjects(): number {
    return this.cv()?.projects?.projects?.length || 0;
  }

  readonly skillCategories = [
    {
      name: 'Frontend Development',
      icon: 'desktop',
      skills: ['Angular', 'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'SCSS']
    },
    {
      name: 'Backend Development',
      icon: 'server',
      skills: ['Node.js', 'Java', 'Spring Boot', 'REST APIs', 'GraphQL', 'Microservices']
    },
    {
      name: 'Tools & Technologies',
      icon: 'tool',
      skills: ['Git', 'Docker', 'Jenkins', 'AWS', 'MongoDB', 'PostgreSQL']
    }
  ];
}
