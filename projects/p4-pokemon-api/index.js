var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var pokeDataUtil = require("./poke-data-util");
var _ = require("underscore");
var app = express();
var PORT = 3000;

// Restore original data into poke.json. 
// Leave this here if you want to restore the original dataset 
// and reverse the edits you made. 
// For example, if you add certain weaknesses to Squirtle, this
// will make sure Squirtle is reset back to its original state 
// after you restard your server. 
pokeDataUtil.restoreOriginalData();

// Load contents of poke.json into global variable. 
var _DATA = pokeDataUtil.loadData().pokemon;

/// Setup body-parser. No need to touch this.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(req, res) {
    var contents = "";
    _.each(_DATA, function(i) {
        var id = i['id'];
        var name = i['name']
        contents += `<tr><td>` + id + '</td><td><a href="/pokemon/' + id + '"' + '>' + name + '</a></td></tr>\n';
    })
    var html = '<html>\n<body>\n<table>' + contents + '</table>\n</body>\n</html>';
    res.send(html);
});

app.get("/pokemon/:pokemon_id", function(req, res) {
    var id = req.params.pokemon_id;
    var _map = _DATA[id - 1];
    var content = "";
    for (var k in _map) {
        var val = _map[k].toString();
        content += `<tr><td>${k}</td><td>${val}</td></tr>\n`;
    }
    var html = '<html>\n<body>\n<table>' + content + '</table>\n</body>\n</html>';
    res.send(html);
});

app.get("/pokemon/image/:pokemon_id", function(req, res) {
    var id = req.params.pokemon_id;
    var html = `<img src=${_DATA[id - 1]['img']}>\n`;
    res.send(html);
});

app.get("/api/id/:pokemon_id", function(req, res) {
    // This endpoint has been completed for you.  
    var _id = parseInt(req.params.pokemon_id);
    var result = _.findWhere(_DATA, { id: _id })
    if (!result) return res.json({});
    res.json(result);
});

app.get("/api/evochain/:pokemon_name", function(req, res) {
    var _name = req.params.pokemon_name;
    var result = _.findWhere(_DATA, { name: _name })
    if (!result) return res.json({});
    var arr = []
    var prev = result['prev_evolution'];
    var next = result['next_evolution'];
    if (prev) {
        for (var i in prev) {
            arr.push(prev[i]['name']);
        }
    }
    arr.push(result['name']);
    if (next) {
        for (var i in next) {
            arr.push(next[i]['name']);
        }
    }
    res.send(arr);

});

app.get("/api/type/:type", function(req, res) {
    var names = [];
    var _type = req.params.type;
    var results = _.filter(_DATA, function(pokemon) {
        if (pokemon['type'].includes(_type))
            return pokemon['name'];
        else
            return false;
    });
    if (!results) return res.send(names);
    for (var i in results) {
        names.push(results[i]['name']);
    }
    res.send(names);
});

app.get("/api/type/:type/heaviest", function(req, res) {
    var result = {};
    console.log(result);
    var _type = req.params.type;
    var results = _.filter(_DATA, function(pokemon) {
        if (pokemon['type'].includes(_type))
            return pokemon['name'];
        else
            return false;
    });
    if (!results) res.send(result);
    var max = 0
    for (var i in results) {
        var weight = parseInt(results[i]['weight']);
        if (weight > max) {
            result['name'] = results[i]['name'];
            result['weight'] = weight;
            max = weight;
        }
    }
    res.send(result);
});

app.post("/api/weakness/:pokemon_name/add/:weakness_name", function(req, res) {
    var _name = req.params.pokemon_name;
    var _weakness = req.params.weakness_name;
    var result = _.findWhere(_DATA, { name: _name })
    if (!result) return res.json({});
    if (!result['weaknesses'].includes(_weakness))
        result['weaknesses'].push(_weakness);
    pokeDataUtil.saveData(_DATA);
    var final = {}
    final['name'] = result['name'];
    final['weaknesses'] = result['weaknesses'];
    res.send(final);
});

app.delete("/api/weakness/:pokemon_name/remove/:weakness_name", function(req, res) {
    var _name = req.params.pokemon_name;
    var _weakness = req.params.weakness_name;
    var result = _.findWhere(_DATA, { name: _name })
    if (!result) return res.json({});
    if (result['weaknesses'].includes(_weakness))
        result['weaknesses'].splice(result['weaknesses'].indexOf(_weakness), 1);
    pokeDataUtil.saveData(_DATA);
    var final = {}
    final['name'] = result['name'];
    final['weaknesses'] = result['weaknesses'];
    res.send(final);
});


// Start listening on port PORT
app.listen(PORT, function() {
    console.log('Server listening on port:', PORT);
});

// DO NOT REMOVE (for testing purposes)
exports.PORT = PORT