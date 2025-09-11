import { Directive, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollToTop]',
  standalone: true
})
export class ScrollToTopDirective implements OnInit {
  ngOnInit() {
    // Immediate scroll
    window.scrollTo(0, 0);
    
    // Delayed scroll for safety (in case component initialization delays affect scrolling)
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto' // Use 'auto' for immediate jump without animation
      });
    }, 100);
  }
} 