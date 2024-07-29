import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
// import { Appointment } from './appointment.model';
// import { DataSource } from '@angular/cdk/collections';
import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { FormDialogComponent } from './dialogs/form-dialog/form-dialog.component';
// import { DeleteDialogComponent } from './dialogs/delete/delete.component';
import { MAT_DATE_LOCALE, MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Direction } from '@angular/cdk/bidi';
import {
    TableExportUtil,
    TableElement,
    UnsubscribeOnDestroyAdapter,
} from '@shared';
import { formatDate, NgClass, DatePipe, CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AppointmentService } from 'app/admin/appointment/viewappointment/appointment.service';
import { Appointment } from 'app/admin/appointment/viewappointment/appointment.model';
import { FormDialogComponent } from 'app/calendar/dialogs/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/admin/appointment/viewappointment/dialogs/delete/delete.component';
import {
    CdkDragDrop,
    CdkDrag,
    DragDropModule,
    moveItemInArray,
    transferArrayItem,
    CdkDropList,
} from '@angular/cdk/drag-drop';
import { serverUrl } from 'environments/environment.development';
import { AuthService } from '@core/service/auth.service';
import { DeliveriesDialogComponent } from '../../deliveries-dialog/deliveries-dialog.component';
import { ToastrMessagesService } from '@core/service/toastr-messages.service';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-view-deliveries',
    templateUrl: './view-deliveries.component.html',
    styleUrl: './view-deliveries.component.scss',
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
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
        DragDropModule,
        CdkDrag,
        CdkDropList,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        CommonModule,

    ],
})
export class ViewDeliveriesComponent extends UnsubscribeOnDestroyAdapter implements OnInit{
    displayedColumns = [
        'select',
        'number',
        'sender_name',
        'receiver_name',
        'type',
        'registration_date',
        'responsible_user',
        'status',
        'actions',
        'sales_order',
    ];
    // exampleDatabase?: AppointmentService;
    selection = new SelectionModel<Appointment>(true, []);
    // appointment?: Appointment | null;

    index?: number;
    id?: number;

    sortType = 'multi';

    isGridView: boolean = false;
    userInfo: any;
    sessionId: any;
    statusData: any;
    stages: any[] = [];
    editingStageIndex: any;
    originalStageName: string = '';

    toggleView() {
        this.isGridView = !this.isGridView;
    }


    deliveryData: any;
    // dataSource!: MatTableDataSource<any>;
    dataSource = new MatTableDataSource<any>();


    @ViewChild(MatSort) matsort!: MatSort;

    @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort!: MatSort;
    @ViewChild('filter', { static: true }) filter?: ElementRef;
 
    constructor(
        private authService: AuthService,
        public httpClient: HttpClient,
        public dialog: MatDialog,
        public appointmentService: AppointmentService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        private toastr: ToastrMessagesService,
    ) {
        super();
    }


    ngOnInit() {
        // this.loadData();
        this.userInfo = localStorage.getItem('currentUser');
        this.userInfo = JSON.parse(this.userInfo || '');
        this.sessionId = localStorage.getItem('sessionId');
        this.getAllDeliveries();
        // this.getStatus();
    }

    getAllDeliveries() {
        var options = {
            method: 'GET',
            url: serverUrl + 'api/v1/naidash/courier?is_record_active=true',
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
                this.deliveryData = body.result.data;

                this.dataSource.data = this.deliveryData; // Set data directly to dataSource
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
;
                this.getStatus();
                this.cdr.detectChanges();
                console.log(this.dataSource);
            },
            error: (error: any) => {

            },
        });
    }


    getStatus() {
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
                this.statusData = body.result.data;
                this.statusData.forEach((element: any) => {
                    this.stages.push(element.stage_name);
                });

                // this.dataSource?.renderedData.map(
                //     (element: any, index: any) => {
                //         if (this.stages[index]) {
                //             element.stage = this.stages[index];
                //         } else {
                //             element.stage = this.stages[0];
                //         }
                //     }
                // );
                // console.log(this.dataSource.renderedData);

                this.cdr.detectChanges();
            },
            error: (error: any) => {
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

        const dialogRef = this.dialog.open(DeliveriesDialogComponent, {
            data: {
                delivery: '',
                action: 'add',
                stages: this.statusData
            },
            direction: tempDirection,
        });
        this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
            // if (result === 1) {
            //     // After dialog is closed we're doing frontend updates
            //     // For add we're just pushing a new row inside DataService
            //     this.exampleDatabase?.dataChange.value.unshift(
            //         this.appointmentService.getDialogData()
            //     );
            //     this.refreshTable();
            //     this.showNotification(
            //         'snackbar-success',
            //         'Add Record Successfully...!!!',
            //         'bottom',
            //         'center'
            //     );
            // }
        });
    }

    editCall(row: any) {
        this.id = row.id;
        let tempDirection: Direction;
        if (localStorage.getItem('isRtl') === 'true') {
            tempDirection = 'rtl';
        } else {
            tempDirection = 'ltr';
        }
        const dialogRef = this.dialog.open(DeliveriesDialogComponent, {
            data: {
                delivery: row,
                action: 'edit',
                stages: this.statusData
            },
            direction: tempDirection,
        });
        this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
            console.log(result);
            
            // if (result === 1) {
            //     // When using an edit things are little different, firstly we find record inside DataService by id
            //     const foundIndex =
            //         this.exampleDatabase?.dataChange.value.findIndex(
            //             (x) => x.id === this.id
            //         );
            //     // Then you update that record using data from dialogData (values you enetered)
            //     if (foundIndex != null && this.exampleDatabase) {
            //         this.exampleDatabase.dataChange.value[foundIndex] =
            //             this.appointmentService.getDialogData();
            //         // And lastly refresh table
            //         this.refreshTable();
            //         this.showNotification(
            //             'black',
            //             'Edit Record Successfully...!!!',
            //             'bottom',
            //             'center'
            //         );
            //     }
            // }
        });
    }

    deleteItem(row: Appointment) {
        this.id = row.id;
        let tempDirection: Direction;
        if (localStorage.getItem('isRtl') === 'true') {
            tempDirection = 'rtl';
        } else {
            tempDirection = 'ltr';
        }
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: row,
            direction: tempDirection,
        });
        this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
          console.log(result);
          
        });
    }

    createSalesOrder(courierId:any) {
        console.log(courierId);
        
    }

    onDateChange(event: MatDatepickerInputEvent<Date>) {
        let selectedDate = event.value;
        this.search(selectedDate);
    }

    resetFilter() {
        // Clear the selected date filter
        this.dataSource.data = this.deliveryData; // Show all data
        if (this.filter) {
            this.filter.nativeElement.value = ''; // Clear the input field
        }
    }
    
    
    search(date: any) {
        if (date) {
            const filteredData = this.deliveryData.filter((delivery: any) => {
                const deliveryDate = new Date(delivery.delivery_date);
                return deliveryDate.toDateString() === date.toDateString();
            });
            this.dataSource.data = filteredData;
        } else {
            this.dataSource.data = this.deliveryData;
        }
    }
    
    // refresh() {
    //     this.loadData();
    // }
    // /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        // const numSelected = this.selection.selected.length;
        // const numRows = this.dataSource?.renderedData.length;
        // return numSelected === numRows;
    }

    // /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        // this.isAllSelected()
        //     ? this.selection.clear()
        //     : this.dataSource?.renderedData.forEach((row) =>
        //           this.selection.select(row)
        //       );
    }

    // removeSelectedRows() {
    //     const totalSelect = this.selection.selected.length;
    //     this.selection.selected.forEach((item) => {
    //         const index = this.dataSource?.renderedData.findIndex(
    //             (d) => d === item
    //         );
    //         // console.log(this.dataSource.renderedData.findIndex((d) => d === item));
    //         if (index !== undefined) {
    //             if (this.exampleDatabase) {
    //                 this.exampleDatabase.dataChange.value.splice(index, 1);
    //             }
    //             this.refreshTable();
    //             this.selection = new SelectionModel<Appointment>(true, []);
    //         }
    //     });
    //     this.showNotification(
    //         'snackbar-danger',
    //         totalSelect + ' Record Delete Successfully...!!!',
    //         'bottom',
    //         'center'
    //     );
    // }

    // private refreshTable() {
    //     this.paginator?._changePageSize(this.paginator.pageSize);
    // }

    // public loadData() {
    //     this.exampleDatabase = new AppointmentService(this.httpClient);
    //     this.dataSource = new ExampleDataSource(
    //         this.exampleDatabase,
    //         this.paginator,
    //         this.sort
    //     );
    //     fromEvent(this.filter?.nativeElement, 'keyup').subscribe(() => {
    //         if (!this.dataSource) {
    //             return;
    //         }
    //         this.dataSource.filter = this.filter?.nativeElement.value;
    //     });
    // }

    // // export table data in excel file
    // exportExcel() {
    //     // key name with space add in brackets
    //     const exportData: Partial<TableElement>[] =
    //         this.dataSource.filteredData.map((x) => ({
    //             Name: x.name,
    //             Email: x.email,
    //             Gender: x.gender,
    //             Date: formatDate(new Date(x.date), 'yyyy-MM-dd', 'en') || '',
    //             Time: x.time,
    //             Mobile: x.mobile,
    //             Doctor: x.doctor,
    //             Injury: x.injury,
    //         }));

    //     TableExportUtil.exportToExcel(exportData, 'excel');
    // }

    showNotification(
        colorName: string,
        text: string,
        placementFrom: MatSnackBarVerticalPosition,
        placementAlign: MatSnackBarHorizontalPosition
    ) {
        this.snackBar.open(text, '', {
            duration: 2000,
            verticalPosition: placementFrom,
            horizontalPosition: placementAlign,
            panelClass: colorName,
        });
    }

    trackByStage(index: number, stage: string): string {
        return stage;
    }

    trackByItem(index: number, item: any): number {
        return item.id;
    }

    getValueForLoop(data: any[], stage: string) {        
        return data.filter((item) => item.stage.name == stage);
    }

    getConnectedLists() {
        return this.stages.map((stage) => `cdk-drop-list-${stage.name}`);
    }

    drop(event: CdkDragDrop<any[]>, stage: string) {
        if (event.previousContainer === event.container) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            const item = event.previousContainer.data[event.previousIndex];
            item.stage = stage;
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
            this.updateItemStage(item);
        }
    }

    updateItemStage(item: any) {
        console.log('Item updated successfully', item);
    }

    startEdit(index: number) {
        // this.editingStageIndex = index;
        // this.originalStageName = this.stages[index];
    }

    saveStage(index: number, value: any) {
        this.editingStageIndex = null;
        console.log('Stage name updated:', this.stages[index],value);
    }

    cancelEdit() {
        if (this.editingStageIndex !== null) {
            this.stages[this.editingStageIndex] = this.originalStageName;
            this.editingStageIndex = null;
        }
    }
}

// export class ExampleDataSource extends DataSource<Appointment> {
//     filterChange = new BehaviorSubject('');
//     get filter(): string {
//         return this.filterChange.value;
//     }
//     set filter(filter: string) {
//         this.filterChange.next(filter);
//     }
//     filteredData: Appointment[] = [];
//     renderedData: Appointment[] = [];
//     constructor(
//         public exampleDatabase: AppointmentService,
//         public paginator: MatPaginator,
//         public _sort: MatSort
//     ) {
//         super();
//         // Reset to the first page when the user changes the filter.
//         // this.filterChange.subscribe(() => (this.paginator?.pageIndex = 0));
//     }
//     /** Connect function called by the table to retrieve one stream containing the data to render. */
//     connect(): Observable<Appointment[]> {
//         // Listen for any changes in the base data, sorting, filtering, or pagination
//         const displayDataChanges = [
//             this.exampleDatabase.dataChange,
//             this._sort.sortChange,
//             this.filterChange,
//             this.paginator.page,
//         ];
//         this.exampleDatabase.getAllAppointments();
//         return merge(...displayDataChanges).pipe(
//             map(() => {
//                 // Filter data
//                 this.filteredData = this.exampleDatabase.data
//                     .slice()
//                     .filter((appointment: Appointment) => {
//                         const searchStr = (
//                             appointment.name +
//                             appointment.email +
//                             appointment.gender +
//                             appointment.date +
//                             appointment.doctor +
//                             appointment.injury +
//                             appointment.mobile
//                         ).toLowerCase();
//                         return (
//                             searchStr.indexOf(this.filter.toLowerCase()) !== -1
//                         );
//                     });
//                 // Sort filtered data
//                 const sortedData = this.sortData(this.filteredData.slice());
//                 // Grab the page's slice of the filtered sorted data.
//                 const startIndex =
//                     this.paginator.pageIndex * this.paginator.pageSize;
//                 this.renderedData = sortedData.splice(
//                     startIndex,
//                     this.paginator.pageSize
//                 );
//                 return this.renderedData;
//             })
//         );
//     }
//     // eslint-disable-next-line @typescript-eslint/no-empty-function
//     disconnect() {}
//     /** Returns a sorted copy of the database data. */
//     sortData(data: Appointment[]): Appointment[] {
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
//                 // case 'date': [propertyA, propertyB] = [a.date, b.date]; break;
//                 case 'time':
//                     [propertyA, propertyB] = [a.time, b.time];
//                     break;
//                 case 'mobile':
//                     [propertyA, propertyB] = [a.mobile, b.mobile];
//                     break;
//             }
//             const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
//             const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
//             return (
//                 (valueA < valueB ? -1 : 1) *
//                 (this._sort.direction === 'asc' ? 1 : -1)
//             );
//         });
//     }
// }
