import { inject, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { LanguageService } from './language.service';
import { addCandaraFont } from "./jspdf-font";
import { TranslateService } from '@ngx-translate/core';
import { CV, Education, Project, WorkExperience } from '../models/cv.models';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly languageService = inject(LanguageService);
  private readonly translateService = inject(TranslateService);

  // A4 dimensions in points (72 points per inch)
  private readonly A4_WIDTH = 595.28;  // 8.27 × 72
  private readonly A4_HEIGHT = 841.89; // 11.69 × 72
  private readonly MARGIN = 40;
  private readonly CONTENT_WIDTH = this.A4_WIDTH - (this.MARGIN * 2);
  private readonly SECTION_SPACING = 20; // Space before section headers
  private readonly AVATAR_SIZE = 130;
  private readonly SUB_SECTION_SPACING = 15; // Space between items within sections
  private readonly SECTION_HEADER_HEIGHT = 32;
  private readonly HEADER_SPACING = this.SECTION_HEADER_HEIGHT + 12; // Space after section headers
  private readonly LABEL_WIDTH = 85; // Width for labels like "Technologies:", "Environment:", etc.
  private readonly PROJECT_LINE_HEIGHT = 1.5; // Consistent line height for all content

  private setupPdfFonts(pdf: jsPDF): void {
    try {
      const currentLang = this.languageService.getCurrentLanguage();

      if (currentLang === 'vi') {
        // Setup Vietnamese font
        this.defineVietnameseFont(pdf);
        pdf.setFont('VNFont');

        // Enable Unicode encoding for Vietnamese characters
        (pdf as any).setLanguage("vi");
        (pdf as any).setR2L(false);
      } else {
        // For English, use Candara for now
        pdf.setFont('Candara');
      }

      pdf.setFontSize(12);
      pdf.setProperties({
        title: 'CV',
        subject: 'Curriculum Vitae',
        author: 'Hong Phung Phat',
        keywords: 'CV, Resume',
        creator: 'CV Generator'
      });
    } catch (error) {
      console.error('Error setting up font:', error);
      // Fallback to built-in font if custom font fails to load
      pdf.setFont('Helvetica');
    }
  }

  private defineVietnameseFont(pdf: jsPDF): void {
    // Add Vietnamese font definition
    pdf.addFileToVFS('VNFont.ttf', 'VN_TOKEN');
    pdf.addFont('VNFont.ttf', 'VNFont', 'normal');
  }

  private getLineHeight(fontSize: number, _isProjectContent: boolean = false): number {
    // Consistent 1.5 line height for all content
    return fontSize * this.PROJECT_LINE_HEIGHT;
  }

  private formatLocation(location: any): string {
    if (!location) return '';
    return `${ location.city }, ${ location.country }`;
  }

  private addSectionHeader(pdf: jsPDF, title: string, yPos: number, colors: any): number {
    yPos += this.SECTION_SPACING;

    // Add section header background
    pdf.setFillColor(colors.headerBg);
    pdf.rect(0, yPos - 12, this.A4_WIDTH, this.SECTION_HEADER_HEIGHT, 'F');

    // Add subtle border at the bottom of header
    pdf.setDrawColor(colors.accent);
    pdf.setLineWidth(1);

    // Add section title - translate if needed
    pdf.setFont('Candara', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(colors.primary);
    const translatedTitle = this.translateService.instant(title);
    pdf.text(translatedTitle, this.MARGIN, yPos + 10);

    return yPos + this.HEADER_SPACING;
  }

  private checkPageBreak(pdf: jsPDF, yPos: number, requiredSpace: number = 100): number {
    if (yPos + requiredSpace > this.A4_HEIGHT - this.MARGIN) {
      pdf.addPage();
      return this.MARGIN + 20;
    }
    return yPos;
  }

  async generateBeautifulPdf(): Promise<void> {
    // Get CV data from the window object where it's stored by CVService
    const cv = (window as any).cvData as CV;
    if (!cv) {
      throw new Error('CV data not available');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });


    addCandaraFont(pdf);

    // Setup fonts
    this.setupPdfFonts(pdf);

    // Define colors - using light blue theme to match web interface
    const colors = {
      primary: '#006aca',    // Main blue from nav-bar
      text: '#1e293b',       // Dark text for readability
      link: '#69b1ff',       // Light blue for links
      subtext: '#64748b',    // Medium gray for secondary text
      background: '#ffffff', // White background
      accent: '#e6f4ff',    // Very light blue for accents/lines
      headerBg: '#ebf5ff',   // Lighter blue background for section headers
      companyName: '#0f172a', // Near black for company names
      titleGrey: '#4b5563'   // Grey color for title/position
    };

    let yPos = this.MARGIN + 10;

    // Add header background with light blue color
    pdf.setFillColor(colors.headerBg);
    pdf.rect(0, 0, this.A4_WIDTH, this.MARGIN * 4.6, 'F');

    // Add subtle border at the bottom of header
    pdf.setDrawColor(colors.accent);
    pdf.setLineWidth(1);

    // Add name section
    // Add prefix
    pdf.setFont('Candara', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(colors.titleGrey);
    pdf.text('Mr.', this.MARGIN, yPos);
    const prefixWidth = pdf.getTextWidth('Mr. ');

    // Add name in caps with smaller font size
    pdf.setFont('Candara', 'bold');
    pdf.setFontSize(24); // Reduced from 32 to 24
    pdf.setTextColor(colors.primary);
    const name = (cv.personalInfo.name || '').toUpperCase();
    pdf.text(name, this.MARGIN + prefixWidth, yPos);

    // Add title with reduced spacing
    yPos += this.getLineHeight(24) * 0.6;
    pdf.setFont('Candara', 'medium');
    pdf.setFontSize(16); // Smaller font for position
    pdf.setTextColor(colors.titleGrey);
    pdf.text(cv.personalInfo.title || '', this.MARGIN, yPos);

    // Add extra space after position
    yPos += 10;

    // Add avatar with border
    try {
      const avatarX = this.A4_WIDTH - this.MARGIN - this.AVATAR_SIZE;
      const avatarY = this.MARGIN;

      // Add white background for avatar
      pdf.setFillColor(255, 255, 255);
      pdf.rect(avatarX - 2, avatarY - 2, this.AVATAR_SIZE + 4, this.AVATAR_SIZE + 4, 'F');

      // Add border
      pdf.setDrawColor('#e6f4ff');
      pdf.setLineWidth(1);
      pdf.rect(avatarX - 2, avatarY - 2, this.AVATAR_SIZE + 4, this.AVATAR_SIZE + 4, 'S');

      const img = new Image();
      img.src = 'assets/images/avatar.jpeg';
      pdf.addImage(img, 'JPEG', avatarX, avatarY, this.AVATAR_SIZE, this.AVATAR_SIZE, undefined, 'NONE');
    } catch (error) {
      console.error('Error adding avatar:', error);
    }

    // Add contact info in single row layout with consistent spacing
    yPos += this.getLineHeight(16);
    const contactStartY = yPos;
    let contactY = contactStartY;

    const lineSpacing = this.getLineHeight(11); // Consistent line spacing

    // DOB
    pdf.setFont('Candara', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(colors.primary);
    pdf.text('Date of Birth:', this.MARGIN, contactY);
    pdf.setFont('Candara', 'normal');
    pdf.setTextColor(colors.text);
    pdf.text(cv.personalInfo.dateOfBirth || '', this.MARGIN + 80, contactY);

    // Phone
    contactY += lineSpacing;
    pdf.setFont('Candara', 'bold');
    pdf.setTextColor(colors.primary);
    pdf.text('Phone:', this.MARGIN, contactY);
    pdf.setFont('Candara', 'normal');
    pdf.setTextColor(colors.text);
    pdf.text(cv.personalInfo.contact.phone || '', this.MARGIN + 80, contactY);

    // Email
    contactY += lineSpacing;
    pdf.setFont('Candara', 'bold');
    pdf.setTextColor(colors.primary);
    pdf.text('Email:', this.MARGIN, contactY);
    pdf.setFont('Candara', 'normal');
    pdf.setTextColor(colors.link);
    const email = cv.personalInfo.contact.email || '';
    pdf.textWithLink(email, this.MARGIN + 80, contactY, {
      url: `mailto:${ email }`
    });

    // LinkedIn
    contactY += lineSpacing;
    pdf.setFont('Candara', 'bold');
    pdf.setTextColor(colors.primary);
    pdf.text('LinkedIn:', this.MARGIN, contactY);
    pdf.setFont('Candara', 'normal');
    pdf.setTextColor(colors.link);
    const linkedInUrl = cv.personalInfo.contact.linkedin || '';
    pdf.textWithLink(linkedInUrl, this.MARGIN + 80, contactY, {
      url: linkedInUrl
    });

    // Address
    contactY += lineSpacing;
    pdf.setFont('Candara', 'bold');
    pdf.setTextColor(colors.primary);
    pdf.text('Address:', this.MARGIN, contactY);
    pdf.setFont('Candara', 'normal');
    pdf.setTextColor(colors.text);
    const location = cv.personalInfo.location;
    const formattedLocation = location ? `${ location.address } - ${ location.city } - ${ location.country }` : '';
    pdf.text(formattedLocation, this.MARGIN + 80, contactY);

    // Add extra space after basic information
    contactY += 10;

    // Add summary content directly without header
    yPos = Math.max(contactY + this.getLineHeight(11), this.MARGIN + this.AVATAR_SIZE + this.SECTION_SPACING);

    yPos += 15;

    // Add summary content in two paragraphs
    pdf.setFont('Candara', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(colors.text);
    //
    // // First paragraph - short summary
    // if (cv.personalInfo.shortSummary) {
    //   const shortSummaryLines = pdf.splitTextToSize(cv.personalInfo.shortSummary || '', this.CONTENT_WIDTH);
    //   shortSummaryLines.forEach((line: string, index: number) => {
    //     pdf.text(line, this.MARGIN, yPos + (index * this.getLineHeight(14)));
    //   });
    //   yPos += shortSummaryLines.length * this.getLineHeight(12) + this.getLineHeight(12);
    // }

    // Complete summary
    if (cv.personalInfo.summary) {
      const summaryText = cv.personalInfo.summary;
      
      const summaryLines = pdf.splitTextToSize(summaryText, this.CONTENT_WIDTH);
      summaryLines.forEach((line: string, index: number) => {
        pdf.text(line, this.MARGIN, yPos + (index * this.getLineHeight(12)));
      });
      yPos += (summaryLines.length - 1) * this.getLineHeight(12);
    }

    yPos += this.SUB_SECTION_SPACING;

    // Add Education Section
    yPos = this.addSectionHeader(pdf, 'Education', yPos, colors);

    if (cv.education?.education) {
      cv.education.education.forEach((edu: Education, index: number) => {
        // School/University name in blue, larger font
        pdf.setFont('Candara', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(colors.primary);
        pdf.text(edu.institution, this.MARGIN, yPos);

        // Degree and duration on the same line
        yPos += this.getLineHeight(14);
        pdf.setFont('Candara', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor(colors.text);
        const degreeText = `${ edu.degree } in ${ edu.field }`;
        pdf.text(degreeText, this.MARGIN, yPos);
        
        // Duration after degree with dash separator
        const degreeWidth = pdf.getTextWidth(degreeText);
        const duration = `${ edu.startDate } - ${ edu.endDate }`;
        pdf.setFont('Candara', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor(colors.subtext);
        pdf.text(` - ${ duration }`, this.MARGIN + degreeWidth, yPos);

        // Add spacing between education items
        yPos += this.SUB_SECTION_SPACING;

        // Add a subtle separator line between education items (except for the last one)
        if (index < cv.education.education.length - 1) {
          pdf.setDrawColor(colors.accent);
          pdf.setLineWidth(0.5);
          pdf.line(this.MARGIN + 40, yPos - 10, this.A4_WIDTH - this.MARGIN - 40, yPos - 10);
        }
      });
    }

    // Add Experience section
    yPos = this.addSectionHeader(pdf, 'Experience', yPos, colors);

    // Add work experience entries
    cv.experience.workExperience.forEach((exp: WorkExperience, index: number) => {
      // Check if we need a new page for this experience entry
      yPos = this.checkPageBreak(pdf, yPos, 150); // Estimated minimum space needed for an experience entry

      // Company name in blue, larger font
      pdf.setFont('Candara', 'bold');
      pdf.setFontSize(14); // Reduced from 17 to 14
      pdf.setTextColor(colors.primary);
      pdf.text(exp.company, this.MARGIN, yPos);

      // Position and duration on the same line
      yPos += this.getLineHeight(14);
      pdf.setFont('Candara', 'bold');
      pdf.setFontSize(12); // Reduced from 14 to 12
      pdf.setTextColor(colors.text);
      pdf.text(exp.position, this.MARGIN, yPos);
      
      // Duration after position with dash separator
      const positionWidth = pdf.getTextWidth(exp.position);
      const duration = `${ exp.startDate } - ${ exp.endDate || 'Now' }`;
      pdf.setFont('Candara', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(colors.subtext);
      pdf.text(` - ${ duration }`, this.MARGIN + positionWidth, yPos);

      // Add consistent line break before responsibilities
      yPos += this.getLineHeight(12);

      // Responsibilities with proper bullet points
      pdf.setFont('Candara', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(colors.text);

      exp.responsibilities.forEach((resp: string) => {
        // Check if we need a new page for this responsibility
        yPos = this.checkPageBreak(pdf, yPos, 50); // Estimated minimum space needed for a responsibility

        // Add bullet point with proper bullet character
        pdf.text('•', this.MARGIN + 5, yPos);

        // Add responsibility text with proper wrapping
        const lines = pdf.splitTextToSize(resp, this.CONTENT_WIDTH - 25);
        lines.forEach((line: string, lineIndex: number) => {
          if (lineIndex === 0) {
            pdf.text(line, this.MARGIN + 15, yPos);
          } else {
            yPos += this.getLineHeight(12);
            yPos = this.checkPageBreak(pdf, yPos, this.getLineHeight(12));
            pdf.text(line, this.MARGIN + 15, yPos);
          }
        });

        yPos += 20;
      });

      // Add more spacing between experiences
      yPos -= 10;

      // Add a subtle separator line between experiences (except for the last one)
      if (index < cv.experience.workExperience.length - 1) {
        yPos += 5;
        pdf.setDrawColor(colors.accent);
        pdf.setLineWidth(1);
        pdf.line(this.MARGIN, yPos, this.A4_WIDTH - this.MARGIN, yPos);
        yPos += 25;
      }
    });

    // Add Projects Section with page break check
    yPos = this.checkPageBreak(pdf, yPos, 300);
    yPos = this.addSectionHeader(pdf, 'Projects', yPos, colors);

    if (cv.projects?.projects) {
      const includedProjects = cv.projects.projects.filter((project: Project) => !project.excludeFromPdf);

      includedProjects.forEach((project: Project, index: number) => {
        // Check if we need a new page for this project
        yPos = this.checkPageBreak(pdf, yPos, 150);

        // Project name and duration on same line with dash separator
        const nameText = project.name || '';
        pdf.setFont('Candara', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(colors.primary);
        pdf.text(nameText, this.MARGIN, yPos);

        const nameWidth = pdf.getTextWidth(nameText);
        const duration = project.duration || '';
        if (duration) {
          pdf.setFont('Candara', 'normal');
          pdf.setFontSize(12);
          pdf.setTextColor(colors.subtext);
          pdf.text(` - ${ duration }`, this.MARGIN + nameWidth, yPos);
        }

        // Description - match Experience section line height behavior
        if (project.description) {
          yPos += this.getLineHeight(12);
          yPos = this.checkPageBreak(pdf, yPos, 50);

          // Bullet
          pdf.text('•', this.MARGIN + 5, yPos);

          // Description lines with the same spacing logic as Experience responsibilities
          pdf.setFont('Candara', 'normal');
          pdf.setFontSize(11);
          pdf.setTextColor(colors.text);

          const lines = pdf.splitTextToSize(project.description, this.CONTENT_WIDTH - 25);
          lines.forEach((line: string, lineIndex: number) => {
            if (lineIndex === 0) {
              pdf.text(line, this.MARGIN + 15, yPos);
            } else {
              yPos += this.getLineHeight(11);
              yPos = this.checkPageBreak(pdf, yPos, this.getLineHeight(11));
              pdf.text(line, this.MARGIN + 15, yPos);
            }
          });

          // Add a little space after the paragraph (mirroring responsibilities)
          yPos += 20;
        }

        // Project details with minimal spacing
        const detailSpacer = this.getLineHeight(11) * 0.2;

        // Technologies
        if (project.technologies?.length) {
          yPos += detailSpacer;
          yPos = this.checkPageBreak(pdf, yPos, 50);

          pdf.setFont('Candara', 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(colors.primary);
          const techLabel = this.translateService.instant('Technologies') + ':';
          pdf.text(techLabel, this.MARGIN, yPos);

          const techStartX = this.MARGIN + this.LABEL_WIDTH;

          pdf.setFont('Candara', 'normal');
          pdf.setTextColor(colors.text);
          const techText = project.technologies.join(', ');
          const techLines = pdf.splitTextToSize(techText, this.CONTENT_WIDTH - this.LABEL_WIDTH - 30);
          const techLineHeight = this.getLineHeight(11);

          let techY = yPos;
          techLines.forEach((line: string, idx: number) => {
            if (idx === 0) {
              pdf.text(line, techStartX, techY);
              techY += techLineHeight;
            } else {
              techY = this.checkPageBreak(pdf, techY, techLineHeight);
              pdf.text(line, techStartX, techY);
              techY += techLineHeight;
            }
          });

          yPos = techY;
        }

        // Environment
        if (project.environment?.length) {
          yPos += detailSpacer;
          yPos = this.checkPageBreak(pdf, yPos, 50);

          pdf.setFont('Candara', 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(colors.primary);
          const envLabel = this.translateService.instant('Environment') + ':';
          pdf.text(envLabel, this.MARGIN, yPos);

          const envStartX = this.MARGIN + this.LABEL_WIDTH;

          pdf.setFont('Candara', 'normal');
          pdf.setTextColor(colors.text);
          const envText = project.environment.join(', ');
          const envLines = pdf.splitTextToSize(envText, this.CONTENT_WIDTH - this.LABEL_WIDTH - 30);
          const envLineHeight = this.getLineHeight(11);

          let envY = yPos;
          envLines.forEach((line: string, idx: number) => {
            if (idx === 0) {
              pdf.text(line, envStartX, envY);
              envY += envLineHeight;
            } else {
              envY = this.checkPageBreak(pdf, envY, envLineHeight);
              pdf.text(line, envStartX, envY);
              envY += envLineHeight;
            }
          });

          yPos = envY;
        }

        // Role
        if (project.role) {
          yPos += detailSpacer;
          yPos = this.checkPageBreak(pdf, yPos, 50);

          pdf.setFont('Candara', 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(colors.primary);
          const roleLabel = this.translateService.instant('Role') + ':';
          pdf.text(roleLabel, this.MARGIN, yPos);

          const roleStartX = this.MARGIN + this.LABEL_WIDTH;

          pdf.setFont('Candara', 'normal');
          pdf.setTextColor(colors.text);
          const roleLines = pdf.splitTextToSize(project.role, this.CONTENT_WIDTH - this.LABEL_WIDTH - 30);
          const roleLineHeight = this.getLineHeight(11);

          let roleY = yPos;
          roleLines.forEach((line: string, idx: number) => {
            if (idx === 0) {
              pdf.text(line, roleStartX, roleY);
              roleY += roleLineHeight;
            } else {
              roleY = this.checkPageBreak(pdf, roleY, roleLineHeight);
              pdf.text(line, roleStartX, roleY);
              roleY += roleLineHeight;
            }
          });

          yPos = roleY;
        }

        // Increased spacing between projects
        yPos += this.SUB_SECTION_SPACING;
      });
    }

    // Add centered text about additional projects
    yPos += 20;
    pdf.setFont('Candara', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(colors.subtext);
    const additionalProjectsText = 'There are additional projects not shown here.';
    const textWidth = pdf.getTextWidth(additionalProjectsText);
    pdf.text(additionalProjectsText, (this.A4_WIDTH - textWidth) / 2, yPos);
    yPos += 25;

    // Add Skills section with page break check
    yPos = this.checkPageBreak(pdf, yPos, 150);
    yPos = this.addSectionHeader(pdf, 'Technical Skills', yPos, colors);

    // Create three columns for skills
    const columnWidth = (this.CONTENT_WIDTH - 40) / 3;
    let column1Y = yPos;
    let column2Y = yPos;
    let column3Y = yPos;
    let currentColumn = 0;

    Object.entries(cv.skills.technicalSkills).forEach(([ category, skills ]) => {
      let currentY: number;
      let startX: number;

      switch ( currentColumn ) {
        case 0:
          currentY = column1Y;
          startX = this.MARGIN;
          break;
        case 1:
          currentY = column2Y;
          startX = this.MARGIN + columnWidth + 20;
          break;
        case 2:
          currentY = column3Y;
          startX = this.MARGIN + (columnWidth + 20) * 2;
          break;
        default:
          currentY = yPos;
          startX = this.MARGIN;
      }

      // Check if we need a new page for this skill category
      if (currentColumn === 0) {
        currentY = this.checkPageBreak(pdf, currentY, 100);
        column1Y = column2Y = column3Y = currentY;
      }

      // Add category with translation
      pdf.setFont('Candara', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(colors.primary);
      const formatedCategory = this.formatCategory(category);
      pdf.text(formatedCategory, startX, currentY);

      // Add skills
      currentY += this.getLineHeight(12);
      pdf.setFont('Candara', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(colors.text);

      const skillText = Array.isArray(skills) ? skills.join(', ') : String(skills);
      const skillLines = pdf.splitTextToSize(skillText, columnWidth - 10);

      skillLines.forEach((line: string, index: number) => {
        pdf.text(line, startX, currentY + (index * this.getLineHeight(11)));
      });

      const heightUsed = (skillLines.length * this.getLineHeight(11)) + 30;

      switch ( currentColumn ) {
        case 0:
          column1Y += heightUsed;
          break;
        case 1:
          column2Y += heightUsed;
          break;
        case 2:
          column3Y += heightUsed;
          break;
      }

      currentColumn = (currentColumn + 1) % 3;
    });

    yPos = Math.max(column1Y, column2Y, column3Y);

    // Add footer with page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFont('Candara', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(colors.subtext);
      pdf.text(
        `Page ${ i } of ${ totalPages }`,
        this.A4_WIDTH / 2,
        this.A4_HEIGHT - 20,
        { align: 'center' }
      );
    }

    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `CV_${ cv.personalInfo.name.replace(/\s+/g, '_') }_${ timestamp }.pdf`;
    pdf.save(filename);
  }

  private formatCategory(category: string): string {
    return category
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
