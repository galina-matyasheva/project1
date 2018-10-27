var express = require('express');
var app = express();

server = app.listen(8080, function(){
    console.log('server is running on port 8080')
});

var mysql = require('mysql');



var state = { messages: []};
var socket = require('socket.io');
io = socket(server);
io.on('connection', (socket) => {
    console.log(socket.id);
});

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on('SEND_MESSAGE', function(data){
        //this.setState({messages: [...this.state.messages, data]});
        if(data.author) {
            //state.messages.push(data);
            addMessageToDb(data);
        }
        getMessagesFromDb((value)=>io.emit('RECEIVE_HISTORY', value));//отослать всем клиентам новое сообщение
    })
});

function addMessageToDb(data){

    let message = data.message;
    let author = data.author;
    var con = mysql.createConnection({
        host: "localhost",
        user: "chatdb_user",
        password: "12345",
        database: "chatdb"
    });
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        const sql = `insert into messages(message, author) values('${message}','${author}')`;
        console.log(sql);
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result);
        });
    });

}


function getMessagesFromDb(func){
    var con = mysql.createConnection({
        host: "localhost",
        user: "chatdb_user",
        password: "12345",
        database: "chatdb"
    });
    con.connect(function(err) {
        if (err) throw err;
        const sql = 'select * from messages';
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result);
            func(result);
        });
    });
}