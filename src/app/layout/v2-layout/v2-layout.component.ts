import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { TranslateModule } from '@ngx-translate/core';
import { VersionService } from '../../services/version.service';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { VersionSwitcherComponent } from '../../components/version-switcher/version-switcher.component';
import { ExportPdfComponent } from '../../components/export-pdf/export-pdf.component';

@Component({
  selector: 'app-v2-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzMenuModule,
    TranslateModule,
    LanguageSwitcherComponent,
    ThemeToggleComponent,
    VersionSwitcherComponent,
    ExportPdfComponent
  ],
  template: `
    <div class="v2-layout">
      <!-- Header -->
      <header class="v2-header">
        <div class="container">
          <div class="header-content">
            <!-- Logo -->
            <div class="logo">
              <span class="logo-icon">P</span>
              <span class="logo-text">Phat Hong</span>
            </div>

            <!-- Mobile Menu Button -->
            <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
              <span nz-icon [nzType]="isMobileMenuOpen ? 'close' : 'menu'" nzTheme="outline"></span>
            </button>

            <!-- Navigation -->
            <nav class="nav-menu" [class.mobile-open]="isMobileMenuOpen">
              <a routerLink="/v2/about" routerLinkActive="active" (click)="closeMobileMenu()">About</a>
              <a routerLink="/v2/experience" routerLinkActive="active" (click)="closeMobileMenu()">Experience</a>
              <a routerLink="/v2/projects" routerLinkActive="active" (click)="closeMobileMenu()">Projects</a>
              <a routerLink="/v2/skills" routerLinkActive="active" (click)="closeMobileMenu()">Skills</a>
            </nav>

            <!-- Actions -->
            <div class="header-actions">
              <app-language-switcher></app-language-switcher>
              <app-theme-toggle></app-theme-toggle>
              
              <!-- Version Switcher -->
              <app-version-switcher></app-version-switcher>

              <!-- Export PDF -->
              <app-export-pdf></app-export-pdf>

              <!-- Contact CTA -->
              <button nz-button nzType="primary" class="contact-btn">
                <span nz-icon nzType="message" nzTheme="outline"></span>
                Contact Me
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="v2-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="v2-footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-left">
              <div class="logo">
                <span class="logo-icon">P</span>
                <span class="logo-text">Phat Hong</span>
              </div>
              <p class="footer-description">
                Full-stack Developer & Technology Enthusiast.<br>
                Building modern web applications with passion.
              </p>
            </div>

            <div class="footer-links">
              <div class="link-group">
                <h4>Navigation</h4>
                <a routerLink="/v2/about">About</a>
                <a routerLink="/v2/experience">Experience</a>
                <a routerLink="/v2/projects">Projects</a>
                <a routerLink="/v2/skills">Skills</a>
              </div>

              <div class="link-group">
                <h4>Connect</h4>
                <a href="mailto:phat@example.com">Email</a>
                <a href="https://linkedin.com/in/phat-hong" target="_blank">LinkedIn</a>
                <a href="https://github.com/phat-hong" target="_blank">GitHub</a>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <p>&copy; 2025 Phat Hong. All rights reserved.</p>
            <div class="footer-actions">
              <button nz-button nzType="link" (click)="switchToV1()">
                Switch to V1
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./v2-layout.component.scss']
})
export class V2LayoutComponent {
  private readonly versionService = inject(VersionService);
  
  isMobileMenuOpen = false;

  switchToV1(): void {
    this.versionService.switchVersion('v1');
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
