
/**
 * module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , io = require('socket.io')
  , useragent = require('useragent')
  , gm = require('googlemaps')

// Uncomment to update useragent lookup table
//useragent(true);

// Set the proxy uri
//gm.setProxy('http://your.proxy');

///////////////////////////////////////////////////////////////////// ROBODECK APP
var app = module.exports = express.createServer();

// console.log(app);

// Set the state of the slides to 0
// var state = 0;

// Clients is a list of users who have connected
var clients = [];

///////////////////////////////////////////////////////////////////// SEND() UTILITY
function send(message) { 
	
  clients.forEach(function(client) {
      client.send(message);
  });
}

///////////////////////////////////////////////////////////////////// DATE UTILITY
function getTime(){
	var currentTime = new Date();
	return currentTime;
}
///////////////////////////////////////////////////////////////////// APP CONFIGS
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

///////////////////////////////////////////////////////////////////// INITIAL LOAD - DEVICE DETECT --> SERVE MARKUP, STATIC ASSETS
///////////////////////////////////////////////////////////////////// ROUTES
app.get('/', function(req, res) {
	
	routes.desktop(req, res);
	
	// var ua = useragent.is(req.headers['user-agent'])
	// switch(true)
	// {
	// case ua.chrome:
	//   console.log('within ROOT route / detected as chrome desktop');
	//   routes.desktop(req, res);
	//   break;
	// case ua.mobile_safari:
	//   console.log('within ROOT route / detected as mobile_safari');
	//   routes.iphone(req, res);
	//   break;
	// default:
	//   console.log('within ROOT route / fallback to default');
	//   routes.desktop(req, res);
	// }
});

app.get('/x', function(req, res) {
	  routes.iphone(req, res);
});

///////////////////////////////////////////////////////////////////// ACCEPT XHR CALLS FROM REMOTE MOBILE APP 
///////////////////////////////////////////////////////////////////// ROUTES - Next()
app.get('/next', function(req, res) {
  console.log('NEXT- ' + 'server time: ' + getTime() + ', client time: ' + req);	
  send(JSON.stringify({ "cmd": 'next' }));
  res.send("ok");
});

///////////////////////////////////////////////////////////////////// ROUTES - Back()
app.get('/back', function(req, res) {
  console.log('PREV ' + getTime());
  send(JSON.stringify({ "cmd": 'prev' }));
  res.send("ok");
});

///////////////////////////////////////////////////////////////////// ROUTES - Other()
app.get('/other', function(req, res) {
  send(JSON.stringify({ "fn": function(){console.log('other callback fn')} }));
});

app.listen(process.env.PORT || 1511);

///////////////////////////////////////////////////////////////////// SOCKET.IO SERVER
// var sio = io.listen(app, {"heartbeats": false, "transports": ['websocket'], "close timeout": 100});
// var sio = io.listen(app, {"heartbeats": false, "close timeout": 100});
var sio = io.listen(app);
console.log(sio.settings);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

///////////////////////////////////////////////////////////////////// SOCKET.IO WEB SOCKETS
sio.sockets.on('connection', function(client) {
  // For each connection made add the client to the array of clients.
  console.log('server connection EVENT FIRED');
  //console.log('CLIENT connected'); 
//  console.log('CLIENT ID: ' + client.id + ', TRANSPORT MECHANISM: ' + sio.transports[client.id].name);

///////////////////////////////////////////////////////////////////// BUILD CLIENTS LIST
  clients.push(client);
  console.log(clients.length);

  send(JSON.stringify({ "clients": clients.length }));

  // log each clients id
  clients.forEach(function(client) {
	
    console.log('CLIENT ID: ' + client.id);
    // console.log(client);
	
  });

  client.on('disconnect', function () {
    console.log('disconnect EVENT FIRED');
	console.log(clients.length)
//	var index = clients.indexOf(client.id);
    var index = -1;
    for(var i=0; i < clients.length; i++) {
      if (clients[i].id == client.id) {
        index = i;
        break;
      }
    }
   	console.log(index)
	clients.splice(index, 1);
	console.log(clients.length)
  });

  client.on('geo', function(data) {
	console.log('geo MESSAGE received');
	console.log(data);
	var loc = data.lat + "," + data.long
	console.log(loc)
	gm.reverseGeocode(loc, function(err, data){
      if (data) {
        var city = data.results[0].address_components[2].long_name; 
        var state = data.results[0].address_components[4].long_name;
        loc = city + ", " + state; 
      }
	  send(JSON.stringify({ "loc": loc }));
	});
  });
});