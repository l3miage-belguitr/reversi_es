import { TestBed } from '@angular/core/testing';

import { ReversiService } from './reversi.service';

describe('ReversiService', () => {
  let service: ReversiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReversiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
