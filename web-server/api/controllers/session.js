const connection = require("../mysql");


exports.post = (req, res) => {
 
  connection.query(
    `INSERT INTO  (create_time,update_time,user_name) VALUES (now(),now(),'${req
      .body.user_name}')`,
    (err, rows, fields) => {
      if (err) {
        res.status(500).send({message: "User creation error"});
      }
      else{
        res.status(200).send({message: "User created successfully"})
      }
    }
  );
};









exports.getAll = (req, res) => {
  connection.query(`SELECT * FROM user`, (err, rows, fields) => {
    if (err) {
      res.status(500).send({message: "User access error"});
    }
    else{
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(JSON.stringify(rows));
    }
  });  
};
exports.get = (req, res) => {
  if(!req.params.id){
    res.status(500).send({message:"Provide an id is your request params"})
  }
  connection.query(
    `SELECT * FROM user WHERE id='${req.params.id}'`,
    (err, rows, fields) => {
      if (err) {
        res.status(500).send({message: "User access error"});
      }
      else{
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(rows));
      }
      
    }
  );
};


exports.delete = (req, res) => {
  if(!req.params.id){
    res.status(500).send({message:"Provide an id is your request params"})
  }
  connection.query(
    `delete from user where id=${req.params.id}`,
    (err, rows, fields) => {
      if (err) {
        res.status(500).send({message: "User deletion error"});
      }
      else{
        res.status(200).send({message: "User deleted successfully"})
      }
      
    }
  );
};
