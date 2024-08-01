import { Route } from "@angular/router";

import { Page404Component } from "../../authentication/page404/page404.component";
import { SalesOrderListComponent } from "./sales-order-list/sales-order-list.component";


export const SALES_ORDER_ROUTE: Route[] = [
  { 
    path: "sales-orders",
    component: SalesOrderListComponent,
  },
  { path: "**", component: Page404Component },
];
