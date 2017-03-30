import { Component, OnInit} from '@angular/core';

import { CdoService } from './cdo-service.service';
import { CdoResponse } from './cdo-response.class';
import { CdoStationRequest } from './cdo-stations-request.class';

declare var L:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  cdoResponse = new CdoResponse();
  map:any;

  constructor (private cdoService: CdoService) { }

  ngOnInit() {
    window.document.getElementById('map').style.height = window.innerHeight + 'px';

    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    }).addTo(this.map);

    // geocode search
    let searchControl = L.esri.Geocoding.geosearch().addTo(this.map),
        results = L.layerGroup().addTo(this.map);
    
    searchControl.on('results', data => {
      console.log(data);
    });

    // idle event doesn't exist, make due with what we got
    this.map.on('load moveend', e => {
      let stationRequest = new CdoStationRequest(),
          bounds = this.map.getBounds();
      stationRequest.datasetid = 'GHCND';
      stationRequest.extent = 
        `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()}${bounds.getEast()}`;
      stationRequest.startdate = '2017-01-01T00:00';
      stationRequest.enddate = '2017-01-01T23:59';
      
    });

  }

  onResize(event) {
    let windowHeight: number,
        navHeight: number;

    windowHeight = event.target.innerHeight;
    navHeight = window.document.getElementById('nav').clientHeight;
    console.log(navHeight);

     window.document.getElementById('map').style.height =
        (windowHeight - navHeight) + 'px';
    
    //window.document.getElementById('map').style.height = 
      //  event.target.innerHeight + 'px';
  }

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
