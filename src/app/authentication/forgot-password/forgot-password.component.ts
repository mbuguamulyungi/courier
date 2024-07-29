import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { serverUrl } from 'environments/environment.development';
import { AuthService } from '@core/service/auth.service';
import { ToastrMessagesService } from '@core/service/toastr-messages.service';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        RouterLink,
        NgbModule
    ],
})

export class ForgotPasswordComponent implements OnInit {
    authForm!: UntypedFormGroup;
    submitted = false;
    returnUrl!: string;
    error: any;
    success: any;
    respMsg: any;
    modalRef: NgbModalRef | any;
    @ViewChild('modalContent') modalContent!: ElementRef;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private toastr: ToastrMessagesService,
        private modalService: NgbModal,
    ) { }

    ngOnInit() {
        this.authForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
        });
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    get f() {
        return this.authForm.controls;
    }

    onSubmit() {
        this.submitted = true;
        if (this.authForm.invalid) {
            return;
        } else {
            const payload = {
                email: this.authForm.value.email,
            };
    
            var options = {
                'method': 'POST',
                'url': serverUrl + 'api/v1/forgot_password',
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
                        this.submitted = false;
                        let body = JSON.parse(res.body);
                        if (body.result?.message) {
                            this.respMsg = body.result.message
                            this.openPopup(this.modalContent);
                        } else if (body.result?.error) {
                            this.toastr.showError(body?.result?.error, 'Error');
                            this.submitted = false;
                        }
                    },
                    error: (error) => {
                         this.toastr.newLoader = false;
                        this.toastr.showError(error?.message, 'Error');
                        this.submitted = false;
                    },
                });
        }
    }

    openPopup(content: any) {
        this.modalRef = this.modalService.open(content, { centered: true, size: 'sm' });
        this.modalRef.hidden.subscribe(() => {
            this.router.navigate(['/authentication/signin']);
        });
    }

    closePopup() {
        // Close the modal
        this.modalRef.close();
    }
}

