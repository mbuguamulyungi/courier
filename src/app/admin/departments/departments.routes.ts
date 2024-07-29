import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { AddDepartmentComponent } from './add-department/add-department.component';
import { DepartmentListComponent } from './department-list/department-list.component';

export const DEPARTMENT_ROUTE: Route[] = [
  {
    path: 'department-list',
    component: DepartmentListComponent,
  },
  {
    path: 'add-department',
    component: AddDepartmentComponent,
  },
  { path: '**', component: Page404Component },
];

