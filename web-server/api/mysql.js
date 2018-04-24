// var mysql = require('mysql')
// var connection = mysql.createConnection({
//   host     : process.env.RDS_HOSTNAME,
//   user     : process.env.RDS_USERNAME,
//   password : process.env.RDS_PASSWORD,
//   database : 'IOT4',
//   port: process.env.port,
//   multipleStatements: true
// });

// module.exports = connection;

// for local


var mysql = require('mysql')
var connection = mysql.createConnection({
  host     : 'iot4.cvxj8o1t0txz.us-east-1.rds.amazonaws.com',
  user     : 'joshua',
  password : 'Nicethiccboys!', // don't judge me
  database : 'IOT4',
  multipleStatements: true
});

module.exports = connection;
