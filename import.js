function avitoUrl () {
	return 'http://www.avito.ru/novosibirsk/kvartiry/sdam/na_dlitelnyy_srok?p=4&i=1&metro_id=2024&pmax=12000'
}

var jsdom = require('jsdom');
var dgapi = require('2gis-api');
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost:27017/avito", function(err, db) {
	if(err) { return console.dir(err); }

	var collection = db.collection('test');
	
	jsdom.env({
		url: avitoUrl(),
		scripts: ["http://code.jquery.com/jquery.js"],
		done: function (errors, window) {
			var $ = window.$;
			$.fn.justtext = function() {
				return $(this).clone()
					.children()
					.remove()
					.end()
					.text();
			};
			dgapi.configure({
				serviceUrl: 'catalog.api.2gis.ru',
				version: 1.3,
				key: 'rupycp2722'
			});

			$(".b-catalog-table .item").each(function() {
				var item = $(this);
				var doc = {
					link: 'http://www.avito.ru' + item.find('.title a').attr('href'),
					photo: item.find('.b-photo img').data('srcpath'),
					title: $.trim(item.find('.title a').text()),
					price: Number(item.find('.about span:first').text().replace(/[^0-9]/g, '')),
					address: $.trim(item.find('.address').justtext().replace(/^[\s\,]+/, '')),
				};
				if (isNaN(doc.price) || doc.price == 0) return;

				dgapi.geoSearch({
					q: 'Новосибирск ' + doc.address,
					types: 'house'
				}, function (err, data) {
					if (data.response_code == '200') {
						doc.geometry = data.result[0];
					}
					collection.insert(doc, function(err, collection) {});
				});
			});
			window.close();
		}
	});
});