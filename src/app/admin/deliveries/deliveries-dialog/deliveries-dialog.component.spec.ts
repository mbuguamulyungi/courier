import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveriesDialogComponent } from './deliveries-dialog.component';

describe('DeliveriesDialogComponent', () => {
  let component: DeliveriesDialogComponent;
  let fixture: ComponentFixture<DeliveriesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveriesDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliveriesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
