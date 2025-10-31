import { Component, signal, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ExportPdfComponent } from '../export-pdf/export-pdf.component';
import { VersionSwitcherComponent } from '../version-switcher/version-switcher.component';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzMenuModule,
    ExportPdfComponent,
    VersionSwitcherComponent
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  private readonly versionService = inject(VersionService);
  
  isMobileMenuOpen = signal(false);
  isMobileView = signal(false);
  
  readonly currentVersion = this.versionService.currentVersion;
  
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

  switchToV2(): void {
    this.versionService.switchVersion('v2');
    this.closeMobileMenu();
  }

  switchToV1(): void {
    this.versionService.switchVersion('v1');
    this.closeMobileMenu();
  }

  getVersionPrefix(): string {
    return this.currentVersion() === 'v2' ? '/v2' : '/v1';
  }
}
