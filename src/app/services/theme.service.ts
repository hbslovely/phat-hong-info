import { Injectable, Renderer2, RendererFactory2, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme = new BehaviorSubject<Theme>('light');
  private isDarkMode = new BehaviorSubject<boolean>(false);

  public theme$ = this.currentTheme.asObservable();
  public isDarkMode$ = this.isDarkMode.asObservable();

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Get saved theme from localStorage or default to 'auto'
    const savedTheme = localStorage.getItem('theme') as Theme;
    const initialTheme = savedTheme || 'auto';

    this.setTheme(initialTheme);

    // Listen for system theme changes if auto mode is selected
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentTheme.value === 'auto') {
          this.updateDarkMode();
        }
      });
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme.next(theme);
    localStorage.setItem('theme', theme);
    this.updateDarkMode();
  }

  getCurrentTheme(): Theme {
    return this.currentTheme.value;
  }

  getIsDarkMode(): boolean {
    return this.isDarkMode.value;
  }

  toggleTheme(): void {
    const current = this.currentTheme.value;
    let newTheme: Theme;

    switch (current) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'auto';
        break;
      default:
        newTheme = 'light';
        break;
    }

    this.setTheme(newTheme);
  }

  private updateDarkMode(): void {
    const theme = this.currentTheme.value;
    let isDark = false;

    switch (theme) {
      case 'dark':
        isDark = true;
        break;
      case 'light':
        isDark = false;
        break;
      case 'auto':
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        break;
    }

    this.isDarkMode.next(isDark);
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    const body = this.document.body;

    if (isDark) {
      this.renderer.addClass(body, 'dark-theme');
      this.renderer.removeClass(body, 'light-theme');
    } else {
      this.renderer.addClass(body, 'light-theme');
      this.renderer.removeClass(body, 'dark-theme');
    }

    // Update CSS custom properties for smooth transitions
    this.updateCSSVariables(isDark);
  }

  private updateCSSVariables(isDark: boolean): void {
    const root = this.document.documentElement;

    if (isDark) {
      // Dark theme variables - lighter blue
      root.style.setProperty('--primary-color', '#60a5fa');
      root.style.setProperty('--primary-color-rgb', '96, 165, 250');
      root.style.setProperty('--primary-light', '#93c5fd');
      root.style.setProperty('--primary-light-rgb', '147, 197, 253');
      root.style.setProperty('--primary-lighter', '#bfdbfe');
      root.style.setProperty('--primary-lighter-rgb', '191, 219, 254');
      root.style.setProperty('--primary-lightest', '#1e3a8a');
      root.style.setProperty('--primary-lightest-rgb', '30, 58, 138');

      root.style.setProperty('--text-color', '#e2e8f0');
      root.style.setProperty('--text-light', '#94a3b8');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--heading-color', '#f1f5f9');

      root.style.setProperty('--background', '#0f172a');
      root.style.setProperty('--background-color', '#1e293b');
      root.style.setProperty('--bg-gradient-1', '#0f172a');
      root.style.setProperty('--bg-gradient-2', '#1e293b');
      root.style.setProperty('--bg-gradient-3', '#334155');

      root.style.setProperty('--card-bg', 'rgba(30, 41, 59, 0.9)');
      root.style.setProperty('--border-color', '#334155');
      root.style.setProperty('--hover-bg', 'rgba(51, 65, 85, 0.5)');

      root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgb(0 0 0 / 0.3)');
      root.style.setProperty('--shadow', '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)');
    } else {
      // Light theme variables (reset to defaults)
      root.style.setProperty('--primary-color', '#0066cc');
      root.style.setProperty('--primary-color-rgb', '0, 102, 204');
      root.style.setProperty('--primary-light', '#3399ff');
      root.style.setProperty('--primary-light-rgb', '51, 153, 255');
      root.style.setProperty('--primary-lighter', '#66b3ff');
      root.style.setProperty('--primary-lighter-rgb', '102, 179, 255');
      root.style.setProperty('--primary-lightest', '#e6f3ff');
      root.style.setProperty('--primary-lightest-rgb', '230, 243, 255');

      root.style.setProperty('--text-color', '#4b5563');
      root.style.setProperty('--text-light', '#6b7280');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--heading-color', '#1f2937');

      root.style.setProperty('--background', '#f8fafc');
      root.style.setProperty('--background-color', '#ffffff');
      root.style.setProperty('--bg-gradient-1', '#f8fafc');
      root.style.setProperty('--bg-gradient-2', '#eef2f7');
      root.style.setProperty('--bg-gradient-3', '#e2e8f0');

      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--hover-bg', 'rgba(248, 250, 252, 0.8)');

      root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgb(0 0 0 / 0.05)');
      root.style.setProperty('--shadow', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)');
    }
  }
}
