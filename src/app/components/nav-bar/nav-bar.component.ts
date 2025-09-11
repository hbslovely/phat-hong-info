import { Component, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ExportPdfComponent } from '../export-pdf/export-pdf.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NzIconModule,
    ExportPdfComponent
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  isMobileMenuOpen = signal(false);
  isMobileView = signal(false);
  
  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
    // Close mobile menu on resize to desktop
    if (!this.isMobileView()) {
      this.closeMobileMenu();
    }
  }
  
  checkScreenSize(): void {
    this.isMobileView.set(window.innerWidth <= 768);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
    
    // Prevent body scrolling when menu is open
    if (this.isMobileMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
      document.body.style.overflow = '';
    }
  }
}
