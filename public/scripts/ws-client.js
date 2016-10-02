if (!window.WebSocket) {
    document.body.innerHTML = 'WebSocket is not supported in this browser.';
}
var host = process.env.NODE_ENV === 'production' ? 'nodejswschat.herokuapp.com' : 'localhost';
var socket = new WebSocket('ws://' + host + ':' + process.env.PORT);
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
    helper.disconnectUser();
};
socket.onmessage = (event) => {
    helper.handleMessage(event);

};


