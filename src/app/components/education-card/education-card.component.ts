import { Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { WatermarkComponent } from '../watermark/watermark.component';
import { CustomModalService } from '../../services/custom-modal.service';
import { Education } from '../../models/cv.models';

@Component({
  selector: 'app-education-card',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    TranslateModule,
    NzModalModule,
    NzTagModule,
    WatermarkComponent,
  ],
  templateUrl: './education-card.component.html',
  styleUrls: ['./education-card.component.scss']
})
export class EducationCardComponent {
  @Input() education!: Education;
  @ViewChild('educationDetailDialog') educationDetailDialog!: TemplateRef<any>;

  constructor(private modalService: CustomModalService) {}

  getInstitutionLogo(institution: string): string {
    // Convert institution name to lowercase and replace spaces/special chars with hyphens
    const filename = institution.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric chars with hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    return `${filename}.png`;
  }

  openEducationDialog(): void {
    const isMobile = window.innerWidth < 768;

    this.modalService.create({
      nzTitle: undefined,
      nzContent: this.educationDetailDialog,
      nzFooter: null,
      nzWidth: isMobile ? '90%' : 800,
      nzClassName: 'education-detail-modal',
      nzCentered: !isMobile, // Center the dialog on web, custom positioning on mobile
      nzMaskClosable: true,
      nzMask: true,
      nzMaskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.65)' },
      nzBodyStyle: { 
        padding: '0', 
        maxHeight: isMobile ? 'calc(100vh - 60px)' : '90vh' // Control max height for both mobile and desktop
      },
      nzStyle: isMobile ? { top: '50px' } : {} // Only set top position on mobile
    });
  }
} 