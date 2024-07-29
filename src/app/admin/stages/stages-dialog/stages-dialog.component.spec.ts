import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagesDialogComponent } from './stages-dialog.component';

describe('StagesDialogComponent', () => {
  let component: StagesDialogComponent;
  let fixture: ComponentFixture<StagesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagesDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StagesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
