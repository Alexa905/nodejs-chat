module.exports = function (socket) {
    var domHelper = require('./dom')();
    var historyHelper = require('./history')();
    var clientsHelper = require('./clients')();
    var messageHelper = require('./message')(socket);
    var input = document.getElementById("messageTxt");
    var sendBtn = document.getElementById("sendMessage");
    var signUpBtn = document.getElementById("signUpBtn");
    var logInBtn = document.getElementById("logInBtn");
    var logOutBtn = document.getElementById("logOutBtn");
    var imgElement = document.getElementById("imgElem");
    var userAvatar = document.getElementById("avatarImg");
    var removeUserBtn = document.getElementById("removeUser");
    var isTyping = false;
    return {
        getCurrentUser () {
            return sessionStorage.getItem('currentUser');
        },
        setCurrentUser (username = '') {
            document.getElementById('currentUser').innerHTML = username;
            sessionStorage.setItem('currentUser', username);
        },
        init () {
            imgElement.addEventListener("change", this.handleImages, false);
            userAvatar.addEventListener("change", this.changeAvatar, false);
            logInBtn.addEventListener('click', () => {
                this.logIn()
            }, false);
            sendBtn.addEventListener('click', () => {
                messageHelper.submitMessage()
            }, false);
            signUpBtn.addEventListener('click', () => {
                this.signUp()
            }, false);
            logOutBtn.addEventListener('click', () => {
                this.disconnectUser();
            }, false);
            removeUserBtn.addEventListener('click', () => {
                this.removeUser();
            }, false);
            input.addEventListener("keyup", (e) => {
                if (/*e.ctrlKey &&*/ e.keyCode == 13) {
                    messageHelper.submitMessage();
                    e.preventDefault()
                } else {
                    var currentUser = this.getCurrentUser();
                    var msg = messageHelper.createMessage('typing', `${currentUser} is typing ...`, 'admin');
                    if (!isTyping) {
                        isTyping = true;
                        setTimeout(() => {
                            socket.send(JSON.stringify(msg));

                        }, 200);
                    } else {
                        return false;
                    }
                }
            }, false);
        },
        handleMessage  (event){
            var incomingMessage = JSON.parse(event.data);
            switch (incomingMessage.type) {
                case 'typing':
                    var type = document.getElementById("type-status");
                    type.innerHTML = incomingMessage.text;
                    window.setTimeout(() => {
                        isTyping = false;
                        type.innerHTML = '';
                    }, 2500);
                    break;
                case 'join':
                    messageHelper.showMessage(incomingMessage);
                    clientsHelper.connectClient(incomingMessage.username);
                    break;
                case 'leave':
                    messageHelper.showMessage(incomingMessage);
                    clientsHelper.disconnectClient(incomingMessage.username);
                    break;
                case 'avatar':
                    clientsHelper.setClientAvatar(incomingMessage);
                    break;
                default:
                    messageHelper.showMessage(incomingMessage);
                    break
            }
        },
        signUp  () {
            var form = document.forms['signUpForm'];
            var nickname = form.elements["signupUser"].value;
            var password = form.elements["signupPassword"].value;
            if (nickname) {
                clientsHelper.isClientExists(nickname).then((isClientNew) => {
                    if (isClientNew) {
                        clientsHelper.addClient({nickname, password}).then(()=> {
                            this.connectUser(nickname);
                        });
                    } else {
                        alert('nickname ' + nickname + ' already exists. Please choose another name')
                    }
                })
            }
        },
        logIn () {
            var form = document.forms['logInForm'];
            var nickname = form.elements["loginUser"].value;
            var password = form.elements["loginPassword"].value;
            if (nickname) {
                clientsHelper.isClientAuthorized(nickname, password).then((isClientAuthorized) => {
                    if (isClientAuthorized) {
                        this.connectUser(nickname);
                    } else {
                        alert('Nickname or password is wrong')
                    }
                })
            }
        },
        removeUser(){
            var user = sessionStorage.getItem('currentUser');
            var confirmation = confirm(`Вы уверенры что хотите удалить пользователя ${user}?`);
            if (confirmation) {
                clientsHelper.removeClient().then(()=> {
                    this.disconnectUser(user);
                });
            }
        },
        connectUser (username) {
            this.setCurrentUser(username);
            clientsHelper.showClients();
            var msg = messageHelper.createMessage('join', `${username} joined to chat`, 'admin', username)
            socket.send(JSON.stringify(msg));
            domHelper.unlock();
            historyHelper.showHistory();
            historyHelper.updateHistory(msg);
        },
        disconnectUser (username) {
            var user = username || this.getCurrentUser();
            var msg = messageHelper.createMessage('leave', `${user} disconnected`, 'admin', user)
            historyHelper.updateHistory(msg);
            socket.send(JSON.stringify(msg));
            this.setCurrentUser('');
            domHelper.lock();
        },
        changeAvatar (){
            var file = this.files && this.files[0];
            var reader = new FileReader();
            reader.addEventListener("load", function () {
                var user = sessionStorage.getItem('currentUser');
                var msg = messageHelper.createMessage('avatar', reader.result, 'admin', user);
                historyHelper.updateHistory(msg);
                socket.send(JSON.stringify(msg));
                var msgAdmin = messageHelper.createMessage('message', `User ${user} changed avatar`, 'admin', user)
                socket.send(JSON.stringify(msgAdmin));
            });
            if (file) {
                reader.readAsDataURL(file)
            }
        },
        handleImages () {
            var file = this.files && this.files[0];
            var reader = new FileReader();
            reader.addEventListener("load", function () {
                var user = sessionStorage.getItem('currentUser');
                var msg = messageHelper.createMessage('image', reader.result, user);
                socket.send(JSON.stringify(msg));
            }, false);
            if (file) {
                reader.readAsDataURL(file)
            }
        }
    }
};