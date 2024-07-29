import { TestBed } from '@angular/core/testing';

import { ToastrMessagesService } from './toastr-messages.service';

describe('ToastrMessagesService', () => {
  let service: ToastrMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastrMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
