if (!window.WebSocket) {
    document.body.innerHTML = 'WebSocket is not supported in this browser.';
}
const host = document.location.host,
    ws = host.indexOf('localhost') !== -1 ? 'ws' : 'wss',
    socket = new WebSocket(ws + '://' + host),
    helper = require('./event-handler')(socket),
    clientsHelper = require('./chat-clients');

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


