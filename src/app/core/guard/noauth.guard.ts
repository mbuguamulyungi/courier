import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../service/auth.service';

@Injectable({
    providedIn: 'root',
})
export class NoAuthGuard {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (Object.keys(localStorage.getItem('currentUser') || {}).length) {
            return false;
        }
        return true;
    }
}
