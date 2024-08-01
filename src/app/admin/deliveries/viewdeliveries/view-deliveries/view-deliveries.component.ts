import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, } from '@angular/material/snack-bar';
import { MAT_DATE_LOCALE, MatNativeDateModule, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Direction } from '@angular/cdk/bidi';
import { UnsubscribeOnDestroyAdapter, } from '@shared';
import { NgClass, DatePipe, CommonModule } from '@angular/common';
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
import { DeleteDialogComponent } from 'app/admin/appointment/viewappointment/dialogs/delete/delete.component';
import { CdkDragDrop, CdkDrag, DragDropModule, moveItemInArray, transferArrayItem, CdkDropList, } from '@angular/cdk/drag-drop';
import { serverUrl } from 'environments/environment.development';
import { AuthService } from '@core/service/auth.service';
import { DeliveriesDialogComponent } from '../../deliveries-dialog/deliveries-dialog.component';
import { ToastrMessagesService } from '@core/service/toastr-messages.service';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { StagesDialogComponent } from 'app/admin/stages/stages-dialog/stages-dialog.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

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
        ReactiveFormsModule,
        MatOptionModule, MatSelectModule,
    ],
})

export class ViewDeliveriesComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
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

    selection = new SelectionModel<Appointment>(true, []);
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

    deliveryData: any;
    dataSource = new MatTableDataSource<any>();
    @ViewChild(MatSort) matsort!: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort!: MatSort;
    @ViewChild('filter', { static: true }) filter?: ElementRef;

    selectedSearch: any = 'is_record_active';
    searchTerm: any = 'true';

    filterControl = new FormControl('Record Active');
    searchControl = new FormControl('true');

    toggleView() {
        this.isGridView = !this.isGridView;
    }

    assignUser = [
        { id: 1, name: 'Stephen' }
    ]
    deliveryType = [ 'domestic' ,'international' ]
    categories = [
        { id: 1, name: 'Major' },
        { id: 2, name: 'Minor' }
    ]
    priorities = [
        { id: 1, name: 'Yes' },
        { id: 2, name: 'No' }
    ]

    filters = [
        // 'Phone',
        'Delivery Date',
        'Assigned User',
        'Stage',
        'Priority',
        'Category',
        'Courier Type',
        'Drop Shipping',
        'Record Active'
    ];

    onSelectOptions(option: any) {
        // Define a mapping object
        const optionMap: { [key: string]: string } = {
            'Record Active': 'is_record_active',
            'Drop Shipping': 'is_drop_shipping',
            'Delivery Date': 'delivery_date',
            'Assigned User': 'assigned_user_id',
            'Stage': 'stage_id',
            'Priority': 'priority_id',
            'Category': 'category_id',
            'Courier Type': 'courier_type',
            // 'Phone': 'phone'
        };

        // Set the selected search based on the option
        this.selectedSearch = optionMap[option] || '';
        this.searchControl.setValue('');
    }

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

        this.selectedSearch = 'is_record_active';
        this.searchTerm = 'true';        

        this.getAllDeliveries(this.selectedSearch, this.searchTerm);

        this.searchControl.valueChanges.subscribe((searchTerm: any) => {
            if (searchTerm) {
                let formattedDate: string | null = null;
             if (this.isValidDate(searchTerm)) {
                // If searchTerm is a Date object or a date string
                if (searchTerm instanceof Date) {
                    // Convert to 'YYYY-MM-DD' format directly
                    formattedDate = this.formatDate(searchTerm);
                } else {
                    // Convert string to Date and then to 'YYYY-MM-DD' format
                    formattedDate = this.formatDate(new Date(searchTerm));
                }
                searchTerm = formattedDate;
                this.getAllDeliveries(this.selectedSearch, searchTerm);
            } else {
                    this.getAllDeliveries(this.selectedSearch, searchTerm);
                }
            }
        });
    }

     // Function to check if input is a valid date
     isValidDate(dateInput: any): boolean {
        let dateObject: Date;
        
        if (dateInput instanceof Date) {
            dateObject = dateInput;
        } else if (typeof dateInput === 'string') {
            const parsedDate = Date.parse(dateInput);
            dateObject = new Date(parsedDate);
        } else {
            return false;
        }
        
        return !isNaN(dateObject.getTime());
    }

    // Function to format Date object to 'YYYY-MM-DD'
    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }


    getAllDeliveries(selectedSearch: any, searchTerm: any) {
        var options = {
            method: 'GET',
            url: serverUrl + 'api/v1/naidash/courier?' + selectedSearch + '=' + searchTerm,
            headers: {
                'Content-Type': 'application/json',
                Cookie: 'frontend_lang=en_US;' + this.sessionId,
            },
            body: '',
        };
        const endPoint = 'api';
        this.authService.sendRequest('post', endPoint, options).subscribe({
            next: (res: any) => {
                let body = JSON.parse(res?.body);
                this.deliveryData = body?.result?.data;
                console.log(this.deliveryData);
                
                this.dataSource.data = this.deliveryData; // Set data directly to dataSource
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
                this.getStatus();
                this.cdr.detectChanges();
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
            console.log(result);
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
        });
    }

    view(row: any) {
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
                action: 'view',
                stages: this.statusData
            },
            direction: tempDirection,
        });
        this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
            console.log(result);
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

    createSalesOrder(courierId: any) {
        var sendData: any = {
            courier_id: courierId,
        }
        let options = {
            'method': 'POST',
            'url': serverUrl + 'api/v1/naidash/sale',
            'headers': {
                'Content-Type': 'application/json',
                'Cookie': 'frontend_lang=en_US;' + this.sessionId
            },
            'body': sendData
        };

        // this.toastr.newLoader = true;
        const endPoint = "api";
        // this.subs.sink = this.authService.sendRequest('post', endPoint, options)
        this.authService.sendRequest('post', endPoint, options)
            .subscribe({
                next: (res) => {
                    this.toastr.newLoader = false;
                    let body = JSON.parse(res.body)
                    let rawHeaders = res.rawHeaders;
                    console.log(body);
                    if (body && body?.result) {
                        this.toastr.showSuccess(body?.result?.message, 'Success');
                    } else {
                        this.toastr.showError(body?.error?.data?.message, 'Error');
                    }

                },
                error: (error) => {
                    this.toastr.newLoader = false;
                    this.toastr.showError(error.message, 'Error');
                },
            });
    }

    resetFilter() {
        this.selectedSearch = 'is_record_active';
        this.searchTerm = 'true';

        this.filterControl.setValue('Record Active');
        this.searchControl.setValue('true');

        this.getAllDeliveries(this.selectedSearch, this.searchControl.value);
    }

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

    drop(event: CdkDragDrop<any[]>, stage: any) {
        if (event.previousContainer === event.container) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            const item = event.previousContainer.data[event.previousIndex];
            item.stage.id = stage.id;
            item.stage.name = stage.stage_name;
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
        let options = {
            'method': 'PATCH',
            'url': serverUrl + 'api/v1/naidash/courier/' + item.id,
            'headers': {
                'Content-Type': 'application/json',
                'Cookie': 'frontend_lang=en_US;' + this.sessionId
            },
            'body': item
        };
        // this.toastr.newLoader = true;
        const endPoint = "api";
        // this.subs.sink = this.authService.sendRequest('post', endPoint, options)
        this.authService.sendRequest('post', endPoint, options)
            .subscribe({
                next: (res) => {
                    this.toastr.newLoader = false;
                    let body = JSON.parse(res.body)
                    let rawHeaders = res.rawHeaders;
                    console.log(body);
                    
                    if (body && body?.result) {
                        this.toastr.showSuccess(body?.result?.message, 'Success');
                        this.ngOnInit();
                    } else {
                        this.toastr.showError(body?.error?.data?.message, 'Error');

                    }
                },
                error: (error) => {
                    this.toastr.newLoader = false;
                    this.toastr.showError(error.message, 'Error');
                },
            });


    }

    startEdit(index: number) {
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
            if (result == 'success') this.ngOnInit(); else { }
        });

        // this.editingStageIndex = index;
        // this.originalStageName = this.stages[index];
    }

    saveStage(index: number, value: any) {
        this.editingStageIndex = null;
        console.log('Stage name updated:', this.stages[index], value);
    }

    cancelEdit() {
        if (this.editingStageIndex !== null) {
            this.stages[this.editingStageIndex] = this.originalStageName;
            this.editingStageIndex = null;
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

}
