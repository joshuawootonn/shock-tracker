var express = require("express");
var app = express();
// Our handler function is passed a request and response object
app.get('/api/', (req, res) => res.send('Hello World!'))
app.use('/api/',require('./routes/user'));
app.use('/api/',require('./routes/session'));
app.listen(3000, () => console.log('Example app listening on port 3000!'))