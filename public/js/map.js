var map = L.map('appmap').setView([51.505, -0.09], 13);

L.tileLayer('http://tile{s}.maps.2gis.ru/tiles?x={x}&y={y}&z={z}&v=1', {
	subdomains: '0123456789'
}).addTo(map);

var markers = L.featureGroup();

var icons = [];
for (var i = 1; i <= 10; i++) {
	icons.push(L.icon({
		iconUrl: '/images/marker_' + ('0' + i).slice(-2) + '.png',
		iconSize: [16, 24],
		iconAnchor: [8, 23],
		popupAnchor: [0, -8]
	}));
}

var SearchModel = {
	priceRange: ko.observable([6000, 10000])
};

function getObjects() {
	$.ajax({
		url: '/getobjects',
		data: {
			price_range: SearchModel.priceRange
		},
		success: function (data) {
			markers.clearLayers();

			var min, max;
			for (var i in data) {
				var obj = data[i];
				if (obj.price < min || isNaN(min)) {
					min = obj.price;
				}
				if (obj.price > max || isNaN(max)) {
					max = obj.price;
				}
			}
			for (var i in data) {
				var obj = data[i];
				if (obj.geometry) {
					var priceClass = Math.floor((obj.price - min)/(max - min)*10);
					if (priceClass > 9) priceClass = 9;

					var coords = obj.geometry.centroid.match(/([\d\.]+)/g).reverse();
					L.marker(coords, {icon: icons[priceClass]}).bindPopup(
						"<a href='" + obj.link + "'>" + obj.title + "</a>" + 
						"<br><b>" + obj.price + "</b> <span class='rub'>p<span>уб.</span></span> в месяц<br>" +
						"<img src='" + obj.photo + "' width='140' />"
					).addTo(markers);
				}
			}

			markers.addTo(map);
			map.fitBounds(markers.getBounds());
		}
	});
}

getObjects();

ko.bindingHandlers.range = {
	init: function (el, valueAcc) {
		var val = valueAcc();
		$(el).slider({
			range: true,
			min: 5000,
			max: 15000,
			step: 500,
			values: ko.utils.unwrapObservable(val),
			slide: function (event, ui) {
				if (ko.isWriteableObservable(val)) {
					val([ui.values]);
				}
			}
		})
	}
};

SearchModel.priceRange.subscribe(getObjects);

ko.applyBindings(SearchModel);