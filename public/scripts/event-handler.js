const domHelper = require('./dom-helper'),
    historyHelper = require('./history-storage'),
    clientsHelper = require('./chat-clients'),
    input = document.getElementById("messageTxt"),
    sendBtn = document.getElementById("sendMessage"),
    signUpBtn = document.getElementById("signUpBtn"),
    logInBtn = document.getElementById("logInBtn"),
    logOutBtn = document.getElementById("logOutBtn"),
    googleBtn = document.getElementById("google-signin"),
    imgElement = document.getElementById("imgElem"),
    userAvatar = document.getElementById("avatarImg"),
    removeUserBtn = document.getElementById("removeUser");

module.exports = function (socket) {
    const messageHelper = require('./message-handler')(socket);
    let isTyping = false;
    return {
        getCurrentUser () {
            return sessionStorage.getItem('currentUser');
        },
        setCurrentUser (username = '') {
            document.getElementById('currentUser').innerHTML = username;
            sessionStorage.setItem('currentUser', username);
        },
        init () {
            function onGoogleSignIn(googleUser) {
                var profile = googleUser.getBasicProfile();
                console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
                console.log('Name: ' + profile.getName());
                console.log('Image URL: ' + profile.getImageUrl());
                console.log('Email: ' + profile.getEmail());
                var id_token = googleUser.getAuthResponse().id_token;
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/tokensignin');
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.onload = function() {
                    console.log('Signed in as: ' + xhr.responseText);
                };
                xhr.send('idtoken=' + id_token);
            }
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
                        clientsHelper.createClient({nickname, password}).then(()=> {
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
            domHelper.unlock();
            historyHelper.showHistory();
            this.setCurrentUser(username);
            var msg = messageHelper.createMessage('join', `${username} joined to chat`, 'admin', username);
            socket.send(JSON.stringify(msg));
            setTimeout(()=> {
                historyHelper.updateHistory(msg);
            }, 1000)
        },
        disconnectUser (username) {
            var user = username || this.getCurrentUser();
            var msg = messageHelper.createMessage('leave', `${user} disconnected`, 'admin', user);
            historyHelper.updateHistory(msg);
            socket.send(JSON.stringify(msg));
            this.setCurrentUser('');
            domHelper.lock();
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
            });

        },
        changeAvatar (){
            var file = this.files && this.files[0];
            var reader = new FileReader();
            reader.addEventListener("load", function () {
                var user = sessionStorage.getItem('currentUser');
                var msg = messageHelper.createMessage('avatar', reader.result, 'admin', user);
                socket.send(JSON.stringify(msg));
                var msgAdmin = messageHelper.createMessage('message', `User ${user} changed avatar`, 'admin', user);
                socket.send(JSON.stringify(msgAdmin));
                historyHelper.updateHistory(msgAdmin);
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
                historyHelper.updateHistory(msg);
                socket.send(JSON.stringify(msg));
            }, false);
            if (file) {
                reader.readAsDataURL(file)
            }
        }
    }
};