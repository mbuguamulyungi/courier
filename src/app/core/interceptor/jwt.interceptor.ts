import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError, } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { ToastrMessagesService } from '@core/service/toastr-messages.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService, private toastr: ToastrMessagesService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const sessionId = localStorage.getItem('sessionId');
        if (sessionId && sessionId) {
            request = request.clone({
                setHeaders: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
            });
        }
        return next.handle(request).pipe(
            tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                }
            }),
        );
    }
}
