import { URLSearchParams } from '@angular/http';

export class CdoStationRequest {
	extent: string;
	datasetid: string;
	startdate: string;
	enddate: string;

	public static toSearchParams(stationRequest: CdoStationRequest): URLSearchParams {
		let params = new URLSearchParams();
		if (stationRequest.extent != null) {
			params.set("extent", stationRequest.extent);
		}
		if (stationRequest.datasetid != null) {
			params.set("datasetid", stationRequest.datasetid);
		}
		if (stationRequest.startdate != null) {
			params.set("startdate", stationRequest.startdate);
		}
		if (stationRequest.enddate != null) {
			params.set("enddate", stationRequest.enddate);
		}
		params.set('limit', '100');
		params.set('offset', '0');
		params.set('sortfield', 'name');
		params.set('includemetadata', 'false');

		return params;
	}
}
