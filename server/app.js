var server = require('http').createServer(),
    url = require('url'),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({server: server}),
    port = process.env.PORT || 3001,
    clientId = 0,
    clientsOnline = {},
    router = require('./router')();

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
        if(msg.type === 'join'){
            clientsOnline[thisId] = msg.username;
        }
        if(msg.type === 'leave'){
            delete clientsOnline[thisId];
        }
    });

    ws.on('close', function (data) {
        var user = clientsOnline[thisId];
        if (user) {
            var msg = {
                type: "leave",
                text: clientsOnline[thisId] + " disconnected",
                author: 'admin',
                date: Date.now(),
                username: clientsOnline[thisId]
            };
            wss.broadcast(JSON.stringify(msg));
            delete clientsOnline[thisId];
        }
    });

});

server.on('request', router);
server.listen(port, function () {
    console.log('Listening on ' + server.address().port);
});