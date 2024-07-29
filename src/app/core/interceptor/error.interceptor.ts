import { AuthService } from "../service/auth.service";
import { Injectable } from "@angular/core";
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ToastrMessagesService } from "@core/service/toastr-messages.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private toastr: ToastrMessagesService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(
            catchError((err) => {    
                console.log('---------err interceptor------', err);
                if (err.status === 401) {
                    this.authService.logout();
                    location.reload();
                }
                const error = err.error.message || err.statusText;
                return throwError(error);
            })
        );
    }
}
