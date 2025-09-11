import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ContactButtonComponent } from '../../components/contact-button/contact-button.component';
import { WatermarkComponent } from '../../components/watermark/watermark.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { ScrollToTopDirective } from '../../directives/scroll-to-top.directive';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavBarComponent,
    FooterComponent,
    ContactButtonComponent,
    WatermarkComponent,
    ScrollToTopDirective
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class MainLayoutComponent {
  constructor() {}

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
