global.__base = __dirname;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var _ = require('lodash');

const config = require(__base + '/config');
const timeLog = require(__base + '/server/util/TimeLog');
timeLog.start();

timeLog.log('Starting');

app.use('/pictures', express.static(__dirname + '/pictures'));
app.use('/', express.static(__dirname + '/client'));

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

// Start the webserver on :config.app.server.port
http.listen(3000, function(){
  console.log('info', 'Webserver listening on *:3000.');
});

var readRandomFile = function() {
    var files = ['01.jpg', '02.jpg', '03.jpg', '04.jpg'];
    var file = _(files).sample();
    var filename = __dirname + '/pictures/' + file;
    var bitmap = fs.readFileSync(filename);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

io.on('connection', function(socket) {
    console.log('Client connected');

    socket.on('next', function() {
        var iw = 3456;
        var ih = 2304;

        var scale = Math.ceil(Math.random() * 10);
        var height = ih / scale;
        var width = iw / scale;
        var top = Math.floor(Math.random() * (2304-height));//(ih / 2) - (height/2); //Math.round(2304/2 - width/2); //
        var left = Math.floor(Math.random() * (3456-width)); //(iw / 2) - (width/2); //Math.round(3456/2 - height/2); //
        var spec = {
            top: top,
            left: left,
            width: width,
            height: height,
            rotate: Math.ceil(Math.random() * 50) - 25
        }

        var buffer = readRandomFile();
        var args = {spec: spec, image: buffer, now: new Date()};
        console.log("Sending...");
        console.log(spec);
        timeLog.log('Sending image to client');
        socket.emit('image', args);
    });

    socket.on('received-image', function() {
        timeLog.log('Client received image');
    });

    socket.on('drew-image', function() {
        timeLog.log('Client drew image');
    });

    socket.on('save', function(data) {
        // cut the slack
        timeLog.log('Receiving image for saving');
        var index = 'data:image/jpeg;base64'.length;
        var img = data.image.substr(index);
        var filename = Math.ceil(Math.random() * 1000);
        fs.writeFile(__dirname + '/test' + filename + '.jpg', new Buffer(img, 'base64'), function(err) { 
            if (err) throw err
            timeLog.log('Done saving image');
            socket.emit('clear');
        });
    });
});