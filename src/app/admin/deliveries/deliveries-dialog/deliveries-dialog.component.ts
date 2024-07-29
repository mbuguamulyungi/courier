import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule, UntypedFormControl, FormGroup, FormArray, ValidationErrors, AbstractControl, } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrMessagesService } from '@core/service/toastr-messages.service';
import { serverUrl } from 'environments/environment';
import { AuthService } from '@core/service/auth.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';

export interface DialogData {
    id: number;
    action: string;
    delivery: any;
    stages:any
}

@Component({
    selector: 'app-deliveries-dialog',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatDialogContent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatDatepickerModule,
        MatCardModule,
        CommonModule
    ],
    templateUrl: './deliveries-dialog.component.html',
    styleUrl: './deliveries-dialog.component.scss'
})

export class DeliveriesDialogComponent implements OnInit {

    action: string;
    dialogTitle: string;
    deliveryForm: UntypedFormGroup;
    submitted = false;
    sessionId: any;
    selectedDelivery: any

    senderName = [
        { id: 1, name: 'Dustin' },
        { id: 2, name: 'Hopper' }
    ]

    receiverName = [
        { id: 1, name: 'Jake' },
        { id: 2, name: 'Meave' }
    ]

    assignUser = [
        { id: 1, name: 'Stephen' }
    ]

    deliveryType = [ 'Domestic' ,'International' ]

    tagList: any = [
        { id: 1, value: 'Blitz Couriers' },
        { id: 2, value: 'Care Couriers' },
        { id: 3, value: 'Smart Ship' },
        { id: 4, value: 'Clever Courier Co' },
        { id: 5, value: 'Quick and Reliable' },
        { id: 6, value: 'Speedy Express' },
    ];

    categories = [
        { id: 1, name: 'Yes' },
        { id: 2, name: 'No' }
    ]

    priorities = [
        { id: 10, name: 'Yes' },
        { id: 2, name: 'No' }
    ]
    allStages: any;

    constructor(
        public dialogRef: MatDialogRef<DeliveriesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private fb: UntypedFormBuilder, private toastr: ToastrMessagesService, private authService: AuthService,
    ) {
        this.action = data.action;
        this.selectedDelivery = data.delivery;
        this.allStages = data.stages;

        if (this.action === 'edit') {
            this.dialogTitle = "Edit Delivery";
            this.deliveryForm = this.updateDeliveryForm();
            this.setDeliveryValue(this.selectedDelivery)
        } else {
            this.dialogTitle = 'Add Delivery';
            this.deliveryForm = this.createDeliveryForm();
        }
    }

    ngOnInit(): void {
        this.sessionId = localStorage.getItem('sessionId');
    }

    createDeliveryForm(): UntypedFormGroup {
        return this.fb.group({
            is_drop_shipping: [''],
            is_receiver_invoice: ['',],
            receiver_partner_id: [''],
            sender_partner_id: [''],
            category_id: [''],
            priority_id: [''],
            assigned_user_id: [''],
            delivery_date: [''],
            courier_type: [''],
            tag_ids: [''],
            distance: ['', this.numericValidator],
            description: [''],
            internal_note: [''],
            line_items: this.fb.array([this.createLineItem()])
        });
    }

    updateDeliveryForm(): UntypedFormGroup {
        return this.fb.group({
            is_record_active: [''],
            stage_id: [''],
            is_drop_shipping: [''],
            is_receiver_invoice: ['',],
            receiver_partner_id: [''],
            sender_partner_id: [''],
            category_id: [''],
            priority_id: [''],
            assigned_user_id: [''],
            delivery_date: [''],
            courier_type: [''],
            tag_ids: [''],
            distance: ['', this.numericValidator],
            description: [''],
            internal_note: [''],
            line_items: this.fb.array([this.createLineItem()])
        });
    }



    numericValidator(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        return isNaN(value) ? { numeric: true } : null;
    }

    get lineItems() {
        return this.deliveryForm.get('line_items') as FormArray;
    }

    createLineItem(): FormGroup {
        return this.fb.group({
            name: ['',],
            quantity: ['', Validators.min(1)],
            weight: ['',],
            dimension_id: ['',]
        });
    }

    addLineItem() {
        this.lineItems.push(this.createLineItem());
    }

    removeLineItem(index: number) {
        this.lineItems.removeAt(index);
    }


    setDeliveryValue(courier: any) {        
        // Set the form control value
        this.deliveryForm.patchValue(courier);
        

        // let recevrData = this.receiverName.filter(r => r.id == courier.receiver.id);
        this.receiverName.push({ id: courier.receiver.id, name: courier.receiver.name });
        this.deliveryForm.controls['receiver_partner_id'].setValue(courier.receiver.id)

        this.senderName.push({ id: courier.sender.id, name: courier.sender.name });
        this.deliveryForm.controls['sender_partner_id'].setValue(courier.sender.id)

        this.assignUser.push({ id: courier.assigned_user.id, name: courier.assigned_user.name });
        this.deliveryForm.controls['assigned_user_id'].setValue(courier.assigned_user.id)

        this.deliveryType.push(courier.courier_type)
        this.deliveryForm.controls['courier_type'].setValue(courier.courier_type)

        if (courier.category_id && Object.keys(courier.category_id).length == 0 ) {
            // this.categories.push({ id: courier.category_id, name: courier.category_id } )
            // this.deliveryForm.controls['category_id'].setValue(courier.category_id)
        }

        this.priorities.push({ id: courier.priority.id, name: courier.priority.name })
        this.deliveryForm.controls['priority_id'].setValue(courier.priority.id)

        if (courier.tag_ids.length > 0) {
            let tagIds: any[]=[];
            courier.tag_ids.forEach((tag:any) => {
                this.tagList.push({ id: tag.id, name: tag.name })
                tagIds.push(tag.id)
            })
        this.deliveryForm.controls['tag_ids'].setValue(tagIds)
        }

        if (courier.stage ) {
            let selectStage = this.allStages.filter((stage: any) => stage.id == courier.stage.id);
            this.deliveryForm.controls['stage_id'].setValue(selectStage[0].id)
        }

        console.log(this.deliveryForm);
    }

    public confirmAdd(): void {
        this.submitted = true;
        if (this.deliveryForm.valid) {
            var sendData = this.deliveryForm.value 

            const deliveryDate = this.deliveryForm.value.delivery_date;
            const formattedDate = moment(deliveryDate).format('YYYY-MM-DD');
            sendData.delivery_date = formattedDate;

            let method;
            let endPointUrl;
            if (this.action === 'edit') {
                method = 'PATCH';
                endPointUrl = serverUrl + 'api/v1/naidash/courier/' + this.selectedDelivery.id;
            } else {
                method = 'POST';
                endPointUrl = serverUrl + 'api/v1/naidash/courier'
            }

            let options = {
                'method': method,
                'url': endPointUrl,
                'headers': {
                    'Content-Type': 'application/json',
                    'Cookie': 'frontend_lang=en_US;' + this.sessionId
                },
                'body': sendData
            };            
            this.toastr.newLoader = true;
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
            			this.submitted = false;
            		}
            		this.dialogRef.close('success');
            	},
            	error: (error) => {
            		this.toastr.newLoader = false;						
            		this.toastr.showError(error.message, 'Error');
            		this.submitted = false;
            		this.dialogRef.close('error');
            	},
            });
        }
    }

}
