const connection = require("../mysql");

exports.post = (req, res) => {
  if (
    !req.body.start_time ||
    !req.body.end_time ||
    !req.body.data
  ) {
    res
      .status(500)
      .send({ message: "There was an error in the body of your post message" });
    return;
  }
  const queries = [];
  let sessionId = "";
  connection.query(
    `INSERT INTO session (start_time,end_time) VALUES ('${req.body.start_time}','${req.body.end_time}')`,
    (err, rows1, fields) => {
      if (err) {
        res.status(500).send({ message: "Session creation error",error: err });
        return;
      }
      sessionId = rows1.insertId;
      req.body.data.forEach(ele => {
        queries.push(`INSERT INTO data (session_id,session_user_id,time_stamp,roll,pitch,yaw,longitude,latitude,x,y,z)
      VALUES ('${sessionId}','${req.body.user_id}','${ele.timestamp}','${ele
          .gyro.roll}','${ele.gyro.pitch}','${ele.gyro.yaw}',
      '${ele.gps.longitude}','${ele.gps.latitude}','${ele.accel.x}','${ele.accel
          .y}','${ele.accel.y}')`);
      });
      connection.query(queries.join("; "), (err, rows, fields) => {
        if (err) {
          res.status(500).send({ message: "Data creation error",error: err });
          throw err;
        } else {
          res.status(200).send({ message: "Session/Data created successfully",
          id:sessionId });
        }
      });
    }
  );
};

exports.getByLocation = (req, res) => {
  if (
    !req.params.longitude ||
    !req.params.latitude ||
    !req.params.radius 
  ) {
    res
      .status(500)
      .send({ message: "Error: The body of your message needs longitude,latitude, and radius" });
    return;
  }


  connection.query(
    `SELECT * FROM session`,
    (err, rows1, fields) => {
      if (err) {
        res.status(500).send({ message: "Session access error" ,error: err});
      } else {
        let total = [];
        rows1.forEach((element, i) => {
          connection.query(
            `SELECT * FROM data WHERE session_id='${element.id}'`,
            (err, rows2, fields) => {              
              element = JSON.parse(JSON.stringify(element));
              rows2 = JSON.parse(JSON.stringify(rows2));
              let asdf = Object.assign({},element);
              asdf["data"] = rows2.reduce(function(acc, cur, i) {
                acc[i] = cur;
                return acc;
              }, {});

              if(rows2[0]){
                let testLongitude = rows2[0].longitude;
                let testLatitude = rows2[0].latitude;

                let {longitude,latitude} = req.params;

                testLongitude *= 0.0174533;
                testLatitude *= 0.0174533;
                longitude *= 0.0174533;
                latitude *= 0.0174533;

                const distance = 6371 * Math.acos(
                  Math.sin(testLatitude) * Math.sin(latitude)
                  + Math.cos(testLatitude) * Math.cos(latitude) * Math.cos(testLatitude - testLongitude))

                console.log(distance);
              }

              total.push(asdf);
              if (rows1.length - 1 === i) {
                //console.log(total);
                res.setHeader("Content-Type", "application/json");
                res.status(200).send(JSON.stringify(total));
              }
            }
          );
        });
      }
    }
  );
};

exports.getAll = (req, res) => {  
  connection.query(
    `SELECT * FROM session`,
    (err, rows1, fields) => {
      if (err) {
        res.status(500).send({ message: "User access error" ,error: err});
      } else {
        let total = [];
        rows1.forEach((element, i) => {
          connection.query(
            `SELECT * FROM data WHERE session_id='${element.id}'`,
            (err, rows2, fields) => {
              element = JSON.parse(JSON.stringify(element));
              rows2 = JSON.parse(JSON.stringify(rows2));
              
              let asdf = Object.assign({},element);
              asdf["data"] = rows2.reduce(function(acc, cur, i) {
                acc[i] = cur;
                return acc;
              }, {});
              total.push(asdf);
              if (rows1.length - 1 === i) {
                //console.log(total);
                res.setHeader("Content-Type", "application/json");
                res.status(200).send(JSON.stringify(total));
              }
            }
          );
        });
      }
    }
  );
  
};
exports.get = (req, res) => {
  if (!req.params.id) {
    res.status(500).send({ message: "Provide an id is your request params" });
  }
  connection.query(
    `SELECT * FROM session WHERE id='${req.params.id}'`,
    (err, rows1, fields) => {
      if (err) {
        res.status(500).send({ message: "Session access error" ,error: err});
      } 
      else {
        console.log(rows1);
        rows1.forEach(element => {
          connection.query(
            `SELECT * FROM data WHERE session_id='${req.params.id}'`,
            (err, rows2, fields) => {
              rows1 = JSON.parse(JSON.stringify(rows1));
              rows2 = JSON.parse(JSON.stringify(rows2));
           
              let asdf = Object.assign({},rows1[0]);
              asdf["data"] = rows2.reduce(function(acc, cur, i) {
                acc[i] = cur;
                return acc;
              }, {});
              res.setHeader("Content-Type", "application/json");
              res.status(200).send(JSON.stringify(asdf));
            
            }
          );
        });
      }
    }
  );
};

exports.delete = (req, res) => {
  if (!req.params.id) {
    res.status(500).send({ message: "Provide an id is your request params" });
  }
  const queries = [];
  queries.push(`delete from data where session_id=${req.params.id}`);
  queries.push(`delete from session where id=${req.params.id}`);

  connection.query(queries.join("; "), (err, rows, fields) => {
    if (err) {
      res.status(500).send({ message: "User deletion error" ,error: err});
      console.log(err);
    } else {
      console.log(err,rows,fields);
      res.status(200).send({ message: "User deleted successfully" });
    }
  });
};
