if (!window.WebSocket) {
    document.body.innerHTML = 'WebSocket is not supported in this browser.';
}
var host = NODE_ENV === 'production' ? 'nodejswschat.herokuapp.com' : 'localhost';
var socket = new WebSocket('ws://' + host + ':3001');
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


