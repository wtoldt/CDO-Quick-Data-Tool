var QuickDataTool = (function () {
    var quickDataTool = {};

    quickDataTool.ViewModel = function() {
        var self = this,
			now = new Date();		
		now.setDate(now.getDate()-5);

        /* public fields */
		self.errorMessages = ko.observableArray([]);
		self.loading = ko.observable(false);
		self.firstLoad = ko.observable(true);
		self.settingsOpen = ko.observable(false);
		
		self.results = ko.observableArray([]);
		self.markers = ko.observableArray([]);
		self.selectedInfowindow = ko.observable();
		self.selectedStation = ko.observable();
		self.selectedMarker = ko.observable();
		self.selectedData = ko.observableArray([]);
		self.infowindowOpen = ko.observable(true);
		
		self.extent = ko.observable();
		self.resultsLimit = ko.observable(25);
		self.resultsOffset = ko.observable(1);
		self.dataSet = ko.observable('GHCND');
		self.maxDate = ko.observable();
		self.selectedDate = ko.observable(now.toISOString().substring(0,10));
		self.datepickerOpen = ko.observable(false);
		
		self.getYear = ko.pureComputed(function() {
           var year;
            if (self.selectedDate()) {
                year = self.selectedDate().substring(0,4);
            } else {
                year = now.getFullYear();
            }
            return year;
        });
		
		self.getMonth = ko.pureComputed(function() {
            var month;
            if (self.selectedDate()) {
                month = Number(self.selectedDate().substring(5,7));
            } else {
                month = now.getMonth() + 1;
            }
            return monthNames[month-1];
        });
		
		self.getDay = ko.pureComputed(function() {           
           var day;
            if (self.selectedDate()) {
                day = Number(self.selectedDate().substring(8,10));
            } else {
                day = now.getDate() - 5;
            }
            return day;
        });


        /* private fields */
        var monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JLY","AUG","SEP","OCT","NOV","DEC"],
			datepicker = $('#datepicker').datepicker({
				dateFormat: 'yy-mm-dd',
				altField: "#selectedDate",
				changeMonth: true,
				changeYear: true,
				showButtonPanel: true,
				onSelect: function(dateText) {
					self.selectedDate(dateText);
					self.datepickerOpen(false);
				}				
			}).datepicker( "setDate", self.selectedDate() ),            
			map,
			autocomplete,			
			cdoToken = 'IdNEXjwZWEjvmkHMrRgJLNfxijCdyzFC',
			cdoApi = {
				base: 'http://www.ncdc.noaa.gov/cdo-web/api/v2',
				stations: '/stations',
				datasets: '/datasets',
				data: '/data'
			},
			cdoRequest;


        /* public methods */
		self.showDatepicker = function() {
            self.datepickerOpen(true);
        };
		
		self.toggleDatepicker = function() {			
			self.datepickerOpen(!self.datepickerOpen());
		}
		
		self.toggleSettings = function() {
			self.settingsOpen(!self.settingsOpen());
		}

        /* private methods */
		var composeStationsUrl = function() {
			var url = cdoApi.base + cdoApi.stations,
				parameters = [
					'datasetid=' + self.dataSet(),
					'extent=' + self.extent(),
					'startdate=' + self.selectedDate() + 'T00:00:00',
					'enddate=' + self.selectedDate() + 'T23:59:59',
					'sortfield=name',					
					'limit=' + self.resultsLimit(),
					'offset=' + self.resultsOffset(),
					'includemetadata=false'
				];
			return url + '?' + parameters.join("&");
		}
		
		var composeDataUrl = function(station) {
			var url = cdoApi.base + cdoApi.data,
				parameters = [
					'datasetid=' + self.dataSet(),
					'stationid=' + station.id,
					'startdate=' + self.selectedDate() + 'T00:00:00',
					'enddate=' + self.selectedDate() + 'T23:59:59',
					'datatypeid=PRCP',
					'datatypeid=SNOW',
					'datatypeid=TMAX',
					'datatypeid=TMIN',
					'datatypeid=TAVG',
					'includemetadata=false'
				];
			return url + '?' + parameters.join("&");
		};
		
		var clearMarkers = function() {			
			if (self.markers()) {
				self.markers().forEach(function(marker) {
					if (marker.setMap) {
						marker.setMap(null);
					} else {
						console.log("this marker is broken " + typeof marker);
						console.log(marker);
					}
				});	
			}
		};
		
		var safelyCloseInfowindow = function(node) {
			//http://stackoverflow.com/a/25274909
			//google maps will destroy this node and knockout will stop updating it
			//add it back to the body so knockout will take care of it
			$("body").append(node);
			
			self.infowindowOpen(false);
			if (self.selectedMarker()) {
				self.markers.push(self.selectedMarker());
				self.selectedMarker(false);
			}
			self.selectedInfowindow().close();
		};
		
		var getStations = function() {			
			if (!self.firstLoad()) {
				self.loading(true);				
				clearMarkers();
				self.extent(map.getBounds().toUrlValue());
				if (cdoRequest) {cdoRequest.abort();}
				
				cdoRequest = $.ajax({
					url:composeStationsUrl(),
					headers: {
						token: cdoToken
					}
				}).done(function(response) {				
					self.results(response.results);
				}).fail(function() {
					console.log("stations failed!");
				}).always(function() {
					self.loading(false);
				});
			} else {
				self.firstLoad(false);
			}
		};
		
		var getData = function(station) {
			self.loading(true);
			$.ajax({
				url:composeDataUrl(station),
				headers: {
					token: cdoToken
				}
			}).done(function(response) {
				var data = [];	
				if (Object.getOwnPropertyNames(response).length > 0) {					
					response.results.forEach(function(result) {
						var datum = {
							name: result.datatype,
							value: Number(result.value)
						};
						switch (result.datatype) {
							case 'PRCP':
								datum.value = datum.value/10;
								datum.units = "(mm)";
								break;
							case 'SNOW':
								datum.units = "(mm)";
								break;
							case 'TMAX':
							case 'TMIN':
							case 'TAVG':
								datum.value = datum.value/10;
								datum.units = "(C)";
								break;
						}
						data.push(datum);
					});	
				} else {
					data.push({name:'Sorry,', value:' no data', units:' :('});
				}
				self.selectedData(data);
			}).fail(function() {
				console.log("data failed!");
			}).always(function() {
				self.loading(false);
			});	
		};
		
		var handleMarkerClick = function(marker, result) {
			// Close current info window if any
			if (self.selectedInfowindow()) {							
				self.selectedInfowindow().setContent($("#infowindow-closing").html());							
			}
			
			// Remove marker so that when we clear markers, this one stays
			self.selectedMarker(self.markers.remove(marker)[0]);						
			self.selectedStation(result);
			var $node = $('#infowindow');						
			var infowindow = new google.maps.InfoWindow({
				content: $node[0]
			});	
			
			// Clear data and get new data
			self.selectedData([]);
			getData(result);
			
			infowindow.open(map,marker);
			self.infowindowOpen(true);
			self.selectedInfowindow(infowindow);			
			
			google.maps.event.addListener(infowindow, "closeclick", function () {				
				safelyCloseInfowindow($node);
			});
			
			google.maps.event.addListener(infowindow, "content_changed", function () {
				// Because there is no closed event for info window, I'm setting the
				// content and hooking into that event here.
				safelyCloseInfowindow($node);
			});
		};
		
		var fetchMaxDate = function() {
			var url = cdoApi.base + cdoApi.datasets + "/" + self.dataSet();
			$.ajax({
				'url':url,
				headers: {
					token: cdoToken
				}
			}).done(function(response) {
				var currentdate = self.selectedDate().split('-').join(''),
					maxdate = response.maxdate.substring(0,10).split('-').join('');
				self.maxDate(response.maxdate.substring(0,10));
				datepicker.datepicker( "option", "maxDate", response.maxdate );
				
				/* if (currentdate > maxdate) {
					datepicker.datepicker( "setDate", response.maxdate );
					self.selectedDate(response.maxdate.substring(0,10));	
				}	 */			
			}).fail(function(response) {
				console.log("fetchMaxDate has failed");
			}).always(function() {
			
			});
		}

        /* initialize */
		// Clear geolocator input
		$("#google_geolocator").val("");
		
		// Get maxdate of datset and set datepicker maxdate
		fetchMaxDate();
		
		// Init the map
		var mapOptions = {        
			center: { lat: 39.10102067020093, lng: -101.07749658203123 },
			zoom: 4,
			disableDefaultUI: true,
			zoomControl: true,
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_CENTER
			}
		};
		map = new google.maps.Map(document.getElementById('map'), mapOptions);
		
		// Set map idle event. This is when we look up stations
		google.maps.event.addListener(map, 'idle', function() {
			getStations();
		});
		
		// Init autocomplete
		autocomplete = new google.maps.places.Autocomplete(document.getElementById('google_geolocator'));
		autocomplete.setTypes(['geocode']);
		
		// Set up place changed event
		google.maps.event.addListener(autocomplete, 'place_changed', function() {
			var place = autocomplete.getPlace();
			if (place.geometry.viewport) {
				map.fitBounds(place.geometry.viewport);
			} else {
				map.setCenter(place.geometry.location);				
			}

		});
		
				
		/* events */
		self.results.subscribe(function() {
			// Create a marker for each result
			if (self.results() && self.results().length > 0) {
				self.results().forEach(function(result) {
					var marker = new google.maps.Marker({
						position:{lat: result.latitude, lng: result.longitude},
						map: map,
						title: result.id
					});					
					self.markers.push(marker);
					
					// Create a click event for each marker
					google.maps.event.addListener(marker, 'click', function() {
						handleMarkerClick(marker, result);						
					});
				});
			}
		});
		
		self.selectedDate.subscribe(function() {
			getStations();
		});
    };

    return quickDataTool;
})();