import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '@core/service/auth.service';
import { CommonModule } from '@angular/common';
import { MustMatch } from '@core/validators/mustMatch.validator';
import { serverUrl } from '../../../environments/environment';
import { ToastrMessagesService } from '@core/service/toastr-messages.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        RouterLink,
        MatButtonModule,
        MatOptionModule,
        MatSelectModule,
    ],
})

export class SignupComponent implements OnInit {
    authForm!: UntypedFormGroup;
    submitted = false;
    hide = true;
    chide = true;
    error: any;
    countries: any[] = [];
    roles:any[] = [];

    constructor(
        private formBuilder: UntypedFormBuilder,
        private router: Router,
        private authService: AuthService,
        private toastr: ToastrMessagesService
    ) { }

    ngOnInit() {
        this.getRoles();
        this.getCountries();
        this.authForm = this.formBuilder.group(
            {
                first_name: ['', Validators.required],
                last_name: ['', Validators.required],
                gender: ['', Validators.required],
                phone: ['', [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]],
                country: ['', Validators.required],
                roleId: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
                cpassword: ['', Validators.required],
            },
            {
                validator: MustMatch('password', 'cpassword')
            }
        );
    }

    getRoles() {
        var options = {
            'method': 'GET',
            'url': serverUrl + 'api/v1/partner/roles',
            'headers': {
                'Content-Type': 'application/json',
                // 'Cookie': 'frontend_lang=en_US;' + this.sessionId
            },
            'body': ''
        };
        const endPoint = "api";
        this.authService.sendRequest('post', endPoint, options)
            .subscribe({
                next: (res) => {
                    let body = JSON.parse(res.body)
                    body.data.roles.forEach((role:any) => {
                        this.roles.push({ id: role.id, role: role.role });
                    });
                },  
                error: (error) => {
                    this.error = error.message;
                },
            });
    }

    getCountries() {
        this.authService.sendRequest('get', '../../../assets/data/countries.json', null)
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.countries = Object.values(res).map((country: any) => ({
                            "name": country.name,
                            "phone_code": country.number
                        }));
                    }
                }
            });
    }

    onSubmit() {
        this.submitted = true;
        if (this.authForm.invalid) {
            return;
        } else {                        
            const payload = {
                first_name: this.authForm.value.first_name,
                last_name: this.authForm.value.last_name,
                gender: this.authForm.value.gender,
                phone: this.authForm.value.phone,
                email: this.authForm.value.email,
                country: this.authForm.value.country,
                role_id: this.authForm.value.roleId,
                password: this.authForm.value.password
            }            
            var options = {
                'method': 'POST',
                'url': serverUrl + 'api/v1/medical/signup',
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
                        let body = JSON.parse(res.body)
                        if (body && body?.result) {
                            this.toastr.showSuccess("Successfully Registered", 'Success');
                            this.router.navigate(['/authentication/signin']);
                        } else {
                            this.toastr.showError("Something went wrong", 'Error');
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
