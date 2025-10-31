import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export type AppVersion = 'v1' | 'v2';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private readonly _currentVersion = signal<AppVersion>('v1');

  constructor(private router: Router) {
    // Initialize version from URL
    this.initializeVersionFromUrl();
  }

  get currentVersion() {
    return this._currentVersion.asReadonly();
  }

  private initializeVersionFromUrl(): void {
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/v2')) {
      this._currentVersion.set('v2');
    } else {
      this._currentVersion.set('v1');
    }
  }

  switchVersion(version: AppVersion): void {
    const currentUrl = this.router.url;
    let newUrl: string;

    if (version === 'v2') {
      // Switch to v2
      if (currentUrl.startsWith('/v1/')) {
        newUrl = currentUrl.replace('/v1/', '/v2/');
      } else if (currentUrl.startsWith('/v2/')) {
        newUrl = currentUrl; // Already on v2
      } else {
        // Default route, add v2 prefix
        newUrl = `/v2${currentUrl === '/' ? '/about' : currentUrl}`;
      }
    } else {
      // Switch to v1
      if (currentUrl.startsWith('/v2/')) {
        newUrl = currentUrl.replace('/v2/', '/v1/');
      } else if (currentUrl.startsWith('/v1/')) {
        newUrl = currentUrl; // Already on v1
      } else {
        // Default route, add v1 prefix
        newUrl = `/v1${currentUrl === '/' ? '/about' : currentUrl}`;
      }
    }

    this._currentVersion.set(version);
    this.router.navigateByUrl(newUrl);
  }

  isV2(): boolean {
    return this._currentVersion() === 'v2';
  }

  isV1(): boolean {
    return this._currentVersion() === 'v1';
  }
}
