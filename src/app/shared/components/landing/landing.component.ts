import { AfterViewInit, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { MatSliderModule } from '@angular/material/slider';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/service/auth.service';
import { Role } from '@core/models/role';
import * as $ from 'jquery';
import { FeatherIconsComponent } from "../feather-icons/feather-icons.component";
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-landing',
    standalone: true,
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss',
    imports: [
        CommonModule,
        CarouselModule,
        MatSliderModule,
        MatButtonModule,
        MatMenuModule,
        SlickCarouselModule,
        RouterModule,
        FeatherIconsComponent
    ]
})
export class LandingComponent implements OnInit, AfterViewInit {

    email: string = 'info@nischinto.com';
    activeTab: string = 'tab1';

    slideData: any[] = [
        { img: '../../../../assets/landingPage/hero-img.png' },
        { img: '../../../../assets/landingPage/hero-img1.png' },
        { img: '../../../../assets/landingPage/hero-img2.png' },
    ];
    currentSlideIndex = 0;
    slick: any;
    slideConfig = { slidesToShow: 4, slidesToScroll: 4 };
    slickConfig: any;

    map: mapboxgl.Map | undefined;
    style = 'mapbox://styles/mapbox/streets-v11';
    lat: number = 30.2672;
    lng: number = -97.7431;

    activeIndex: number = -1;
    accordionItems = [
        { question: 'What is Medi solution?', answer: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since when an unknown printer took a galley of type and scrambled it to make a type specimen book.' },
        { question: 'How do I get a refill on my prescription?', answer: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since when an unknown printer took a galley of type and scrambled it to make a type specimen book.' },
        { question: 'How competent our total treatment?', answer: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since when an unknown printer took a galley of type and scrambled it to make a type specimen book.' },
        { question: 'If I get sick what should I do?', answer: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since when an unknown printer took a galley of type and scrambled it to make a type specimen book.' },
        { question: 'What is emergency care to your hospital?', answer: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since when an unknown printer took a galley of type and scrambled it to make a type specimen book.' }
    ];
    userDetail: any;

    customOptions: OwlOptions = {
        loop: true,
        mouseDrag: false,
        touchDrag: false,
        pullDrag: false,
        dots: false,
        margin: 30,
        navSpeed: 700,
        navText: ['<i class="fa fa-chevron-right"></i>', '<i class="fa fa-chevron-right"></i>'],
        responsive: {
            0: {
                items: 1
            },
            400: {
                items: 2
            },
            740: {
                items: 3
            },
            940: {
                items: 4
            }
        },
        nav: true
    }

    customOptionsPrice: OwlOptions = {
        loop: true,
        mouseDrag: false,
        touchDrag: false,
        pullDrag: false,
        dots: false,
        margin: 30,
        navSpeed: 700,
        navText: ['<i class="fa fa-chevron-right"></i>', '<i class="fa fa-chevron-right"></i>'],
        responsive: {
            0: {
                items: 1
            },
            400: {
                items: 2
            },
            740: {
                items: 3
            },
            940: {
                items: 3
            }
        },
        nav: true
    }

    customOptionsDoctors: OwlOptions = {
        loop: true,
        mouseDrag: false,
        touchDrag: false,
        pullDrag: false,
        dots: false,
        margin: 30,
        navSpeed: 700,
        navText: ['<i class="fa fa-chevron-right"></i>', '<i class="fa fa-chevron-right"></i>'],
        responsive: {
            0: {
                items: 1
            },
            400: {
                items: 2
            },
            740: {
                items: 3
            },
            940: {
                items: 4
            }
        },
        nav: true
    }

    customOptionsHeadings: OwlOptions = {
        loop: true,
        mouseDrag: false,
        touchDrag: false,
        pullDrag: false,
        dots: false,
        margin: 30,
        navSpeed: 700,
        navText: ['<i class="fa fa-chevron-right"></i>', '<i class="fa fa-chevron-right"></i>'],
        responsive: {
            0: {
                items: 1
            },
            400: {
                items: 2
            },
            740: {
                items: 3
            },
            940: {
                items: 3
            }
        },
        nav: true
    }

    yearsExp: number = 1;
    happyPatients: number = 1;
    qualifiedDoctors: number = 1;
    hospitalRooms: number = 1;
    interval: any;
    section: any;
    userImg: any;

    constructor(
        private router: Router,
        private authService: AuthService, private elementRef: ElementRef, private renderer: Renderer2,
    ) { }

    ngOnInit() {
        const currentUrl = this.router.url;

        if (currentUrl.includes('doctor')) {
            this.section = 'doctor';
        } else if (currentUrl.includes('patient')) {
            this.section = 'patient';
        } else {
            this.section = 'admin';
        }
        this.userImg = this.authService.currentUserValue;
        this.startCounter();
        this.userDetail = JSON.parse(localStorage.getItem('currentUser') || 'null');
        
        this.slickConfig = {
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: false,
            fade: true,
            infinite: true,
            speed: 500,
            dots: false,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {},
                },
            ],
            customPaging: (slider: any, i: any) => {
                return '';
            },
        };

        this.map = new mapboxgl.Map({
            accessToken: environment.mapbox.accessToken,
            container: 'map',
            style: this.style,
            zoom: 13,
            center: [this.lng, this.lat]
        });
    }

    ngAfterViewInit() {
        const pricingTables = this.elementRef.nativeElement.querySelectorAll('.st-pricing-table.st-style1');
        pricingTables.forEach((table: any) => {
            this.renderer.listen(table, 'mouseenter', () => {
                pricingTables.forEach((t: any) => this.renderer.addClass(t, 'st-active'));
                this.renderer.removeClass(table, 'st-active');
            });
            this.renderer.listen(table, 'mouseleave', () => {
                pricingTables.forEach((t: any) => this.renderer.removeClass(t, 'st-active'));
            });
        });

        // Handle menu toggle click
        const menuToggle = this.elementRef.nativeElement.querySelector('.st-munu-toggle');
        const onepageNav = this.elementRef.nativeElement.querySelector('.st-onepage-nav');
        this.renderer.listen(menuToggle, 'click', () => {
            if (onepageNav) {
                onepageNav.style.display = 'block';
            }
            menuToggle.classList.toggle('st-toggle-active');
            menuToggle.classList.forEach((element:any) => {                
                if(element == 'st-toggle-active') {
                    onepageNav.style.display = 'block';
                } else {
                    onepageNav.style.display = 'none';
                }
            });
        });

    }

    startCounter(): void {
        this.interval = setInterval(() => {
            if (this.yearsExp < 20) {
                this.yearsExp++;
            }
            if (this.qualifiedDoctors < 99) {
                this.qualifiedDoctors++;
            }
            if (this.hospitalRooms < 125) {
                this.hospitalRooms++;
            }
            if (this.happyPatients < 2354) {
                this.happyPatients++;
            }
            else {
                clearInterval(this.interval);
            }
        }, 0.001); // Increment every millisecond
    }

    onDashboard() {
        // const role = this.authService.currentUserValue.role;
        let role = (this.userDetail.roles[0].role);
        
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
    }

    scrollToSection(sectionId: any) {
        var section = document.getElementById(sectionId);        
        if (section) {
            var top = section.offsetTop;
            window.scrollTo({
                top: top,
                behavior: 'smooth' // This enables smooth scrolling
            });
        }
    }

    toggleAccordion(index: number) {
        if (this.activeIndex === index) {
            this.activeIndex = -1;
        } else {
            this.activeIndex = index;
        }
    }

    activateTab(tabId: string): void {
        this.activeTab = tabId;
    }

    updatePosition(event: any) {
        // Logic to update position of the slider
        const position = event.value;
        // Implement logic to adjust the position of before and after images based on the slider value
    }

    // Event handler for slick's afterChange event
    afterChange(event: any, slick: any, currentSlide: number) {
        this.currentSlideIndex = currentSlide;
    }

    logout() {
        // this.subs.sink = this.authService.logout().subscribe((res) => {      
        this.authService.logout().subscribe((res) => {
            if (!res.success) {
                this.ngOnInit();
                this.router.navigate(['/authentication/signin']);
            }
        });
    }
}
