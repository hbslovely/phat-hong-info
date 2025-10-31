import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CVService } from '../../services/cv.service';
import { Project } from '../../models/cv.models';

@Component({
  selector: 'app-v2-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzIconModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzTagModule,
    NzInputModule,
    NzSelectModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './v2-projects.component.html',
  styleUrls: ['./v2-projects.component.scss']
})
export class V2ProjectsComponent {
  private readonly cvService = inject(CVService);

  readonly cv = this.cvService.cv;
  readonly projects = computed(() => this.cv()?.projects?.projects || []);

  readonly selectedCategory = signal<string>('all');
  readonly searchTerm = signal<string>('');

  get totalProjects(): number {
    return this.projects().length;
  }

  get totalTechnologies(): number {
    const allTechs = this.projects().flatMap(p => p.technologies);
    return new Set(allTechs).size;
  }

  get activeProjects(): number {
    return this.projects().filter(p => p.status === 'Active').length;
  }

  readonly filteredProjects = computed(() => {
    let filtered = this.projects();

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.technologies.some(tech => tech.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(project => {
        const category = this.selectedCategory();
        if (category === 'web') {
          return project.technologies.some(tech => 
            ['Angular', 'React', 'Vue', 'HTML', 'CSS', 'JavaScript'].includes(tech)
          );
        }
        if (category === 'mobile') {
          return project.technologies.some(tech => 
            ['React Native', 'Flutter', 'iOS', 'Android'].includes(tech)
          );
        }
        if (category === 'api') {
          return project.technologies.some(tech => 
            ['Node.js', 'Express', 'REST', 'GraphQL', 'API'].includes(tech)
          );
        }
        return true;
      });
    }

    return filtered;
  });

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  onSearchChange(): void {
    // Search is reactive through signal
  }

  clearFilters(): void {
    this.selectedCategory.set('all');
    this.searchTerm.set('');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active': return 'green';
      case 'Completed': return 'blue';
      case 'Maintenance': return 'orange';
      default: return 'default';
    }
  }
}
