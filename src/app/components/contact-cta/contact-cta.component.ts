import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterModule } from '@angular/router';
import { CVService } from '../../services/cv.service';

@Component({
  selector: 'app-contact-cta',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NzIconModule,
    RouterModule
  ],
  templateUrl: './contact-cta.component.html',
  styleUrls: ['./contact-cta.component.scss']
})
export class ContactCtaComponent {
  @Input() title: string = 'CTA.INTERESTED_IN_WORKING_TOGETHER';
  @Input() description: string = 'CTA.REACH_OUT';
  @Input() buttonText: string = 'CTA.CONTACT_ME';
  @Input() buttonIcon: string = 'linkedin';
  
  constructor(private cvService: CVService) {}
  
  /**
   * Opens LinkedIn profile in new tab
   */
  openLinkedIn(): void {
    const linkedInUrl = this.cvService.cv()?.personalInfo?.contact?.linkedin;
    if (linkedInUrl) {
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    }
  }
} 