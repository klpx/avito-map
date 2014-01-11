var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/getobjects', function(req, res) {
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect("mongodb://localhost:27017/avito", function(err, db) {
		if(err) { return console.dir(err); }

		var collection = db.collection('test'),
			criteria = {};

		if (req.query.price_range) {
			var price_range = req.query.price_range.split(',');
			criteria.price = {
				$gte: Number(price_range[0]),
				$lte: Number(price_range[1])
			}
		}

		console.log(criteria);
		collection.find(criteria).toArray(function(err, items) {
			res.json(items);
		});
	});
});

app.listen(3000);