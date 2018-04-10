const connection = require("../mysql");

exports.post = (req, res) => {
  if (
    !req.body.user_id ||
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
    `INSERT INTO session (user_id,start_time,end_time) VALUES ('${req.body
      .user_id}','${req.body.start_time}','${req.body.end_time}')`,
    (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: "Session creation error" });
        return;
      }
      sessionId = rows.insertId;
      req.body.data.forEach(ele => {
        queries.push(`INSERT INTO data (session_id,session_user_id,time_stamp,roll,pitch,yaw,longitude,latitude,x,y,z)
      VALUES ('${sessionId}','${req.body.user_id}','${ele.timestamp}','${ele
          .gyro.roll}','${ele.gyro.pitch}','${ele.gyro.yaw}',
      '${ele.gps.longitude}','${ele.gps.latitude}','${ele.accel.x}','${ele.accel
          .y}','${ele.accel.y}')`);
      });
      connection.query(queries.join("; "), (err, rows, fields) => {
        if (err) {
          res.status(500).send({ message: "Data creation error" });
          throw err;
        } else {
          res.status(200).send({ message: "Data created successfully" });
        }
      });
    }
  );
};

exports.getByUser = (req, res) => {
  if (!req.params.id) {
    res.status(500).send({ message: "Provide an id is your request params" });
  }
  connection.query(
    `SELECT * FROM session WHERE user_id='${req.params.id}'`,
    (err, rows1, fields) => {
      if (err) {
        res.status(500).send({ message: "User access error" });
      } else {
        let total = [];
        rows1.forEach((element, i) => {
          connection.query(
            `SELECT * FROM data WHERE session_id='${element.id}'`,
            (err, rows2, fields) => {
              element = JSON.parse(JSON.stringify(element));
              rows2 = JSON.parse(JSON.stringify(rows2));
              let asdf = {};
              asdf = { ...asdf, ...element };
              asdf["data"] = rows2.reduce(function(acc, cur, i) {
                acc[i] = cur;
                return acc;
              }, {});
              total.push(asdf);
              console.log(total);
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
        res.status(500).send({ message: "User access error" });
      } else {
        let total = [];
        rows1.forEach((element, i) => {
          connection.query(
            `SELECT * FROM data WHERE session_id='${element.id}'`,
            (err, rows2, fields) => {
              element = JSON.parse(JSON.stringify(element));
              rows2 = JSON.parse(JSON.stringify(rows2));
              let asdf = {};
              asdf = { ...asdf, ...element };
              asdf["data"] = rows2.reduce(function(acc, cur, i) {
                acc[i] = cur;
                return acc;
              }, {});
              total.push(asdf);
              console.log(total);
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
        res.status(500).send({ message: "User access error" });
      } else {
        console.log(rows1);
        rows1.forEach(element => {
          connection.query(
            `SELECT * FROM data WHERE session_id='${req.params.id}'`,
            (err, rows2, fields) => {
              rows1 = JSON.parse(JSON.stringify(rows1));
              rows2 = JSON.parse(JSON.stringify(rows2));
              let asdf = {};
              asdf = { ...asdf, ...rows1[0] };
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
      res.status(500).send({ message: "User deletion error" });
      console.log(err);
    } else {
      res.status(200).send({ message: "User deleted successfully" });
    }
  });
};
