import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs';

import { CdoResponse } from './cdo-response.class';
import { CdoStationRequest } from './cdo-stations-request.class';
import { CdoStation } from './cdo-station.class';

@Injectable()
export class CdoService {
	baseUrl = 'https://www.ncdc.noaa.gov/cdo-web/api/v2';
	token = 'IdNEXjwZWEjvmkHMrRgJLNfxijCdyzFC';

	constructor(private http: Http) { }

	getStations(stationRequest: CdoStationRequest): Observable<CdoStation[]> {
		let headers = new Headers(),
			params: URLSearchParams = CdoStationRequest.toSearchParams(stationRequest);

		headers.set('token', this.token);

		return this.http.get(`${this.baseUrl}/stations`, { 'search': params, 'headers': headers })
			.map(response => this.handleStationsResponse(response))
			.catch(error => this.handleError(error));
	}

	getData(stationid: string, date: string): Observable<CdoResponse> {

		let headers = new Headers();
		headers.set('token', this.token);

		let url = `${this.baseUrl}/data?datasetid=GHCND&stationid=${stationid}&startdate=${date}&enddate=${date}&units=metric&datatypeid=TAVG`;


		return this.http.get(url, { 'headers': headers })
			.map(response => this.handleDataResponse(response))
			.catch(error => this.handleError(error));
	}

	getDatasetMaxDate(datasetid: string): Observable<string> {
		let headers = new Headers();
		headers.set('token', this.token);

		let url = `${this.baseUrl}/datasets/${datasetid}`;

		return this.http.get(url, { 'headers': headers })
			.map(response => response.json().maxdate)
			.catch(error => this.handleError(error));
	}

	private handleStationsResponse(response: Response): CdoStation[] {
		let body = response.json(),
			stations: CdoStation[] = [];

		body.results.forEach(stationJson => {
			stations.push(CdoStation.fromJson(stationJson));
		});

		return stations;
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
