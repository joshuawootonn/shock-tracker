var http = require('http');
var express = require('express');
var firebaseui = require('firebaseui');
var fs = require('fs');

http.createServer( function(request, response) {
  fs.readFile('templates/demo.html', function(err, data) {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write(data);
    res.end();
  });
}).listen(8080);
