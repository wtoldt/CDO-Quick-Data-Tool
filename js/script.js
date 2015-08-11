var QuickDataTool = (function () {
    var quickDataTool = {};

    quickDataTool.ViewModel = function() {
        var self = this;

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
		self.infowindowOpen = ko.observable(true);
		
		self.extent = ko.observable();
		self.resultsLimit = ko.observable(25);
		self.resultsOffset = ko.observable(1);
		self.dataSet = ko.observable('GHCND');
		self.selectedDate = ko.observable();
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
                day = now.getDate();
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
				onSelect: function(dateText) {
					self.selectedDate(dateText);
					self.datepickerOpen(false);
				}
			}),
            now = new Date(),
			map,
			autocomplete,			
			cdoToken = 'IdNEXjwZWEjvmkHMrRgJLNfxijCdyzFC',
			cdoApi = {
				base: 'http://www.ncdc.noaa.gov/cdo-web/api/v2',
				stations: '/stations'
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
		var composeUrl = function() {
			var url = cdoApi.base + cdoApi.stations,
				parameters = [
					'datasetid=' + self.dataSet(),
					'extent=' + self.extent(),
					'sortfield=name',					
					'limit=' + self.resultsLimit(),
					'offset=' + self.resultsOffset(),
					'includemetadata=false'
				];
			return url + '?' + parameters.join("&");
		}
		
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
		
		var makeRequest = function() {
			var request = $.ajax({
				url:composeUrl(),
				headers: {
					token: cdoToken
				}
			}).done(function(response) {				
				self.results(response.results);
			}).fail(function() {
				console.log("failed!");
			}).always(function() {
				self.loading(false);
			});	
			return request
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

        /* initialize */
		$("#google_geolocator").val("");
		
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
		google.maps.event.addListener(map, 'idle', function() {
			if (!self.firstLoad()) {
				self.loading(true);				
				clearMarkers();
				self.extent(map.getBounds().toUrlValue());
				if (cdoRequest) {cdoRequest.abort();}
				
				cdoRequest = makeRequest();
			} else {
				self.firstLoad(false);
			}
		});
		
		autocomplete = new google.maps.places.Autocomplete(document.getElementById('google_geolocator'));
		autocomplete.setTypes(['geocode']);
		google.maps.event.addListener(autocomplete, 'place_changed', function() {
			var place = autocomplete.getPlace();
			if (place.geometry.viewport) {
				map.fitBounds(place.geometry.viewport);
			} else {
				map.setCenter(place.geometry.location);				
			}

		});
		
		$('#google_geolocator').focus(function() {
			this.select();
		});
		
		/* events */
		self.results.subscribe(function() {
			if (self.results() && self.results().length > 0) {
				self.results().forEach(function(result) {
					var marker = new google.maps.Marker({
						position:{lat: result.latitude, lng: result.longitude},
						map: map,
						title: result.id
					});					
					self.markers.push(marker);
					
					google.maps.event.addListener(marker, 'click', function() {
						handleMarkerClick(marker, result);						
					});
				});
			}
		});
    };

    return quickDataTool;
})();