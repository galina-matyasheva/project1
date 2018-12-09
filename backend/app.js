var express = require('express');
var passport = require('passport');

var app = express();

server = app.listen(8080, function(){
    console.log('server is running on port 8080')
});

var mysql = require('mysql');

var socket = require('socket.io');
io = socket(server);
io.on('connection', (socket) => {
    console.log(socket.id);
});

var GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID = '131291980996-c2ahcovtsfgp9f7j7ntd8ldhreq38n1d.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'J9UDR9W7fKHikzxnWsShezxd';


passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://www.example.com/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
});

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on('SEND_MESSAGE', function(data){
        //this.setState({messages: [...this.state.messages, data]});
        if(data.author) {
            //state.messages.push(data);
            addMessageToDb(data, () =>{
                getMessagesFromDb((value)=>io.emit('RECEIVE_HISTORY', value));//отослать всем клиентам историю сообщений
            } );
        }else {
            getMessagesFromDb((value) => io.emit('RECEIVE_HISTORY', value));//отослать всем клиентам историю сообщений
        }
    })
});


app.post('/login',
    passport.authenticate('google'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        res.redirect('/users/' + req.user.username);
    });

function createConnection(){
    return mysql.createConnection({
        host: "localhost",
        user: "chatdb_user",
        password: "12345",
        database: "chatdb"
    });
}

function addMessageToDb(data, func){

    let message = data.message;
    let author = data.author;

    var con = createConnection();

    con.connect(function(err) {
        if (err) console.log(err);
        console.log("Connected!");
        const sql = `insert into messages(message, author) values('${message}','${author}')`;
        console.log(sql);
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result);
            func();
        });
    });

}


function getMessagesFromDb(func){
    var con = createConnection();
    con.connect(function(err) {
        if (err) console.log(err);
        const sql = 'select * from messages';
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result);
            func(result);
        });
    });
}


function createChat(name, userIds, func){
    var con = createConnection();
    con.connect(function(err) {
        if (err) console.log(err);
        const sql = `insert into chat(name) values(${name}')`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result);
            //TODO: get chatId
            for(let userId of userIds) {
                const sql = `insert into chats_users_relation(chat_id,user_id) values(${chatId},${userId}')`;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Result: " + result);
                    func(result);
                });
            }
        });


    });
}