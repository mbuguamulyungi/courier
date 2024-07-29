import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { AddMedicineComponent } from './add-medicine/add-medicine.component';
import { MedicineListComponent } from './medicine-list/medicine-list.component';

export const PHARMACY_ROUTE: Route[] = [
  {
    path: 'medicine-list',
    component: MedicineListComponent,
  },
  {
    path: 'add-medicine',
    component: AddMedicineComponent,
  },
  { path: '**', component: Page404Component },
];

