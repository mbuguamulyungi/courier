import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, finalize, of } from 'rxjs';
import { User } from '../models/user';
import { environment, serverUrl } from 'environments/environment.development';
import { ToastrMessagesService } from './toastr-messages.service';

@Injectable({
    providedIn: 'root',
})

export class AuthService {
    public currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    public apiUrl: any = environment.apiUrl;
    responseMessage: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    sessionId: any;


    constructor(private http: HttpClient, private toastr: ToastrMessagesService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
        this.currentUser = this.currentUserSubject.asObservable();
        this.sessionId = localStorage.getItem('sessionId');
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    sendRequest(method: string, endPoint: string, data: any): Observable<any> {
        return this.actualSendRequest(method, endPoint, data)
    }

    actualSendRequest(method: string, endPoint: string, data: any): Observable<any> {
        const url = endPoint.includes('countries.json') ? endPoint : `${this.apiUrl}${endPoint}`;
        switch (method.toLowerCase()) {
            case 'post':
                return this.http.post(url, data);
            case 'put':
                return this.http.put(url, data);
            case 'delete':
                return this.http.delete(url);
            default:
                return this.http.get(url);
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(this.currentUserValue);
        return of({ success: false });
    }
}
