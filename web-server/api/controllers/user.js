const connection = require("../mysql");

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
        res.status(200).send(JSON.stringify(rows[0]));
      }
      
    }
  );
};

exports.post = (req, res) => { 
  connection.query(
    `INSERT INTO user (create_time,update_time,user_name,uuid) VALUES (now(),now(),'${req
      .body.user_name}','${req.body.uuid}')`,
    (err, rows, fields) => {
      if (err) {
        res.status(500).send({message: "User creation error"});
      }
      else{        
        connection.query(`SELECT * FROM user WHERE id=${rows.insertId}`, (err, rows2, fields) => {
          if (err) {
            res.status(500).send({message: "User was created but there was an error retreiving them"});
          }
          else{
            res.setHeader("Content-Type", "application/json");
            res.status(200).send(JSON.stringify(rows2[0]));
          }
        });
        
      }
    }
  );
};
exports.put = (req, res) => {
  if(!req.params.id){
    res.status(500).send({message:"Provide an id is your request params"})
  }
  let update = "";
  Object.keys(req.body).forEach((key, index) => {    
      update = ` ${update} ${key}="${req.body[key]}", `;
  });
  update = ` ${update} update_time=now() `;

  connection.query(
    `update user set ${update} where id=${req.params.id}`,
    (err, rows, fields) => {
      if (err) {
        res.status(500).send({message: "User update error"});
      }
      else{
        connection.query(`SELECT * FROM user WHERE id=${req.params.id}`, (err, rows2, fields) => {
          if (err) {
            res.status(500).send({message: "User was updated but there was an error retreiving them"});
          }
          else{
            res.setHeader("Content-Type", "application/json");
            res.status(200).send(JSON.stringify(rows2[0]));
          }
        });
      }
    }
  );
};
exports.delete = (req, res) => {
  if(!req.params.id){
    res.status(500).send({message:"Provide an id is your request params"})
  }
  connection.query(`SELECT * FROM user WHERE id=${req.params.id}`, (err, rows, fields) => {
    if (err) {
      res.status(500).send({message: "There was an error in your request"});
    }
    else{
      connection.query(
        `delete from user where id=${req.params.id}`,
        (err2, rows2, fields) => {
          if (err2) {
            res.status(500).send({message: "User deletion error"});
          }
          else{
            res.setHeader("Content-Type", "application/json");
            res.status(200).send(JSON.stringify(rows[0]));
          }
          
        }
      );
      
    }
  });  
};
