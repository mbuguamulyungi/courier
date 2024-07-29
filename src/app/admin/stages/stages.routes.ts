import { Route } from "@angular/router";

import { Page404Component } from "../../authentication/page404/page404.component";
import { AllStagesComponent } from "./all-stages/all-stages.component";

export const STAGES_ROUTE: Route[] = [
  { 
    path: "allStages",
    component: AllStagesComponent,
  },
  { path: "**", component: Page404Component },
];
