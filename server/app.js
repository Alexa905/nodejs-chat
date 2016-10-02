var server = require('http').createServer(),
    url = require('url'),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({server: server}),
    express = require('express'),
    app = express(),
    port = process.env.PORT || 3001,
    clientId = 0,
    clientsOnline = {},
    allClients = {},
    allMessages = [],
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    User = require('./models/User'),
    Message = require('./models/Message');

mongoose.connect('mongodb://x:y@ds029635.mlab.com:29635/nodejs-chat');
mongoose.Promise = global.Promise;

app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/../public/index.html');
});

app.put('/clients', function (req, res) {
    User.findOneAndUpdate({name: req.body.name}, {$set: req.body}, {new: true}, (err, result)=> {
        if (err) return res.send(err)
        res.send(result)
    })
});

app.delete('/clients', function (req, res) {
    User.findOneAndRemove({name: req.body.username}, function (err, result) {
        if (err) throw err;
        console.log('User deleted!');
        res.send(result)
    });
    delete allClients[req.body.username];
});

function transformResponse(data) {
    data.sort((a, b)=>(a.name.localeCompare(b.name))).forEach((user)=> {
        allClients[user.name] = user
    });
}

function sortObject(obj) {
    var sorted = {};
    Object.keys(obj).sort((a, b)=>(a.localeCompare(b))).forEach((key)=> {
        sorted[key] = obj[key]
    });
    return Object.assign({}, sorted);
}

app.get('/clients', (req, res) => {
    if (allClients && Object.keys(allClients).length) {
        res.statusCode = 200;
        res.send(JSON.stringify(allClients))
    } else {
        User.find({}, function (err, users) {
            if (err) throw err;
            res.statusCode = 200;
            transformResponse(users);
            res.send(JSON.stringify(allClients));
        });
    }
});

app.get('/messages', (req, res) => {
    if (allMessages && allMessages.length) {
        res.statusCode = 200;
        res.send(JSON.stringify(allMessages))
    } else {
        Message.find({}, function (err, messages) {
            if (err) throw err;
            res.statusCode = 200;
            Object.assign(allMessages, messages);
            res.send(JSON.stringify(messages));
        });
    }
});

app.post('/messages', (req, res) => {
    var msg = {
        type: req.body.type,
        text: req.body.text,
        date: req.body.date,
        author: req.body.author,
        username: req.body.username
    };
    var newMsg = new Message(msg);
    newMsg.save(function (err) {
        if (err) throw err;
        console.log('Message saved successfully!');
        allMessages.push(msg);
        res.redirect('/')
    });
});

app.post('/clients', (req, res) => {
    var user = {
        name: req.body.nickname,
        avatar: 'images/face.png',
        password: req.body.password
    };
    var newUser = new User(user);
    newUser.save(function (err) {
        if (err) throw err;
        console.log('User saved successfully!');
        user.online = true;
        allClients[user.name] = user;
        allClients = sortObject(allClients);
        res.redirect('/')
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
};

wss.on('connection', function connection(ws) {
    var thisId = ++clientId;
    var location = url.parse(ws.upgradeReq.url, true);
    console.log('new connection')
    // you might use location.query.access_token to authenticate or share sessions
    // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        var msg = JSON.parse(message);
        wss.broadcast(message);
        switch (msg.type) {
            case 'join':
                allClients[msg.username].online = true;
                clientsOnline[thisId] = msg.username;
                break;
            case 'leave':
                if (allClients[msg.username]) {
                    allClients[msg.username].online = false;
                }
                break;
            case 'avatar':
                if (allClients[msg.username]) {
                    allClients[msg.username].avatar = msg.text;
                }
                break;
            default:
                break
        }
    });

    ws.on('close', function (data) {
        var user = clientsOnline[thisId];
        if (user && allClients[user] && allClients[user].online) {
            allClients[user].online = false;
            var msg = {
                type: "leave",
                text: clientsOnline[thisId] + " disconnected",
                author: 'admin',
                date: Date.now(),
                username: clientsOnline[thisId]
            };
            wss.broadcast(JSON.stringify(msg));
        }
        ws.close();
    });

});

server.on('request', app);
server.listen(port, function () {
    console.log('Listening on ' + server.address().port);
});