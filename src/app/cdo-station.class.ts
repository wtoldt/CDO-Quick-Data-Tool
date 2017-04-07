export class CdoStation {
	elevation: number;
	elevationUnit: string;
	mindate: string;
	maxdate: string;
	latitude: number;
	longitude: number;
	name: string;
	datacoverage: number;
	id: string;

	public static fromJson(json: any): CdoStation {
		let station = new CdoStation();

		station.elevation = json.elevation;
		station.elevationUnit = json.elevationUnit;
		station.mindate = json.mindate;
		station.maxdate = json.maxdate;
		station.latitude = json.latitude;
		station.longitude = json.longitude;
		station.name = json.name;
		station.datacoverage = json.datacoverage;
		station.id = json.id;

		return station;
	}
}