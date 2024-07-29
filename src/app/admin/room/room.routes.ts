import { Route } from "@angular/router";
import { AllroomComponent } from "./allroom/allroom.component";
import { AddAllotmentComponent } from "./add-allotment/add-allotment.component";
import { EditAllotmentComponent } from "./edit-allotment/edit-allotment.component";
import { Page404Component } from "../../authentication/page404/page404.component";
export const ROOMS_ROUTE: Route[] = [
  {
    path: "all-rooms",
    component: AllroomComponent,
  },
  {
    path: "add-allotment",
    component: AddAllotmentComponent,
  },
  {
    path: "edit-allotment",
    component: EditAllotmentComponent,
  },
  { path: "**", component: Page404Component },
];
