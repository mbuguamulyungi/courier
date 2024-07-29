import { PatientProfileComponent } from "./patient-profile/patient-profile.component";
import { EditPatientComponent } from "./edit-patient/edit-patient.component";
import { AddPatientComponent } from "./add-patient/add-patient.component";
import { AllpatientsComponent } from "./allpatients/allpatients.component";
import { Page404Component } from "../../authentication/page404/page404.component";
import { Route } from "@angular/router";

export const PATIENT_ROUTE: Route[] = [
  {
    path: "all-patients",
    component: AllpatientsComponent,
  },
  {
    path: "add-patient",
    component: AddPatientComponent,
  },
  {
    path: "edit-patient",
    component: EditPatientComponent,
  },
  {
    path: "patient-profile",
    component: PatientProfileComponent,
  },
  { path: "**", component: Page404Component },
];

