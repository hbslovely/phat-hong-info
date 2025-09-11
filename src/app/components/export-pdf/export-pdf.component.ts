import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-export-pdf',
  standalone: true,
  imports: [CommonModule, NzIconModule, TranslateModule],
  templateUrl: './export-pdf.component.html',
  styleUrls: ['./export-pdf.component.scss']
})
export class ExportPdfComponent {
  isExporting = signal(false);
  isSuccess = signal(false);

  constructor(private pdfService: PdfService) {}

  async exportPDF(): Promise<void> {
    if (this.isExporting()) return;

    this.isExporting.set(true);
    this.isSuccess.set(false);

    try {
      await this.pdfService.generateBeautifulPdf();
      this.isSuccess.set(true);
      
      // Reset success state after animation
      setTimeout(() => {
        this.isSuccess.set(false);
      }, 2000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      this.isExporting.set(false);
    }
  }
} 