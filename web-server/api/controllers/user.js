const connection = require('../mysql');


exports.getAll = (req,res) => {
    connection.connect()
    connection.query(`SELECT * FROM user`,(err,rows,fields)=>{
        if(err) throw err;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rows));
    })
    connection.end();
}
exports.get = (req,res) => {
    connection.connect()    
    connection.query(`SELECT * FROM user WHERE id='${req.params.id}'`,(err,rows,fields)=>{
        if(err) throw err;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rows));
    })
    connection.end();
}

exports.post = (req,res) => {
    connection.connect();
    connection.query(`INSERT INTO user (create_time,update_time,user_name) VALUES (now(),now(),'${req.body.user_name}')`,(err,rows,fields)=>{
        if(err) throw err;        
    })
    connection.end();    
}
exports.put = (req,res) => {
    let update = ""
    Object.keys(req.body).forEach(function(key,index) {
        if(Object.keys(req.body).length!== index+1)
            update = ` ${update} ${key}="${req.body[key]}", `
        else 
            update = ` ${update} ${key}="${req.body[key]}" `
    });

    connection.connect();
    connection.query(`update user set ${update} where id=${req.params.id}`,(err,rows,fields)=>{
        if(err) throw err;        
    })
    connection.end(); 



}
exports.delete = (req,res) => {    
    connection.connect();
    connection.query(`delete from user where id='${req.params.id}'`,(err,rows,fields)=>{
        if(err) throw err;        
    })
    connection.end();     
}