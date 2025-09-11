import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { WatermarkComponent } from '../watermark/watermark.component';

export interface SkillInfo {
  name: string;
  description: string[] | string;
  url: string;
  githubUrl?: string;
  logo?: string;
  isCommonTool?: boolean;
}

@Component({
  selector: 'app-skill-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NzIconModule,
    NzTagModule,
    WatermarkComponent
  ],
  templateUrl: './skill-detail.component.html',
  styleUrls: ['./skill-detail.component.scss']
})
export class SkillDetailComponent {
  @Input({ required: true }) info!: SkillInfo;
  @Input() projectCount = 0;
  @Output() close = new EventEmitter<void>();

  closeDialog(): void {
    // This will be handled by the parent component
    this.close.emit();
  }

  get isDescriptionArray(): boolean {
    return Array.isArray(this.info?.description);
  }
}
