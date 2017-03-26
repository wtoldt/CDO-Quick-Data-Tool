import { TestBed, inject } from '@angular/core/testing';

import { CdoService } from './cdo-service.service';

describe('CdoServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CdoService]
    });
  });

  it('should ...', inject([CdoService], (service: CdoService) => {
    expect(service).toBeTruthy();
  }));
});
