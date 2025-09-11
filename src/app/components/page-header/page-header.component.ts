import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, NzIconModule, TranslateModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() backgroundImage: string = '';
  @Input() showCustomContent: boolean = false;
  
  currentPage: string = '';
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit() {
    // Get current route for determining which gallery image to use
    this.currentPage = this.route.snapshot.data['animation']?.replace('Page', '').toLowerCase() || 'about';
    
    // If no background image provided, use the one based on current page
    if (!this.backgroundImage) {
      this.backgroundImage = `assets/images/gallery/${this.currentPage}.png`;
    }
  }
} 