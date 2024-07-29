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
        console.log(this.userRole);
        
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
                console.log(this.statusData);
                
                this.dataSource = new MatTableDataSource(this.statusData);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                console.log(this.dataSource);
                
                // this.dataSource.sort = this.matsort;
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
        console.log(stageId);
        
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

    // private refreshTable() {
    //     this.paginator?._changePageSize(this.paginator?.pageSize);
    // }

    // refresh() {
    //     this.loadData();
    // }

    // /** Whether the number of selected elements matches the total number of rows. */
    // isAllSelected() {
    //     const numSelected = this.selection.selected.length;
    //     const numRows = this.dataSource.renderedData.length;
    //     return numSelected === numRows;
    // }

    // /** Selects all rows if they are not all selected; otherwise clear selection. */
    // masterToggle() {
    //     this.isAllSelected()
    //         ? this.selection.clear()
    //         : this.dataSource.renderedData.forEach((row) =>
    //             this.selection.select(row)
    //         );
    // }

    // removeSelectedRows() {
    //     const totalSelect = this.selection.selected.length;
    //     this.selection.selected.forEach((item) => {
    //         const index: number = this.dataSource.renderedData.findIndex(
    //             (d) => d === item
    //         );
    //         // console.log(this.dataSource.renderedData.findIndex((d) => d === item));
    //         this.exampleDatabase?.dataChange.value.splice(index, 1);

    //         this.refreshTable();
    //         this.selection = new SelectionModel<Doctors>(true, []);
    //     });
    //     this.showNotification(
    //         'snackbar-danger',
    //         totalSelect + ' Record Delete Successfully...!!!',
    //         'bottom',
    //         'center'
    //     );
    // }

    // public loadData() {
    //     this.exampleDatabase = new DoctorsService(this.httpClient);
    //     this.dataSource = new ExampleDataSource(
    //         this.exampleDatabase,
    //         this.paginator,
    //         this.sort
    //     );
    //     this.subs.sink = fromEvent(this.filter?.nativeElement, 'keyup').subscribe(
    //         () => {
    //             if (!this.dataSource) {
    //                 return;
    //             }
    //             this.dataSource.filter = this.filter?.nativeElement.value;
    //         }
    //     );
    // }

    // export table data in excel file
    
    showNotification( colorName: string, text: string, placementFrom: MatSnackBarVerticalPosition, placementAlign: MatSnackBarHorizontalPosition ) {
        this.snackBar.open(text, '', {
            duration: 2000,
            verticalPosition: placementFrom,
            horizontalPosition: placementAlign,
            panelClass: colorName,
        });
    }
}


// export class ExampleDataSource extends DataSource<Doctors> {
//     filterChange = new BehaviorSubject('');
//     get filter(): string {
//         return this.filterChange.value;
//     }
//     set filter(filter: string) {
//         this.filterChange.next(filter);
//     }
//     filteredData: Doctors[] = [];
//     renderedData: Doctors[] = [];
//     constructor(
//         public exampleDatabase: DoctorsService,
//         public paginator: MatPaginator,
//         public _sort: MatSort
//     ) {
//         super();
//         // Reset to the first page when the user changes the filter.
//         this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
//     }
//     /** Connect function called by the table to retrieve one stream containing the data to render. */
//     connect(): Observable<Doctors[]> {
//         // Listen for any changes in the base data, sorting, filtering, or pagination
//         const displayDataChanges = [
//             this.exampleDatabase.dataChange,
//             this._sort.sortChange,
//             this.filterChange,
//             this.paginator.page,
//         ];
//         this.exampleDatabase.getAllStages();
//         return merge(...displayDataChanges).pipe(
//             map(() => {
//                 // Filter data
//                 this.filteredData = this.exampleDatabase.data
//                     .slice()
//                     .filter((doctors: Doctors) => {
//                         const searchStr = (
//                             doctors.name +
//                             doctors.department +
//                             doctors.specialization +
//                             doctors.degree +
//                             doctors.email +
//                             doctors.mobile
//                         ).toLowerCase();
//                         return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
//                     });
//                 // Sort filtered data
//                 const sortedData = this.sortData(this.filteredData.slice());
//                 // Grab the page's slice of the filtered sorted data.
//                 const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
//                 this.renderedData = sortedData.splice(
//                     startIndex,
//                     this.paginator.pageSize
//                 );
//                 return this.renderedData;
//             })
//         );
//     }
//     // eslint-disable-next-line @typescript-eslint/no-empty-function
//     disconnect() { }
//     /** Returns a sorted copy of the database data. */
//     sortData(data: Doctors[]): Doctors[] {
//         if (!this._sort.active || this._sort.direction === '') {
//             return data;
//         }
//         return data.sort((a, b) => {
//             let propertyA: number | string = '';
//             let propertyB: number | string = '';
//             switch (this._sort.active) {
//                 case 'id':
//                     [propertyA, propertyB] = [a.id, b.id];
//                     break;
//                 case 'name':
//                     [propertyA, propertyB] = [a.name, b.name];
//                     break;
//                 case 'email':
//                     [propertyA, propertyB] = [a.email, b.email];
//                     break;
//                 case 'date':
//                     [propertyA, propertyB] = [a.date, b.date];
//                     break;
//                 case 'time':
//                     [propertyA, propertyB] = [a.department, b.department];
//                     break;
//                 case 'mobile':
//                     [propertyA, propertyB] = [a.mobile, b.mobile];
//                     break;
//             }
//             const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
//             const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
//             return (
//                 (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
//             );
//         });
//     }

// }
