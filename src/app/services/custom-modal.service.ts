import { Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Overlay } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class CustomModalService {
  private scrollBarWidth = 0;
  
  constructor(
    private modalService: NzModalService,
    private overlay: Overlay
  ) {
    // Calculate scrollbar width once
    this.calculateScrollbarWidth();
  }
  
  private calculateScrollbarWidth(): void {
    // Create a div with scrollbars and measure the difference
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    this.scrollBarWidth = outer.offsetWidth - inner.offsetWidth;
    document.body.removeChild(outer);
    
    // Update CSS variable
    document.documentElement.style.setProperty('--scrollbar-width', `${this.scrollBarWidth}px`);
  }
  
  // Create method with noop scroll strategy
  create(config: any): any {
    // Apply noop scroll strategy
    const updatedConfig = {
      ...config,
      nzScrollStrategy: this.overlay.scrollStrategies.noop()
    };
    return this.modalService.create(updatedConfig);
  }

  // Proxy other methods from NzModalService
  closeAll(): void {
    return this.modalService.closeAll();
  }

  confirm(options: any): any {
    const updatedOptions = {
      ...options,
      nzScrollStrategy: this.overlay.scrollStrategies.noop()
    };
    return this.modalService.confirm(updatedOptions);
  }

  info(options: any): any {
    const updatedOptions = {
      ...options,
      nzScrollStrategy: this.overlay.scrollStrategies.noop()
    };
    return this.modalService.info(updatedOptions);
  }

  success(options: any): any {
    const updatedOptions = {
      ...options,
      nzScrollStrategy: this.overlay.scrollStrategies.noop()
    };
    return this.modalService.success(updatedOptions);
  }

  error(options: any): any {
    const updatedOptions = {
      ...options,
      nzScrollStrategy: this.overlay.scrollStrategies.noop()
    };
    return this.modalService.error(updatedOptions);
  }

  warning(options: any): any {
    const updatedOptions = {
      ...options,
      nzScrollStrategy: this.overlay.scrollStrategies.noop()
    };
    return this.modalService.warning(updatedOptions);
  }
} 