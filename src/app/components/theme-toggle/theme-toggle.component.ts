import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ThemeService, Theme } from '../../services/theme.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, NzIconModule, NzToolTipModule],
  template: `
    <button 
      class="theme-toggle"
      (click)="toggleTheme()"
      [nz-tooltip]="getTooltipText()"
      nzTooltipPlacement="bottom"
    >
      <div class="theme-icon-container">
        @switch (currentTheme()) {
          @case ('light') {
            <span nz-icon nzType="sun" nzTheme="outline" class="theme-icon"></span>
          }
          @case ('dark') {
            <span nz-icon nzType="moon" nzTheme="outline" class="theme-icon"></span>
          }
          @default {
            <span nz-icon nzType="desktop" nzTheme="outline" class="theme-icon"></span>
          }
        }
      </div>
      <div class="theme-indicator">
        <div class="indicator-dot" [class.active]="currentTheme() === 'light'"></div>
        <div class="indicator-dot" [class.active]="currentTheme() === 'dark'"></div>
        <div class="indicator-dot" [class.active]="currentTheme() === 'auto'"></div>
      </div>
    </button>
  `,
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  
  currentTheme = toSignal(this.themeService.theme$, { initialValue: 'light' as Theme });
  isDarkMode = toSignal(this.themeService.isDarkMode$, { initialValue: false });

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getTooltipText(): string {
    const theme = this.themeService.getCurrentTheme();
    switch (theme) {
      case 'light':
        return 'Light theme (click for dark)';
      case 'dark':
        return 'Dark theme (click for auto)';
      case 'auto':
        return 'Auto theme (click for light)';
      default:
        return 'Toggle theme';
    }
  }
}
