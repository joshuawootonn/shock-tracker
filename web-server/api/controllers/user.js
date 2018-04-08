const connection = require('../mysql');

exports.get = (req,res) => {
    connection.connect()
    connection.query('select * from user',function(err,rows,fields){
        if(err) throw err;
        
        console.log('nice')
        console.log(rows[0]);
    })
    connection.end();
}
exports.getAll = (req,res) => {
    connection.connect()
    connection.query('select * from user',(err,rows,fields)=>{
        if(err) throw err;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rows));
    })
    connection.end();
}
exports.post = (req,res) => {
    
}
exports.put = (req,res) => {
    
}
exports.delete = (req,res) => {
    
}