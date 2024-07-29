import { Route } from "@angular/router";
import { SigninComponent } from "./signin/signin.component";
import { SignupComponent } from "./signup/signup.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { LockedComponent } from "./locked/locked.component";
import { Page404Component } from "./page404/page404.component";
import { Page500Component } from "./page500/page500.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { NoAuthGuard } from "@core/guard/noauth.guard";

export const AUTH_ROUTE: Route[] = [
    {
        path: "",
        redirectTo: "signin",
        pathMatch: "full",
    },
    {
        canActivate: [NoAuthGuard],
        path: "signin",
        component: SigninComponent,
    },
    {
        canActivate: [NoAuthGuard],
        path: "signup",
        component: SignupComponent,
    },
    {
        canActivate: [NoAuthGuard],
        path: "forgot-password",
        component: ForgotPasswordComponent,
    },
    {
        canActivate: [NoAuthGuard],
        path: "reset-password",
        component: ResetPasswordComponent,
    },
    {
        path: "locked",
        component: LockedComponent,
    },
    {
        path: "page404",
        component: Page404Component,
    },
    {
        path: "page500",
        component: Page500Component,
    },
];
