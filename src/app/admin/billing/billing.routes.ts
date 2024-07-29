import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { AddBillComponent } from './add-bill/add-bill.component';
import { BillListComponent } from './bill-list/bill-list.component';
import { InvoiceComponent } from './invoice/invoice.component';

export const BILLING_ROUTE: Route[] = [
  {
    path: 'bill-list',
    component: BillListComponent,
  },
  {
    path: 'add-bill',
    component: AddBillComponent,
  },
  {
    path: 'invoice',
    component: InvoiceComponent,
  },
  { path: '**', component: Page404Component },
];

