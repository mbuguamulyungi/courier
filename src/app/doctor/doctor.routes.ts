import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { PatientsComponent } from './patients/patients.component';
import { Page404Component } from '../authentication/page404/page404.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from '@shared/components/profile/profile.component';
import { AllStagesComponent } from 'app/admin/stages/all-stages/all-stages.component';
import { ViewDeliveriesComponent } from 'app/admin/deliveries/viewdeliveries/view-deliveries/view-deliveries.component';
export const DOCTOR_ROUTE: Route[] = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'stages/allStages', component: AllStagesComponent
  },
  {
    path: 'deliveries/viewDeliveries', component: ViewDeliveriesComponent
  },
  {
    path: 'appointments',
    component: AppointmentsComponent,
  },
  {
    path: 'doctors',
    component: DoctorsComponent,
  },
  {
    path: 'patients',
    component: PatientsComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  { path: '**', component: Page404Component },
];

