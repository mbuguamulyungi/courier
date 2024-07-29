import { serverUrl } from 'environments/environment.development';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '@core/service/auth.service';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-profile',
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
        BreadcrumbComponent,
        HttpClientModule
    ],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})

export class ProfileComponent implements OnInit {
    error: any;
    userInfo: any;
    profileData: any;
    sessionId: any;
    profilePhoto!: SafeResourceUrl;
    role: any;

    constructor(private authService: AuthService, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.userInfo = localStorage.getItem('currentUser')
        this.userInfo = JSON.parse(this.userInfo || '');
        console.log(this.userInfo);
        
        this.role = this.userInfo.roles[0].role
        this.sessionId = localStorage.getItem('sessionId');
        this.getUserProfile()
    }

    getUserProfile() {
        var options = {
            'method': 'GET',
            'url': serverUrl + 'api/v1/medical/user/' + this.userInfo.user_id,
            'headers': {
                'Content-Type': 'application/json',
                'Cookie': 'frontend_lang=en_US;' + this.sessionId
            },
            'body': ''
        };
        const endPoint = "api";
        this.authService.sendRequest('post', endPoint, options)
            .subscribe({
                next: (res) => {
                    let body = JSON.parse(res.body)
                    this.profileData = body.data;
                    if (this.profileData.profile_photo) {
                       this.profilePhoto = this.profileData.profile_photo;
                    }
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.error = error.message;
                },
            });
    }

    // getSanitizedImageUrl(): SafeResourceUrl {
    //     if(this.profileData?.profile_photo != ''){
    //         return this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${this.profilePhoto}`);
    //     }else{
    //         return this.sanitizer.bypassSecurityTrustResourceUrl(`../../../../assets/images/user/${this.userInfo.roles[0].role}.jpg`);
    //     }
    //   }


}
