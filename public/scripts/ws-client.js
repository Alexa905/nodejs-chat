if (!window.WebSocket) {
    document.body.innerHTML = 'WebSocket is not supported in this browser.';
}
var host = document.location.host;
var ws = host.indexOf('localhost') !== -1 ? 'ws' : 'wss';
var socket = new WebSocket(ws + '://' + host);
var helper = require('./event-handler')(socket);
var clientsHelper = require('./clients')();

helper.init();

socket.onopen = () => {
    var currentUser = helper.getCurrentUser();
    currentUser ? helper.connectUser(currentUser) : clientsHelper.showClients();
};
socket.onerror = (e) => {
    socket.send('error' + e);
};
socket.onclose = () => {
    if (clientsHelper.isClientOnline(helper.getCurrentUser())) {
        helper.disconnectUser();
    }
};
socket.onmessage = (event) => {
    helper.handleMessage(event);

};


