import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { serverUrl } from 'environments/environment.development';
import { AuthService } from '@core/service/auth.service';
import { MustMatch } from '@core/validators/mustMatch.validator';
import { ToastrMessagesService } from '@core/service/toastr-messages.service';
@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        RouterLink,
    ],
})

export class ResetPasswordComponent implements OnInit {

    authForm!: UntypedFormGroup;
    submitted = false;
    returnUrl!: string;
    hide = true;
    chide = true;
    error: any;
    token: string = '';
    email: string = '';
    success: any;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private toastr: ToastrMessagesService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
            // this.email = params['email'];
        })
        this.authForm = this.formBuilder.group(
            {
                password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
                cpassword: ['', Validators.required],
                // email: [this.email, Validators.required],
            },
            {
                validator: MustMatch('password', 'cpassword')
            });
    }

    onSubmit() {
        this.submitted = true;
        if (this.authForm.invalid) {
            return;
        } else {
            const payload = {
                // email: this.email,
                token: this.token,
                confirm_password: this.authForm.value.password,
                new_password: this.authForm.value.cpassword
            }
            var options = {
                'method': 'POST',
                'url': serverUrl + 'api/v1/reset_password',
                'headers': {
                    'Content-Type': 'application/json',
                },
                'body': payload
            };
            const endPoint = "api";
            this.toastr.newLoader = true;
            this.authService.sendRequest('post', endPoint, options)
                .subscribe({
                    next: (res) => {
                        this.toastr.newLoader = false;
                        let body = JSON.parse(res.body);
                        if (body && body?.result.message) {
                            this.toastr.showSuccess(body?.result?.message, 'Success');
                            this.router.navigate(['/authentication/signin']);
                            this.authForm.reset();
                            this.authService.responseMessage.next(body.result.message);
                        } else {
                            this.toastr.showError(body?.result?.error, 'Error');
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
}