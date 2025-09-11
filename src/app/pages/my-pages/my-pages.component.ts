import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { HttpClient } from '@angular/common/http';
import { Subscription, firstValueFrom } from 'rxjs';
import { LanguageService } from '../../services/language.service';

interface MyPage {
  title: string;
  description: string;
  url: string;
  image: string;
  fallbackImage: string;
  status: 'completed' | 'in-progress';
  technologies: string[];
  creationDate?: string;
  goals?: string;
}

interface MyPagesData {
  pages: MyPage[];
}

@Component({
  selector: 'app-my-pages',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NzIconModule,
    NzCardModule,
    NzToolTipModule,
    RouterModule,
    PageHeaderComponent
  ],
  templateUrl: './my-pages.component.html',
  styleUrls: ['./my-pages.component.scss']
})
export class MyPagesComponent implements OnInit, OnDestroy {
  myPages: MyPage[] = [];
  private langSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Load initial data based on current language
    this.loadData(this.languageService.getCurrentLanguage());

    // Subscribe to language changes
    this.langSubscription = this.languageService.language$.subscribe(lang => {
      this.loadData(lang);
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  async loadData(lang: string): Promise<void> {
    try {
      const filePath = `assets/json/my-pages${lang === 'en' ? '' : '.' + lang}.json`;
      const data = await firstValueFrom(this.http.get<MyPagesData>(filePath));
      this.myPages = data.pages;
    } catch (error) {
      console.error('Error loading my pages data:', error);
      // Fallback to empty array if data loading fails
      this.myPages = [];
    }
  }

  handleImageError(page: MyPage): void {
    // If the image fails to load, use the fallback image
    const imgElement = event?.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = page.fallbackImage;
    }
  }
}
