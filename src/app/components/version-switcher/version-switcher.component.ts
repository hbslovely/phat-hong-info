import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'app-version-switcher',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzMenuModule
  ],
  template: `
    <div nz-dropdown [nzDropdownMenu]="versionMenu" [nzTrigger]="'click'" class="version-switcher">
      <button nz-button nzType="text" class="version-btn">
        <span nz-icon nzType="experiment" nzTheme="outline"></span>
        {{ currentVersion() === 'v2' ? 'V2' : 'V1' }}
        <span nz-icon nzType="down" nzTheme="outline"></span>
      </button>
    </div>
    <nz-dropdown-menu #versionMenu="nzDropdownMenu">
      <ul nz-menu nzSelectable>
        <li nz-menu-item (click)="switchToV1()" [nzDisabled]="currentVersion() === 'v1'">
          <span nz-icon nzType="home" nzTheme="outline"></span>
          V1 (Classic)
        </li>
        <li nz-menu-item (click)="switchToV2()" [nzDisabled]="currentVersion() === 'v2'">
          <span nz-icon nzType="experiment" nzTheme="outline"></span>
          V2 (Modern)
        </li>
      </ul>
    </nz-dropdown-menu>
  `,
  styleUrls: ['./version-switcher.component.scss']
})
export class VersionSwitcherComponent {
  private readonly versionService = inject(VersionService);
  
  readonly currentVersion = this.versionService.currentVersion;

  switchToV1(): void {
    this.versionService.switchVersion('v1');
  }

  switchToV2(): void {
    this.versionService.switchVersion('v2');
  }
}
