import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, RouterModule } from '@angular/router';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import { AuthService } from '@core';
import { NgAngularLoaderModule } from 'ng-angular-loader';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        PageLoaderComponent,
        NgAngularLoaderModule
    ],
    providers: [],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    currentUrl!: string;
    constructor(public _router: Router, public authService: AuthService) {

        this._router.events.subscribe((routerEvent: Event) => {
            if (routerEvent instanceof NavigationStart) {
                this.currentUrl = routerEvent.url.substring(
                    routerEvent.url.lastIndexOf('/') + 1
                );
            }
            if (routerEvent instanceof NavigationEnd) {
                /* empty */
            }
            window.scrollTo(0, 0);
        });
    }
}