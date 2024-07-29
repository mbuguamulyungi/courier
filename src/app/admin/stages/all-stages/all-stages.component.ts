import { Direction } from '@angular/cdk/bidi';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition,} from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import {TableExportUtil, TableElement,UnsubscribeOnDestroyAdapter,} from '@shared';
import {  NgClass, DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { DoctorsService } from 'app/admin/doctors/alldoctors/doctors.service';
import { Doctors } from 'app/admin/doctors/alldoctors/doctors.model';
import { DeleteDialogComponent } from 'app/admin/appointment/viewappointment/dialogs/delete/delete.component';
import { serverUrl } from 'environments/environment.development';
import { AuthService } from '@core/service/auth.service';
import { StagesDialogComponent } from '../stages-dialog/stages-dialog.component';
import { ToastrMessagesService } from '@core/service/toastr-messages.service';

@Component({
    selector: 'app-all-stages',
    templateUrl: './all-stages.component.html',
    styleUrl: './all-stages.component.scss',
    standalone: true,
    imports: [
        BreadcrumbComponent,
        MatTooltipModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        NgClass,
        MatCheckboxModule,
        FeatherIconsComponent,
        MatRippleModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        DatePipe,
    ],
})
export class AllStagesComponent extends UnsubscribeOnDestroyAdapter implements OnInit {

    displayedColumns = [
        'id',
        'stage_name',
        'stage_sequence',
        'actions',
    ];

    // exampleDatabase?: DoctorsService;
    selection = new SelectionModel<Doctors>(true, []);
    index?: number;
    id?: number;
    userInfo: any;
    userRole: any;
    sessionId: any;
    statusData: any;
    stages: any[] = [];
    totalRows: any;

    dataSource!: MatTableDataSource<any>;
    @ViewChild(MatPaginator) matpaginator!: MatPaginator;
    @ViewChild(MatSort) matsort!: MatSort;


    constructor(
        public httpClient: HttpClient,
        public dialog: MatDialog,
        public doctorsService: DoctorsService,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private toastr: ToastrMessagesService,
    ) {
        super();
    }

    @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort!: MatSort;
    @ViewChild('filter', { static: true }) filter?: ElementRef;
    @ViewChild('searchInput') searchInput!: ElementRef;

    ngOnInit() {
        this.userInfo = localStorage.getItem('currentUser');
        this.userInfo = JSON.parse(this.userInfo || '');
        this.userRole = this.userInfo.roles[0].role;
        this.sessionId = localStorage.getItem('sessionId');
        this.getStages();
    }

    getStages() {
        var options = {
            method: 'GET',
            url: serverUrl + 'api/v1/naidash/stage/',
            headers: {
                'Content-Type': 'application/json',
                Cookie: 'frontend_lang=en_US;' + this.sessionId,
            },
            body: '',
        };
        const endPoint = 'api';
        this.authService.sendRequest('post', endPoint, options).subscribe({
            next: (res: any) => {
                let body = JSON.parse(res.body);
                this.statusData = [];
                this.statusData = body.result.data;
                this.dataSource = new MatTableDataSource(this.statusData);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.cdr.detectChanges();   
            },
            error: (error: any) => {
                this.toastr.showError(error?.message, 'Error');
            },
        });
    }

    addNew() {
        let tempDirection: Direction;
        if (localStorage.getItem('isRtl') === 'true') {
            tempDirection = 'rtl';
        } else {
            tempDirection = 'ltr';
        }
        const dialogRef = this.dialog.open(StagesDialogComponent, {
            data: {
                stage: '',
                action: 'add',
            },
            direction: tempDirection,
        });
        this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
            if (result == 'success') this.ngOnInit() ; else  {} 
        });
    }

    editCall(row: Doctors) {
        this.id = row.id;
        let tempDirection: Direction;
        if (localStorage.getItem('isRtl') === 'true') {
            tempDirection = 'rtl';
        } else {
            tempDirection = 'ltr';
        }
        const dialogRef = this.dialog.open(StagesDialogComponent, {
            data: {
                stage: row,
                action: 'edit',
            },
            direction: tempDirection,
        });
        this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
            if (result == 'success') this.ngOnInit() ; else  {} 
        });
    }

    deleteItem(row: Doctors) {
        this.id = row.id;
        let tempDirection: Direction;
        if (localStorage.getItem('isRtl') === 'true') {
            tempDirection = 'rtl';
        } else {
            tempDirection = 'ltr';
        }
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: row.id,
            direction: tempDirection,
        });

        this.subs.sink = dialogRef.afterClosed().subscribe((result) => {            
            if (result == 'No') {
             
            } else {
                this.deleteStage(result);
            } 
        });
    }

    deleteStage(stageId: any) {
        // var options = {
        //     // method: 'DELETE',
        //     // url: serverUrl + 'api/v1/naidash/stage/' + stageId,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         Cookie: 'frontend_lang=en_US;' + this.sessionId,
        //     },
        //     body: '',
        // };
        // const endPoint = 'api';
        // this.authService.sendRequest('post', endPoint, options).subscribe({
        //     next: (res: any) => {
        //         let body = JSON.parse(res.body);
        //         console.log(body);
        //         this.ngOnInit();
        //         this.toastr.showSuccess(body?.result?.message, 'Success');
        //     },
        //     error: (error: any) => {
		// 		this.toastr.showError(error?.message, 'Error');
        //     },
        // });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
        this.dataSource.filter = filterValue;
    
        // If the data source is filtered and there is a paginator, reset to the first page
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
    

    resetFilter() {
        this.searchInput.nativeElement.value = '';
        this.applyFilter({ target: { value: '' } } as any);
    }

    exportExcel() {
        // key name with space add in brackets
        const exportData: Partial<TableElement>[] =
        this.dataSource.filteredData.map((x) => ({
                id: x.id,
                stageName: x.stage_name,
                stageSequence: x.stage_sequence,
            }));
        TableExportUtil.exportToExcel(exportData, 'excel');
    }
   
    showNotification( colorName: string, text: string, placementFrom: MatSnackBarVerticalPosition, placementAlign: MatSnackBarHorizontalPosition ) {
        this.snackBar.open(text, '', {
            duration: 2000,
            verticalPosition: placementFrom,
            horizontalPosition: placementAlign,
            panelClass: colorName,
        });
    }
}

