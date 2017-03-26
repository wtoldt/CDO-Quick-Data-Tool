import { Component } from '@angular/core';

import { CdoService } from './cdo-service.service';
import { CdoResponse } from './cdo-response.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cdoResponse = new CdoResponse();

  constructor (private cdoService: CdoService) { }

  getKeys(obj) {
    return Object.keys(obj);
  }

  getData() {
    let foo: any = {};

    this.cdoService.getData().subscribe( (response: CdoResponse) => {
      this.cdoResponse = response;
    })

  }
}
