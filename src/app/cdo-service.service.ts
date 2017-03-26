import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';

import { Observable } from 'rxjs';

import { CdoResponse } from './cdo-response.class';

@Injectable()
export class CdoService {

  constructor(private http: Http) { }

  getData(): Observable<CdoResponse> {

    let headers = new Headers();
    headers.set('token', 'IdNEXjwZWEjvmkHMrRgJLNfxijCdyzFC');

    let baseUrl = 'https://www.ncdc.noaa.gov/cdo-web/api/v2',
        url = `${baseUrl}/data?datasetid=GHCND&staitonid=GHCND:US1NCBC0051&startdate=2017-03-01&enddate=2017-03-02&units=metric`

   
    return this.http.get(url, {'headers': headers})
      .map( response => this.handleDataResponse(response) )
      .catch( error => this.handleError(error) );
  }

  private handleDataResponse(response: Response): CdoResponse {
  
    let body = response.json(),
        cdoResponse = new CdoResponse();

        cdoResponse.metadata = body.metadata;
        cdoResponse.results = body.results;

    return cdoResponse;
  }

  private handleError(error: Response | any) {
  
    return Observable.throw('poop');
  }

}
