import { Route } from "@angular/router";

import { Page404Component } from "../../authentication/page404/page404.component";
import { ViewDeliveriesComponent } from "./viewdeliveries/view-deliveries/view-deliveries.component";

export const DELIVERIES_ROUTE: Route[] = [
  { 
    path: "viewDeliveries",
    component: ViewDeliveriesComponent,
  },
  { path: "**", component: Page404Component },
];
