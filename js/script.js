var QuickDataTool = (function () {
    var quickDataTool = {};

    quickDataTool.ViewModel = function() {
        var self = this;

        /* public fields */
		self.errorMessages = ko.observableArray([]);
		self.loading = ko.observable(false);
		self.firstLoad = ko.observable(true);
		
		self.results = ko.observableArray([]);
		self.markers = ko.observableArray([]);
		
		self.extent = ko.observable();
		self.resultsLimit = ko.observable(25);
		self.resultsOffset = ko.observable(1);
		self.dataSet = ko.observable('GHCND');


        /* private fields */
        var map,
			autocomplete,			
			cdoToken = 'IdNEXjwZWEjvmkHMrRgJLNfxijCdyzFC',
			cdoApi = {
				base: 'http://www.ncdc.noaa.gov/cdo-web/api/v2',
				stations: '/stations'				
			};


        /* public methods */


        /* private methods */
		var composeUrl = function() {
			var url = cdoApi.base + cdoApi.stations,
				parameters = [
					'datasetid=' + self.dataSet(),
					'extent=' + self.extent(),
					'limit=' + self.resultsLimit(),
					'offset=' + self.resultsOffset()
				];
			return url + '?' + parameters.join("&");
		}
		
		var clearMarkers = function() {
			if (self.markers()) {
				self.markers().forEach(function(marker) {
					marker.setMap(null);
				});	
			}
		};

        /* initialize */
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
				
				$.ajax({
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
		
		/* events */
		self.results.subscribe(function() {
			if (self.results() && self.results().length > 0) {
				self.results().forEach(function(result) {
					var marker = new google.maps.Marker({
						position:{lat: result.latitude, lng: result.longitude},
						map: map
					});
					self.markers.push(marker);
				});
			}
		});

    };

    return quickDataTool;
})();