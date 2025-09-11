import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AboutComponent } from './pages/about/about.component';
import { ExperiencePageComponent } from './pages/experience/experience.component';
import { SkillsComponent } from './pages/skills/skills.component';
import { ProjectsPageComponent } from './pages/projects/projects.component';
import { MyPagesComponent } from './pages/my-pages/my-pages.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'about',
        component: AboutComponent,
        pathMatch: 'full',
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
      { path: '**', redirectTo: 'about' }
    ]
  },
  { path: '**', redirectTo: 'about' }
];
