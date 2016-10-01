module.exports = function () {
    var domHelper = require('./dom')();
    var requestHelper = require('./request')();
    return {
        getClients () {
            return requestHelper.request('/clients', 'GET').then((data) => {
                return JSON.parse(data);
            });
        },
        isClientOnline (username) {
            return this.getClients().then((clients) => {
                return clients[username].online;
            });
        },
        showClients () {
            document.getElementById('clients').innerHTML = '';
            this.getClients().then(function (clients) {
                for (var key in clients) {
                    domHelper.createClient(clients[key]);
                }
            })
        },
        isClientNew (username) {
            return this.getClients().then((clients) => {
                return !clients[username];
            })
        },
        isClientAuthorized(username, password) {
            return this.getClients().then((clients) => {
                return clients[username] && clients[username].password === password;
            })

        },
        connectClient(username){
            var currentUser = sessionStorage.getItem('currentUser');
            username && (currentUser === username) && this.getClients().then((clients) => {
                document.getElementById('avatar').src =clients[username].avatar.replace(/ /ig,'+')
            });

        },
        removeClient(){
            var username = sessionStorage.getItem('currentUser');
            return requestHelper.request('/clients', 'DELETE', {username}).then(() => {
            });
        },
        setClientAvatar(msg){
            var username = sessionStorage.getItem('currentUser');
            if(username === msg.username){
                document.getElementById('avatar').src = msg.text;
            }
            var update = {
                avatar: msg.text,
                name: msg.username
            }
            requestHelper.request('/clients', 'PUT', update).then(() => {
                console.log('PUT message')
                this.showClients();
            });
        },
        addClient(currentUser){
            return requestHelper.request('/clients', 'POST', currentUser).then(() => {
                console.log('POST message')
                this.showClients();
            });
        }
    }
};