var express = require('express')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var bodyParser =  require('body-parser')
var cfenv = require('cfenv')
var Cloudant = require('cloudant')

var username = '91d3d536-3383-4791-96c5-b0a9c9311c70-bluemix'
var password = '8851652d8f6f9f8635e0b120a4c041b9bdfaa182c73f65d74db6fcad5b185c49'
var cloudant = Cloudant({account:username, password:password})
var gps = cloudant.db.use('gps')
var app = express()



app.use(express.static(__dirname + '/public'))
var appEnv = cfenv.getAppEnv();

app.set('trust proxy', 1) // trust first proxy

app.use(cookieParser())
app.use(bodyParser())

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

/*
app.get('/', function (req, res, next) {
  // Update views
  req.session.views = (req.session.views || 0) + 1

  //console.log(req.cookies['connect.sid'])
   // Write response
  res.sendFile('tracking.html', {root: __dirname })
})
*/

app.post('/', function (req, res, next) {
      var coord = {
        "_id": req.cookies['connect.sid'],
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [Number(req.body["geometry"]["coordinates"][0]), Number(req.body["geometry"]["coordinates"][1])]
        },
        "properties": {
          "timestamp": req.body["properties"]["timestamp"]
        }
      }

  gps.get(req.cookies['connect.sid'], function(err, body) {
    if (!err){
      gps.destroy(body._id, body._rev, function(erro, body) {
        if(!erro){
          gps.insert(coord, function(error, body, header) {
            if (!error){
              console.log('You have inserted the positoin of' + body.id);
              return res.send({results: body});
            }
          });
        }
      });
    }
  });
});

function rev() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return '1-' + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4()
}


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});





