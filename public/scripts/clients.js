module.exports = function () {
    const domHelper = require('./dom')();
    const requestHelper = require('./request')();
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
                for (let key in clients) {
                    domHelper.createClient(clients[key]);
                }
            })
        },
        isClientExists (username) {
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
            var updateData = {
                online: true,
                name: username
            };
            this.updateClient(updateData);
            username && (currentUser === username) && this.getClients().then((clients) => {
                document.getElementById('avatar').src = clients[username].avatar.replace(/ /ig, '+')
            });
        },
        disconnectClient(username){
            this.updateClient({
                online: false,
                name: username
            })
        },
        updateClient(data){
            requestHelper.request('/clients', 'PUT', data).then(() => {
                this.showClients();
                //domHelper.updateClientStatus(data);
            });
        },
        removeClient(){
            var username = sessionStorage.getItem('currentUser');
            return requestHelper.request('/clients', 'DELETE', {username}).then(() => {
            });
        },
        setClientAvatar(msg){
            var username = sessionStorage.getItem('currentUser');
            if (username === msg.username) {
                document.getElementById('avatar').src = msg.text;
            }
            this.updateClient({
                avatar: msg.text,
                name: msg.username
            });
        },
        addClient(currentUser){
            return requestHelper.request('/clients', 'POST', currentUser).then(() => {
               // this.showClients();
            });
        }
    }
};