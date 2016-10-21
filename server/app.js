var server = require('http').createServer(),
    url = require('url'),
    WebSocketServer = require('ws').Server,
    webSocketServer = new WebSocketServer({server: server}),
    port = process.env.PORT || 3001,
    User = require('./models/User'),
    router = require('./router')(),
    clientId = 0,
    clientsOnline = {};

webSocketServer.broadcast = function broadcast(data) {
    webSocketServer.clients.forEach(function each(client) {
        client.send(data);
    });
};
webSocketServer.on('connection', function connection(websocket) {
    var thisId = ++clientId;
    var location = url.parse(websocket.upgradeReq.url, true);
    console.log('new connection')
    // you might use location.query.access_token to authenticate or share sessions
    // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
    websocket
        .on('message', function incoming(message) {
            console.log('received: %s', message);
            var msg = JSON.parse(message);
            webSocketServer.broadcast(message);
            if (msg.type === 'join') {
                clientsOnline[thisId] = msg.username;
            }
            if (msg.type === 'leave') {
                delete clientsOnline[thisId];
            }
        })

        .on('close', function (data) {
            var user = clientsOnline[thisId];
            if (!user) {
                return;
            }
            var msg = {
                type: "leave",
                text: user + " disconnected",
                author: 'admin',
                date: Date.now(),
                username: user
            };
            webSocketServer.broadcast(JSON.stringify(msg));
            User.findOneAndUpdate({name: user}, {$set: {online: false}}, {new: true}, (err, result)=> {
                if (err) return err
                delete clientsOnline[thisId];
            });

        });

});

server.on('request', router);
server.listen(port, function () {
    console.log('Listening on ' + server.address().port);
});