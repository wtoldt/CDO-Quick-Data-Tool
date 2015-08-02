var QuickDataTool = (function () {
    var quickDataTool = {};

    quickDataTool.ViewModel = function() {
        var self = this;

        /* public fields */


        /* private fields */
        var map;


        /* public methods */


        /* private methods */


        /* initialize */
		var mapOptions = {        
			center: { lat: 39.10102067020093, lng: -101.07749658203123 },
			zoom: 5        
		};
		map = new google.maps.Map(document.getElementById('map'), mapOptions);
		google.maps.event.addListener(map, 'idle', function() {
			console.log(map.getCenter());
		});


    };

    return quickDataTool;
})();

ko.applyBindings(QuickDataTool.ViewModel());