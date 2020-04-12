var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var fs = require('fs');
var _ = require("underscore");

var _DATA = JSON.parse(fs.readFileSync('data.json')).data;
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

/* Add whatever endpoints you need! Remember that your API endpoints must
 * have '/api' prepended to them. Please remember that you need at least 5
 * endpoints for the API, and 5 others.
 */

app.get("/", function(req, res) {
    console.log(_DATA)
    res.render('home', { data: _DATA });
})

app.get("/addSale", function(req, res) {
    console.log(_DATA)
    res.render('add', { data: _DATA });
})

app.get("/random", function(req, res) {
    let item = _DATA[Math.floor(Math.random() * _DATA.length)];
    res.render('random', { data: item });
});

app.get("/manyitems", function(req, res) {
    var results = _.filter(_DATA, function(sale) {
        if (sale['Number of Items'] >= 5)
            return true;
        else
            return false;
    });
    res.render('manyitems', { data: results });
});

app.get("/state/:st", function(req, res) {
    var _state = req.params.st;
    var results = _.filter(_DATA, function(sale) {
        if (sale['State'] == _state)
            return true;
        else
            return false;
    });
    res.render('state', { data: results });
});

app.get("/city/:ct", function(req, res) {
    var _city = req.params.ct;
    var results = _.filter(_DATA, function(sale) {
        if (sale['City'] == _city)
            return true;
        else
            return false;
    });
    res.render('city', { data: results });
});

app.get("/recent", function(req, res) {
    let item = _DATA[_DATA.length - 1];
    res.render('recent', { data: item });
});

app.post("/api/addSale", function(req, res) {
    let city = req.body.city;
    let state = req.body.state;
    let numItems = parseInt(req.body.numItems);
    let address = req.body.address;
    let items = req.body.items.split(",");
    let newSale = {
        "City": city,
        "State": state,
        "Number of Items": numItems,
        "Address": address,
        "List of Items": items
    };
    console.log(newSale);
    _DATA.push(newSale)
    res.render('home', { data: _DATA });
})

app.get("/api/getSales", function(req, res) {
    res.send(_DATA);
});

app.listen(process.env.PORT || 3000, function() {
    console.log('Listening!');
});