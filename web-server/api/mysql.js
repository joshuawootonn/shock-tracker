var mysql = require('mysql')
var connection = mysql.createConnection({
  host     : 'iot4.cvxj8o1t0txz.us-east-1.rds.amazonaws.com',
  user     : 'joshua',
  password : 'Nicethiccboys!', // don't judge me
  database : 'IOT4',
  multipleStatements: true
});

module.exports = connection;
// connection.connect()

// connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
//   if (err) throw err

//   console.log('The solution is: ', rows[0].solution)
// })

// connection.end()