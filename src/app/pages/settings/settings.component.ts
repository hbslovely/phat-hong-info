import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ContactCtaComponent } from '../../components/contact-cta/contact-cta.component';
import { ThemeService, Theme } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NzIconModule,
    NzSwitchModule,
    NzCardModule,
    NzDividerModule,
    NzSelectModule,
    FormsModule,
    PageHeaderComponent,
    ContactCtaComponent
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);

  // Theme signals
  currentTheme = toSignal(this.themeService.theme$, { initialValue: 'light' as Theme });
  isDarkMode = toSignal(this.themeService.isDarkMode$, { initialValue: false });

  // Language signals
  currentLanguage = toSignal(this.languageService.language$, { initialValue: 'en' });

  // Theme options for display
  themeOptions: Array<{ value: Theme; label: string; icon: string; description: string }> = [
    { value: 'light', label: 'SETTINGS.THEME.LIGHT', icon: 'sun', description: 'SETTINGS.THEME.LIGHT_DESC' },
    { value: 'dark', label: 'SETTINGS.THEME.DARK', icon: 'moon', description: 'SETTINGS.THEME.DARK_DESC' },
    { value: 'auto', label: 'SETTINGS.THEME.AUTO', icon: 'desktop', description: 'SETTINGS.THEME.AUTO_DESC' }
  ];

  // Language options
  languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸', description: 'SETTINGS.LANGUAGE.EN_DESC' },
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', description: 'SETTINGS.LANGUAGE.VI_DESC' }
  ];

  // Computed properties for UI
  currentThemeOption = computed(() => 
    this.themeOptions.find(option => option.value === this.currentTheme())
  );

  currentLanguageOption = computed(() => 
    this.languageOptions.find(option => option.value === this.currentLanguage())
  );

  // Theme methods
  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Language methods
  setLanguage(language: string): void {
    this.languageService.setLanguage(language);
  }

  // Helper methods
  getThemeIcon(theme: string): string {
    const option = this.themeOptions.find(opt => opt.value === theme);
    return option?.icon || 'setting';
  }

  isThemeSelected(theme: Theme): boolean {
    return this.currentTheme() === theme;
  }

  isLanguageSelected(language: string): boolean {
    return this.currentLanguage() === language;
  }
}
