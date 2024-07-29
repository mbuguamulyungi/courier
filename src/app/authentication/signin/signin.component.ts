import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, Role } from '@core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { serverUrl } from '../../../environments/environment';
import { ToastrMessagesService } from '@core/service/toastr-messages.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { CommonFunctionService } from '@core/service/common-function.service';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    standalone: true,
    imports: [
        RouterLink,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        HttpClientModule,
    ],
})

export class SigninComponent implements OnInit {
    submitted = false;
    loading = false;
    error = '';
    hide = true;
    checkRemember: boolean = false;
    @ViewChild('remeberMe', { static: false }) myElementRef: ElementRef | any;
    authForm!: UntypedFormGroup;
    success: any;
    sessionId: any;
    userData: any;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private router: Router,
        private authService: AuthService,
        private cookieService: CookieService,
        private toastr: ToastrMessagesService,
        private sanitizer: DomSanitizer,
        private commonFunction: CommonFunctionService
    ) {
        // super();
    }

    ngOnInit() {
        this.authService.responseMessage.subscribe((resp: any) => {
            this.success = resp;
            setTimeout(() => {
                this.success = '';
            }, 3000);
        });

        this.authForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required]
        });

        if ((this.cookieService.get('username') && this.cookieService.get('username') != null) && (this.cookieService.get('password') && this.cookieService.get('password') != null)) {
            this.checkRemember = true;
            this.authForm.controls["username"].setValue(this.cookieService.get('username'));
            this.authForm.controls["password"].setValue(this.cookieService.get('password'));
        }
    }

    onSubmit() {
        if (this.myElementRef.nativeElement.checked == true) {
            this.cookieService.set('username', this.authForm.controls['username'].value);
            this.cookieService.set('password', this.authForm.controls['password'].value);
        }
        this.submitted = true;
        this.error = '';
        var options = {
            'method': 'POST',
            'url': serverUrl + 'api/v1/login',
            'headers': {
                'Content-Type': 'application/json',
            },
            'body': {
                "jsonrpc": "2.0",
                "params": {
                    "db": "odoo17",
                    "login": this.authForm.value.username,
                    "password": this.authForm.value.password
                }
            }
        };

        if (this.authForm.invalid) {
            this.error = 'Username and Password not valid !';
            return;
        } else {
            this.toastr.newLoader = true;
            const endPoint = "api";
            // this.subs.sink = this.authService.sendRequest('post', endPoint, options)
            this.authService.sendRequest('post', endPoint, options)
                .subscribe({
                    next: (res) => {
                        this.toastr.newLoader = false;
                        let body = JSON.parse(res.body)
                        console.log(body);
                        
                        let rawHeaders = res.rawHeaders;
                        if (body && body?.result) {
                            this.toastr.showSuccess('Successfully Login', 'Success');
                            this.setDataInLocalStorages(body, rawHeaders);
                        } else {
                            this.toastr.showError(body?.error?.data?.message, 'Error');
                            this.submitted = false;
                        }
                    },
                    error: (error) => {
                        this.toastr.newLoader = false;
                        this.toastr.showError(error.message, 'Error');
                        this.submitted = false;
                    },
                });
        }
    }

    setDataInLocalStorages(body: any, rawHeaders: any) {
        this.sessionId = rawHeaders[5].split(';')[0]
        this.userData = body?.result;
        // if (this.userData?.roles?.length == 0) {
        //     this.userData['roles'] = [{ role: 'admin' }];
        // }
        this.getParter(this.userData.user_id) 
        localStorage.setItem('sessionId', rawHeaders[5].split(';')[0]);

    }

    getParter(user_id: any) {
        var options = {
            'method': 'GET',
            'url': serverUrl + 'api/v1/medical/user/' + user_id,
            'headers': {
                'Content-Type': 'application/json',
                'Cookie': 'frontend_lang=en_US;' + this.sessionId
            },
            'body': ''
        };
        const endPoint = "api";
        this.authService.sendRequest('post', endPoint, options)
            .subscribe({
                next: async (res) => {
                    let body = JSON.parse(res.body);
                    this.userData['email'] = body.data.email;
                    this.userData['partner_name'] = body.data.partner_name;
                    this.userData['partner_id'] = body.data.partner_id;
                    this.userData['profile_image'] = body.data?.profile_photo;
                    let userRole = body.data.roles[0].role;
                    userRole = userRole.charAt(0).toUpperCase() + userRole.slice(1)
                    this.userData['roles'] = [{ role: userRole }];

                    if (body.data?.profile_photo) {
                        let finalImage: any = await this.commonFunction.convertBase64ToSafeUrl(body.data?.profile_photo);                       
                        this.userData['profile_image'] = finalImage;
                    } else {
                        this.userData['profile_image'] = this.sanitizer.bypassSecurityTrustResourceUrl(`../../../../assets/images/user/${this.userData.roles[0].role}.jpg`);
                    }
                    
                    localStorage.setItem('currentUser', JSON.stringify(this.userData));
                    sessionStorage.setItem('currentUser', JSON.stringify(this.userData));
                    this.authService.currentUserSubject.next(this.userData);
                    // this.router.navigate(['/landing']);
                    setTimeout(() => {
                        console.log(this.authService.currentUserValue);
                        const role = this.authService.currentUserValue.roles[0].role;
                        
                        if (role === Role.All || role === Role.Admin) {
                            this.router.navigate(['/admin/dashboard/main']);
                        } else if (role == Role.Dispatcher) {          
                            this.router.navigate(['/dispatcher/dashboard']);
                        } else if (role === Role.Doctor) {          
                            this.router.navigate(['/doctor/dashboard']);
                        } else if (role === Role.Patient) {
                            this.router.navigate(['/patient/dashboard']);
                        } else {
                            this.router.navigate(['/authentication/signin']);
                        }
                        this.loading = false;
                      }, 1000);
                },
                error: (error) => {
                    this.error = error.message;
                },
            });
    }


}
