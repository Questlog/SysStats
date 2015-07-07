var WebSocketServer = require('websocket').server;
var http = require('http');
var express = require('express');
var os = require('os');
var fs = require('fs');

// Delivering static files
var app = express();
app.set('view engine', 'jade');
app.use('/', express.static('static'));
/*app.get('/', function(req, res) {
    res.sendFile('static/index.html', {root: __dirname })
});*/

// Start a HTTPserver on 1337
var server = app.listen(1337, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
});

// Create the WebSocket server
var wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    // Handle all WebSocket messages
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            if(message.utf8Data === 'getStats'){
                sendStats(connection);
            }
        }
    });

    connection.on('close', function(connection) {
        // close user connection
    });
});

wsServer.on('connect', function(connection){
  var socket = connection.socket;
  console.log('New connection from: ' + socket.remoteAddress);
})


// global Variables for the code below
var oldTotalTime = 0;
var oldIdleTime = 0;

var load = 0;
var oldload = 0;
var oldload1 = 0;

var memTotal = 0;
var memFree = 0;
var uptime = 0;

//Interval to get cputime
setInterval(function(){
  fs.readFile('/proc/stat', {encoding: 'utf8'}, function (err, data) {
    if (err) throw err;
    // Ex: cpu  5940622 105667 9314518 911152839 392720 3685 192676 2 0 0
    var stats = data.match('cpu\\s+(.*)\\n')[1].split(' ');

    var idleTime = parseInt(stats[3]);
    var totalTime = 0;
    for(i = 0; i < stats.length; i++){
      totalTime += parseInt(stats[i]);
    }

    var diffIdle = idleTime - oldIdleTime;
    var diffTotal = totalTime - oldTotalTime;

    var currentload = (1000*(diffTotal - diffIdle)/diffTotal+5)/10;

    load = (oldload + currentload + oldload1)/3;


    oldload1 = oldload;
    oldload = currentload;
    oldTotalTime = totalTime;
    oldIdleTime = idleTime;
  });
}, 100);

// Meminfo..
setInterval(function(){
  fs.readFile('/proc/meminfo', {encoding: 'utf8'}, function (err, data) {
    if (err) throw err;
    var stats = data.match(/(\d+)/g);
    memTotal = parseInt(stats[0]);
    memFree = parseInt(stats[1]) + parseInt(stats[2]) + parseInt(stats[3]);
    
  });
}, 100);

// ...
setInterval(function(){
  uptime = os.uptime();
}, 1000);


function sendStats(connection){

  var sysStats = {
    "totalmem" : memTotal,
    "freemem" : memFree,
    "uptime" : uptime,
    "load" : load
  };

  connection.sendUTF(JSON.stringify(sysStats));
}
