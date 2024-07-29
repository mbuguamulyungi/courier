import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { BirthComponent } from './birth/birth.component';
import { DeathComponent } from './death/death.component';

export const RECORDS_ROUTE: Route[] = [
  {
    path: 'birth',
    component: BirthComponent,
  },
  {
    path: 'death',
    component: DeathComponent,
  },
  { path: '**', component: Page404Component },
];

