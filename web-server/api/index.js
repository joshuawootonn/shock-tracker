var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser());
// Our handler function is passed a request and response object
app.get('/api/', (req, res) => res.send('Hello World!'))
app.use('/api/',require('./routes/user'));
app.use('/api/',require('./routes/session'));

var port = process.env.PORT || 3000;
app.listen(port , () => console.log('Example app listening on port ' + port))