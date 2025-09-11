import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { ScrollToTopService } from './services/scroll-to-top.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly scrollToTopService = inject(ScrollToTopService);
  private readonly themeService = inject(ThemeService);

  ngOnInit() {
    // Subscribe to language changes
    this.languageService.language$.subscribe(lang => {
      // Set the lang attribute on the root element
      document.documentElement.setAttribute('lang', lang);
    });
    
    // Theme service is automatically initialized when injected
  }
}
