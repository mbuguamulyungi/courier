import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { AmbulanceCallListComponent } from './ambulance-call-list/ambulance-call-list.component';
import { AmbulanceListComponent } from './ambulance-list/ambulance-list.component';

export const AMBULANCE_ROUTE: Route[] = [
  {
    path: 'call-list',
    component: AmbulanceCallListComponent,
  },
  {
    path: 'list',
    component: AmbulanceListComponent,
  },
  { path: '**', component: Page404Component },
];

