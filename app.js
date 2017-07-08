/*
var cookieParser = require('cookie-parser')
var session = require('express-session')
var express = require('express')

var app = express()

app.use(cookieParser())

var sess = {
  secret: 'keyboard cat',
  cookie: {}
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  //sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))


app.get('/', function (req, res, next) {
  // Update views
  req.session.views = (req.session.views || 0) + 1

  console.log(req.cookies['connect.sid'])
  // Write response
  res.sendFile('/public/index.html', {root: __dirname })
})

app.post('/', function (req, res, next) {
  console.log(req.cookies['connect.sid'])
  res.end(req.session.views)
})

app.listen(3000)

*/


var bodyParser =  require('body-parser')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var express = require('express')
var cfenv = require('cfenv')
var Cloudant = require('cloudant')

var username = '91d3d536-3383-4791-96c5-b0a9c9311c70-bluemix'
var password = '8851652d8f6f9f8635e0b120a4c041b9bdfaa182c73f65d74db6fcad5b185c49'
var cloudant = Cloudant({account:username, password:password})
var gps = cloudant.db.use('gps')

var app = express()
var appEnv = cfenv.getAppEnv()

app.use(cookieParser())
app.use(bodyParser())

var sess = {
  secret: 'keyboard cat',
  cookie: {}
}

//if (app.get('env') === 'production') {
  //app.set('trust proxy', 1) // trust first proxy
  //sess.cookie.secure = true // serve secure cookies
//}

app.use(session(sess))


app.get('/', function (req, res, next) {
  // Update views
  req.session.views = (req.session.views || 0) + 1
  //console.log(req.cookies);
  //console.log(req.cookies['connect.sid'])
   // Write response
  res.sendFile('/public/index.html', {root: __dirname })
})

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
    //console.log('get');
    if (!err){
      gps.destroy(body._id, body._rev, function(erro, body) {
        //console.log('destroy');
        if(!erro){
          gps.insert(coord, function(error, body) {
            //console.log('insert');
            if (!error){
              console.log('You have inserted the position of' + body.id);
              //res.send("hola");
            }
            //res.send({ results: error});
          })
        }
        //res.send({ results: erro});
      })
    }else {
      //console.log('not_found');
      gps.insert(coord, function(error, body) {
        //console.log('insert because is new');
        if (!error){
           console.log('You have inserted the position of' + body.id);
           //res.send("hola");
        }
        //res.send({ results: error});
      })
    }
  })
  res.send("sucessfull");
});

function rev() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return '1-' + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4()
}

app.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});

