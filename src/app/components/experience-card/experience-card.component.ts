import { Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { WorkExperience } from '../../models/cv.models';
import { TranslateModule } from '@ngx-translate/core';
import { WatermarkComponent } from '../watermark/watermark.component';
import { CustomModalService } from '../../services/custom-modal.service';

@Component({
  selector: 'app-experience-card',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    TranslateModule,
    WatermarkComponent
  ],
  templateUrl: './experience-card.component.html',
  styleUrls: ['./experience-card.component.scss']
})
export class ExperienceCardComponent {
  @Input() experience!: WorkExperience;
  @ViewChild('companyDetailDialog') companyDetailDialog!: TemplateRef<any>;

  constructor(private modalService: CustomModalService) {}

  getCompanyLogo(company: string): string {
    // Convert company name to lowercase and replace spaces/special chars with hyphens
    const filename = company.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric chars with hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    return `${filename}.png`;
  }

  openCompanyDialog(): void {
    const isMobile = window.innerWidth < 768;

    this.modalService.create({
      nzTitle: undefined,
      nzContent: this.companyDetailDialog,
      nzFooter: null,
      nzWidth: isMobile ? '90%' : 800,
      nzClassName: 'company-detail-modal',
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
