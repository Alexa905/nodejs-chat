const domHelper = require('./dom-helper'),
    requestHelper = require('./http-request');
module.exports = {
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
        this.getClients().then((clients) => {
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
    createClient(currentUser){
        return requestHelper.request('http://ip-api.com/json', 'GET').then((data) => {
            if (data) {
                data = JSON.parse(data);
                currentUser.location = data.country;
            }
            return requestHelper.request('/clients', 'POST', currentUser).then(() => {
                alert(`User ${currentUser.nickname} has been added to chat`)
            });
        });
    }
};