import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule,} from '@angular/forms';
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
import { CommonModule } from '@angular/common';

export interface DialogData {
	id: number;
	action: string;
	stage: any;
}

@Component({
	selector: 'app-stages-dialog',
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
		CommonModule
	],
	templateUrl: './stages-dialog.component.html',
	styleUrl: './stages-dialog.component.scss'
})
	
export class StagesDialogComponent implements OnInit {
	action: string;
	dialogTitle: string;
	stageForm: UntypedFormGroup;
	submitted = false;
	sessionId: any;
	selectedStage:any

	constructor(
		public dialogRef: MatDialogRef<StagesDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData,
		private fb: UntypedFormBuilder,
		private toastr: ToastrMessagesService,
		private authService: AuthService,
	) {
		this.action = data.action;
		this.selectedStage = data.stage;
		if (this.action === 'edit') {
			this.dialogTitle = "Edit Stage";
			this.stageForm = this.updateStageForm();
			this.setStageValue(this.selectedStage)

		} else if (this.action === 'view') { 
			this.dialogTitle = "View Stage";
			this.stageForm = this.updateStageForm();
			this.setStageValue(this.selectedStage)
		}else {
			this.dialogTitle = 'Add Stage';
			this.stageForm = this.createStageForm();
		}
	}

	ngOnInit(): void {
		this.sessionId =  localStorage.getItem('sessionId');
	}

	createStageForm(): UntypedFormGroup {
		return this.fb.group({
			stage_name: ['', Validators.required],
			stage_sequence: ['', [Validators.required,Validators.pattern("^[0-9]*$")]],
			is_form_readonly: [''],
			allow_sales_order_creation: [''],
		});
	}

	updateStageForm(): UntypedFormGroup {
		return this.fb.group({
			stage_name: ['', Validators.required],
			stage_sequence: ['', [Validators.required,Validators.pattern("^[0-9]*$")]],
			is_form_readonly: [''],
			allow_sales_order_creation: [''],
			fold_stage: [''],
			activate_stage: [''],
		});
	}

	setStageValue(stage:any) {
		this.stageForm.patchValue(stage);
	}

	public confirmAdd(): void {
		this.submitted = true;
		if (this.stageForm.valid) {
			var sendData:any = {
				stage_name: this.stageForm.value.stage_name,
				stage_sequence: this.stageForm.value.stage_sequence,
				is_form_readonly: this.stageForm.value.is_form_readonly,
				allow_sales_order_creation: this.stageForm.value.allow_sales_order_creation
			}			
		
			let method;
			let endPointUrl;
			if (this.action === 'edit') {
				method = 'PATCH';
				endPointUrl = serverUrl + 'api/v1/naidash/stage/' + this.selectedStage.id;

				sendData.fold_stage =  this.stageForm.value.fold_stage,
				sendData.activate_stage = this.stageForm.value.activate_stage
			} else {
				method = 'POST';
				endPointUrl = serverUrl + 'api/v1/naidash/stage'
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
