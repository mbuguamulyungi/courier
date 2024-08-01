import { Direction } from '@angular/cdk/bidi';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { TableExportUtil, TableElement, UnsubscribeOnDestroyAdapter, } from '@shared';
import { NgClass, DatePipe, CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule, MatOptionModule, MatRippleModule } from '@angular/material/core';
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

import { ToastrMessagesService } from '@core/service/toastr-messages.service';
import { StagesDialogComponent } from 'app/admin/stages/stages-dialog/stages-dialog.component';
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormControl, FormGroup, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';


@Component({
    selector: 'app-sales-order-list',
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
        CommonModule,
        ReactiveFormsModule,
        MatOptionModule, MatSelectModule, MatDatepickerModule, MatInputModule,
        MatNativeDateModule,
    ],
    templateUrl: './sales-order-list.component.html',
    styleUrl: './sales-order-list.component.scss'
})
export class SalesOrderListComponent extends UnsubscribeOnDestroyAdapter implements OnInit {

    displayedColumns = [
        'id',
        'name',
        'stage',
        'picking_policy',
        'total_amount',
        'company_name',
        'sales_person',
        'partner_name',
        // 'actions',
    ];

    // exampleDatabase?: DoctorsService;
    selection = new SelectionModel<Doctors>(true, []);
    index?: number;
    id?: number;
    userInfo: any;
    userRole: any;
    sessionId: any;
    salesData: any;
    stages: any[] = [];
    totalRows: any;
    isGridView: boolean = false;
    statusData: any;
    editingStageIndex: any;
    originalStageName: string = '';
    dataSource!: MatTableDataSource<any>;
    @ViewChild(MatPaginator) matpaginator!: MatPaginator;
    @ViewChild(MatSort) matsort!: MatSort;
    noData: any;

    toggleView() {
        this.isGridView = !this.isGridView;
    }

    selectedSearch: any = 'stage';
    searchTerm: any = 'draft';

    filterControl = new FormControl('Stage');
    searchControl = new FormControl('draft');

    partners = [
        { id: 31, name: 'Oscar Morgan' },
        { id: 10, name: 'Deco Addict' }
    ]

    filters = [
        'Stage',
        'Partner',
        'Delivery Date'
        //stage:draft
        //quotation_date_from:
        //quotation_date_to:
        //delivery_date_from:2024-05-10
        //delivery_date_to:2024-06-23
        //created_date_from:
        //created_date_to:
    ];

    onSelectOptions(option: any) {
        // Define a mapping object
        const optionMap: { [key: string]: string } = {
            'Stage': 'stage',
            'Partner': 'partner_id',
            'Delivery Date': 'delivery_date',
        };

        // Set the selected search based on the option
        this.selectedSearch = optionMap[option] || '';
        this.searchControl.setValue('');
    }
    dateRangeFormGroup: FormGroup;


    constructor(
        public httpClient: HttpClient,
        public dialog: MatDialog,
        public doctorsService: DoctorsService,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private toastr: ToastrMessagesService,
        private fb: UntypedFormBuilder
    ) {
        super();
        this.dateRangeFormGroup = this.fb.group({
            delivery_date_from: [null],
            delivery_date_to: [null]
          });
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
        this.getSalesOrders(this.selectedSearch, this.searchTerm);

        

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
                    this.getSalesOrders(this.selectedSearch, searchTerm);
                } else {
                    this.getSalesOrders(this.selectedSearch, searchTerm);
                }
            }
        });

        this.dateRangeFormGroup.valueChanges.subscribe(values => {
            if (values.delivery_date_from && values.delivery_date_to) {
                const fromDate = this.formatDate(values.delivery_date_from);
                const toDate = this.formatDate(values.delivery_date_to);
                this.selectedSearch = 'delivery_date';
                let changeSearchValue = '';
                this.searchTerm = 'delivery_date_from=' + fromDate +'&delivery_date_to=' + toDate ;
                this.getSalesOrders(changeSearchValue, this.searchTerm);
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

    getSalesOrders(selectedSearch: any, searchTerm: any) {    
        let url = selectedSearch != ''
            ? serverUrl + 'api/v1/naidash/sale?' + selectedSearch + '=' + searchTerm
            : serverUrl + 'api/v1/naidash/sale?' + searchTerm;
        
        var options = {
            method: 'GET',
            url: url,
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
                if (body?.error?.code == 404) {
                    this.noData = body.error.message;
                }
                this.salesData = [];
                this.salesData = body?.result?.data;
                this.dataSource = new MatTableDataSource(this.salesData);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.getStatus();
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                this.toastr.showError(error?.message, 'Error');
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
            if (result == 'success') this.ngOnInit(); else { }
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
        this.selectedSearch = 'stage';
        this.searchTerm = 'draft';

        this.filterControl.setValue('Stage');
        this.searchControl.setValue('draft');

        this.getSalesOrders(this.selectedSearch, this.searchControl.value);

        // this.searchInput.nativeElement.value = '';
        // this.applyFilter({ target: { value: '' } } as any);
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

    showNotification(colorName: string, text: string, placementFrom: MatSnackBarVerticalPosition, placementAlign: MatSnackBarHorizontalPosition) {
        this.snackBar.open(text, '', {
            duration: 2000,
            verticalPosition: placementFrom,
            horizontalPosition: placementAlign,
            panelClass: colorName,
        });
    }

    getValueForLoop(data: any[], stage: string) {
        return data.filter((item) => item.stage == stage);
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

    trackByStage(index: number, stage: string): string {
        return stage;
    }

    trackByItem(index: number, item: any): number {
        return item.id;
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
}
