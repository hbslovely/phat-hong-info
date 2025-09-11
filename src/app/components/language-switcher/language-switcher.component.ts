import { Component, AfterViewInit, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent implements AfterViewInit {
  @ViewChildren('langButton') langButtons!: QueryList<ElementRef>;
  
  isSwitching = false;
  
  languages: LanguageOption[] = [
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'vi',
      name: 'Vietnamese',
      flag: '🇻🇳'
    }
  ];

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}
  
  ngAfterViewInit() {
    // Trigger initial position calculation after view is initialized
    setTimeout(() => {
      this.getActivePosition();
    });
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang;
  }

  switchLanguage(langCode: string): void {
    if (langCode === this.getCurrentLanguage()) return;
    
    // Trigger animation
    this.isSwitching = true;
    setTimeout(() => {
      this.isSwitching = false;
    }, 500);
    
    this.translate.use(langCode);
    this.languageService.setLanguage(langCode);
  }
  
  getActivePosition(): number {
    if (!this.langButtons) return 0;
    
    const currentLang = this.getCurrentLanguage();
    const buttons = this.langButtons.toArray();
    const activeIndex = this.languages.findIndex(lang => lang.code === currentLang);
    
    if (activeIndex >= 0 && buttons[activeIndex]) {
      const activeButton = buttons[activeIndex].nativeElement;
      return activeButton.offsetLeft - 5; // Adjust for padding
    }
    
    return 0;
  }
}
