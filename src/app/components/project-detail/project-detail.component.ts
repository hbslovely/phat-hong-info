import { Component, EventEmitter, Input, Output, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Project } from '../../models/cv.models';
import { TranslateModule } from '@ngx-translate/core';
import { WatermarkComponent } from '../watermark/watermark.component';
import { CustomModalService } from '../../services/custom-modal.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzButtonModule,
    NzToolTipModule,
    TranslateModule,
    WatermarkComponent
  ]
})
export class ProjectDetailComponent {
  @Input() project!: Project;
  @Input() viewType: 'grid' | 'list' = 'grid';
  @Input() selectedTechnologies: string[] = [];
  @Input() highlightedText = '';
  @Input() isExpanded = false;

  @Output() technologyClick = new EventEmitter<string>();

  @ViewChild('projectDetailDialog') projectDetailDialog!: TemplateRef<any>;

  constructor(private modalService: CustomModalService) {}

  highlightText(text: string): string {
    if (!text || !this.highlightedText) return text;

    const searchRegex = new RegExp(this.highlightedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return text.replace(searchRegex, match => `<mark>${match}</mark>`).trim();
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'in progress':
        return 'blue';
      case 'planned':
        return 'default';
      case 'active':
        return 'volcano';
      default:
        return 'default';
    }
  }

  getStatusTranslationKey(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in progress':
        return 'STATUS.ACTIVE';
      case 'completed':
        return 'STATUS.COMPLETED';
      case 'planned':
        return 'STATUS.PLANNED';
      default:
        return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'check-circle';
      case 'in progress':
      case 'active':
        return 'clock-circle';
      case 'planned':
        return 'calendar';
      default:
        return 'question-circle';
    }
  }

  getLinkIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'github':
        return 'github';
      case 'demo':
        return 'play-circle';
      case 'documentation':
        return 'book';
      default:
        return 'link';
    }
  }

  openProjectDialog(): void {
    this.modalService.create({
      nzTitle: '',
      nzContent: this.projectDetailDialog,
      nzFooter: null,
      nzWidth: 800,
      nzClassName: 'project-detail-modal',
      nzCentered: true,
      nzMaskClosable: true,
      nzMask: true,
      nzMaskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
      nzBodyStyle: { padding: '0' },
      nzStyle: { top: '10px' }
    });
  }
}
