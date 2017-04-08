import { Component, OnInit } from '@angular/core';

import { CdoService } from './cdo-service.service';
import { CdoResponse } from './cdo-response.class';
import { CdoStationRequest } from './cdo-stations-request.class';
import { CdoStation } from './cdo-station.class';

declare var L: any;
declare var $: any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	cdoResponse = new CdoResponse();
	map: any;
	markerLayer: any = L.layerGroup();
	date = '';
	loading = false;

	constructor(private cdoService: CdoService) { }

	ngOnInit() {
		this.cdoService.getDatasetMaxDate('GHCND').subscribe(date => {
			this.date = date;
		});
		this.onResize();

		this.map = L.map('map').setView([43.61, -98.50], 4);

		const Esri_WorldStreetMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
		}).addTo(this.map);

		this.markerLayer.addTo(this.map);

		// geocode search
		let searchControl = L.esri.Geocoding.geosearch().addTo(this.map),
			results = L.layerGroup().addTo(this.map);

		// idle event doesn't exist, make due with what we got
		this.map.on('load moveend', e => {

			let stationRequest = new CdoStationRequest(),
				bounds = this.map.getBounds();
			stationRequest.datasetid = 'GHCND';
			stationRequest.extent =
				`${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
			stationRequest.startdate = '2017-01-01T00:00:00';
			stationRequest.enddate = '2017-01-01T23:59:59';

			this.loading = true;
			$('.leaflet-container').addClass('loading');
			this.cdoService.getStations(stationRequest).subscribe(
				(stations: CdoStation[]) => {
					this.refreshStationMarkers(stations);
				},
				error => { console.log(error) },
				() => {
					this.loading = false;
					$('.leaflet-container').removeClass('loading');
				}
			);
		});
	}

	onResize() {
		let windowHeight: number,
			navHeight: number;

		windowHeight = window.innerHeight;
		navHeight = window.document.getElementById('nav').clientHeight;

		window.document.getElementById('map').style.height =
			(windowHeight - navHeight) + 'px';

	}

	refreshStationMarkers(stations: CdoStation[]) {
		this.markerLayer.clearLayers();
		stations.forEach((station: CdoStation) => {
			// Make the marker...
			let marker = L.marker(
					[station.latitude, station.longitude],
					{ icon: L.AwesomeMarkers.icon({ icon: 'record', markerColor: 'red', prefix: 'glyphicon' }) }).bindPopup(this.makePopupContent(station, null));
			this.markerLayer.addLayer(marker);

			// Then get the rest of the content on click
			marker.on('click', () => {
				this.cdoService.getData(station.id, this.date)
				.subscribe( (cdoResponse: CdoResponse) => {
					// Should only be one result
					let tavg = cdoResponse.results[0].value;
					console.log(tavg);
					marker.setPopupContent(this.makePopupContent(station, tavg));
				});
			});
		});
	}

	makePopupContent(station: CdoStation, tavg: string): string {
		let innerContent: string;
		if (tavg != null) {
			innerContent = `<strong>Average Temp:</strong> <h2>${tavg}<sup>&deg;c</sup></h2>`;
		} else {
			innerContent = '<h1><span class="glyphicon glyphicon-cd spin" aria-hidden="true"></span></h1>';
		}
		const content = `
			<div class="container-fluid">
				<div class="row">

					<div class="col-md-12">
						<h3>
							${station.name} <br />
							<small>${station.id}</small>
						</h3>
					</div>

					<div class="col-md-12" style="text-align:center">
						${innerContent}
					</div>

				</div>
			</div>
		`;

		return content;
	}

	onDateUpdate(date) {
		console.log(date);
	}
}
