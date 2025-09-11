import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollToTopService {
  constructor(private router: Router) {
    // Subscribe to NavigationEnd events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // First immediate scroll to top
      this.scrollToTop('auto');
      
      // Then attempt a second scroll after a short delay to ensure view has updated
      setTimeout(() => {
        this.scrollToTop('auto');
      }, 50);
    });
  }
  
  /**
   * Scroll to top of the page using multiple methods for maximum compatibility
   * @param behavior - The scroll behavior ('auto' or 'smooth')
   */
  private scrollToTop(behavior: ScrollBehavior = 'auto'): void {
    // Method 1: Using window.scrollTo with options
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: behavior
    });
    
    // Method 2: Using document.scrollingElement
    if (typeof document !== 'undefined') {
      const scrollingElement = document.scrollingElement || document.documentElement;
      if (scrollingElement && scrollingElement.scrollTop !== 0) {
        scrollingElement.scrollTop = 0;
      }
    }
    
    // Method 3: Using document.body and document.documentElement directly
    if (document.body) document.body.scrollTop = 0;
    if (document.documentElement) document.documentElement.scrollTop = 0;
  }
} 