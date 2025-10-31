import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { V2LayoutComponent } from './layout/v2-layout/v2-layout.component';
import { AboutComponent } from './pages/about/about.component';
import { V2AboutComponent } from './pages/about/v2-about.component';
import { ExperiencePageComponent } from './pages/experience/experience.component';
import { V2ExperienceComponent } from './pages/experience/v2-experience.component';
import { SkillsComponent } from './pages/skills/skills.component';
import { ProjectsPageComponent } from './pages/projects/projects.component';
import { V2ProjectsComponent } from './pages/projects/v2-projects.component';
import { MyPagesComponent } from './pages/my-pages/my-pages.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  // V1 Routes (Classic Layout)
  {
    path: 'v1',
    component: MainLayoutComponent,
    children: [
      {
        path: 'about',
        component: AboutComponent,
        data: { animation: 'AboutPage' }
      },
      { 
        path: 'experience', 
        component: ExperiencePageComponent,
        data: { animation: 'ExperiencePage' }
      },
      { 
        path: 'skills', 
        component: SkillsComponent,
        data: { animation: 'SkillsPage' }
      },
      { 
        path: 'projects', 
        component: ProjectsPageComponent,
        data: { animation: 'ProjectsPage' }
      },
      {
        path: 'my-pages',
        component: MyPagesComponent,
        data: { animation: 'MyPagesPage' }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { animation: 'SettingsPage' }
      },
      { path: '', redirectTo: 'about', pathMatch: 'full' }
    ]
  },
  
  // V2 Routes (Modern Layout)
  {
    path: 'v2',
    component: V2LayoutComponent,
    children: [
      {
        path: 'about',
        component: V2AboutComponent,
        data: { animation: 'V2AboutPage' }
      },
      { 
        path: 'experience', 
        component: V2ExperienceComponent,
        data: { animation: 'V2ExperiencePage' }
      },
      { 
        path: 'skills', 
        component: SkillsComponent,
        data: { animation: 'V2SkillsPage' }
      },
      { 
        path: 'projects', 
        component: V2ProjectsComponent,
        data: { animation: 'V2ProjectsPage' }
      },
      {
        path: 'my-pages',
        component: MyPagesComponent,
        data: { animation: 'V2MyPagesPage' }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { animation: 'V2SettingsPage' }
      },
      { path: '', redirectTo: 'about', pathMatch: 'full' }
    ]
  },

  // Legacy routes (redirect to v1)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'about',
        component: AboutComponent,
        data: { animation: 'AboutPage' }
      },
      { 
        path: 'experience', 
        component: ExperiencePageComponent,
        data: { animation: 'ExperiencePage' }
      },
      { 
        path: 'skills', 
        component: SkillsComponent,
        data: { animation: 'SkillsPage' }
      },
      { 
        path: 'projects', 
        component: ProjectsPageComponent,
        data: { animation: 'ProjectsPage' }
      },
      {
        path: 'my-pages',
        component: MyPagesComponent,
        data: { animation: 'MyPagesPage' }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { animation: 'SettingsPage' }
      },
      { path: '', redirectTo: 'about', pathMatch: 'full' }
    ]
  },
  
  // Default redirect
  { path: '**', redirectTo: '/v1/about' }
];
