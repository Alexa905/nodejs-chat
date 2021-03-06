/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*************************************!*\
  !*** ./public/scripts/ws-client.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	if (!window.WebSocket) {
	    document.body.innerHTML = 'WebSocket is not supported in this browser.';
	}
	var host = document.location.host,
	    ws = host.indexOf('localhost') !== -1 ? 'ws' : 'wss',
	    socket = new WebSocket(ws + '://' + host),
	    helper = __webpack_require__(/*! ./event-handler */ 1)(socket),
	    clientsHelper = __webpack_require__(/*! ./chat-clients */ 5);
	
	helper.init();
	
	socket.onopen = function () {
	    var currentUser = helper.getCurrentUser();
	    currentUser ? helper.connectUser(currentUser) : clientsHelper.showClients();
	};
	socket.onerror = function (e) {
	    socket.send('error' + e);
	};
	socket.onclose = function () {
	    if (clientsHelper.isClientOnline(helper.getCurrentUser())) {
	        helper.disconnectUser();
	    }
	};
	socket.onmessage = function (event) {
	    helper.handleMessage(event);
	};

/***/ },
/* 1 */
/*!*****************************************!*\
  !*** ./public/scripts/event-handler.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var domHelper = __webpack_require__(/*! ./dom-helper */ 2),
	    historyHelper = __webpack_require__(/*! ./history-storage */ 3),
	    clientsHelper = __webpack_require__(/*! ./chat-clients */ 5),
	    input = document.getElementById("messageTxt"),
	    sendBtn = document.getElementById("sendMessage"),
	    signUpBtn = document.getElementById("signUpBtn"),
	    logInBtn = document.getElementById("logInBtn"),
	    logOutBtn = document.getElementById("logOutBtn"),
	    googleBtn = document.getElementById("google-signin"),
	    joinBtn = document.getElementById("join-button"),
	    imgElement = document.getElementById("imgElem"),
	    userAvatar = document.getElementById("avatarImg"),
	    snackbarContainer = document.querySelector('#snackbar-message'),
	    removeUserBtn = document.getElementById("removeUser");
	
	module.exports = function (socket) {
	    var messageHelper = __webpack_require__(/*! ./message-handler */ 6)(socket);
	    var isTyping = false;
	    return {
	        getCurrentUser: function getCurrentUser() {
	            return sessionStorage.getItem('currentUser');
	        },
	        setCurrentUser: function setCurrentUser() {
	            var username = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	
	            document.getElementById('currentUser').innerHTML = username;
	            sessionStorage.setItem('currentUser', username);
	        },
	        init: function init() {
	            var _this = this;
	
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
	                xhr.onload = function () {
	                    console.log('Signed in as: ' + xhr.responseText);
	                };
	                xhr.send('idtoken=' + id_token);
	            }
	
	            imgElement.addEventListener("change", this.handleImages, false);
	            userAvatar.addEventListener("change", this.changeAvatar, false);
	            logInBtn.addEventListener('click', function (e) {
	                e.preventDefault();
	                _this.logIn();
	            }, false);
	            sendBtn.addEventListener('click', function () {
	                messageHelper.submitMessage();
	            }, false);
	            signUpBtn.addEventListener('click', function (e) {
	                e.preventDefault();
	                _this.signUp();
	            }, false);
	            joinBtn.addEventListener('click', function () {
	                var modal = document.getElementById('openModal');
	                modal.classList.add('opened');
	            }, false);
	            logOutBtn.addEventListener('click', function () {
	                _this.disconnectUser();
	            }, false);
	            removeUserBtn.addEventListener('click', function () {
	                _this.removeUser();
	            }, false);
	            input.addEventListener("keyup", function (e) {
	                if ( /*e.ctrlKey &&*/e.keyCode == 13) {
	                    messageHelper.submitMessage();
	                    e.preventDefault();
	                } else {
	                    var currentUser = _this.getCurrentUser();
	                    var msg = messageHelper.createMessage('typing', currentUser + ' is typing ...', 'admin');
	                    if (!isTyping) {
	                        isTyping = true;
	                        setTimeout(function () {
	                            socket.send(JSON.stringify(msg));
	                        }, 200);
	                    } else {
	                        return false;
	                    }
	                }
	            }, false);
	        },
	        handleMessage: function handleMessage(event) {
	            var incomingMessage = JSON.parse(event.data);
	            switch (incomingMessage.type) {
	                case 'typing':
	                    var type = document.getElementById("type-status");
	                    type.innerHTML = incomingMessage.text;
	                    window.setTimeout(function () {
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
	                    break;
	            }
	        },
	        signUp: function signUp() {
	            var _this2 = this;
	
	            var form = document.forms['signUpForm'];
	            var nickname = form.elements["signupUser"].value;
	            var password = form.elements["signupPassword"].value;
	            if (nickname) {
	                signUpBtn.setAttribute('disabled', 'true');
	                clientsHelper.isClientExists(nickname).then(function (isClientNew) {
	                    if (isClientNew) {
	                        clientsHelper.createClient({ nickname: nickname, password: password }).then(function () {
	                            _this2.connectUser(nickname);
	                            signUpBtn.setAttribute('disabled', 'false');
	                        });
	                    } else {
	                        _this2.showSnackbarMessage('nickname ' + nickname + ' already exists. Please choose another name', 5000);
	                        signUpBtn.setAttribute('disabled', 'false');
	                    }
	                });
	            } else {
	                this.showSnackbarMessage('Please choose the name');
	            }
	        },
	        logIn: function logIn() {
	            var _this3 = this;
	
	            var form = document.forms['logInForm'];
	            var nickname = form.elements["loginUser"].value;
	            var password = form.elements["loginPassword"].value;
	            if (nickname) {
	                clientsHelper.isClientAuthorized(nickname, password).then(function (isClientAuthorized) {
	                    if (isClientAuthorized) {
	                        _this3.connectUser(nickname);
	                    } else {
	                        _this3.showSnackbarMessage('Nickname or password is wrong. Please try again ir sign in with Google');
	                    }
	                });
	            } else {
	                this.showSnackbarMessage('Please enter username');
	            }
	        },
	        showSnackbarMessage: function showSnackbarMessage(text, timeoutMs) {
	            if (text) {
	                var data = {
	                    message: text,
	                    timeout: timeoutMs || 2000,
	                    actionText: ''
	                };
	                snackbarContainer.MaterialSnackbar && snackbarContainer.MaterialSnackbar.showSnackbar(data);
	            }
	        },
	        removeUser: function removeUser() {
	            var _this4 = this;
	
	            var user = sessionStorage.getItem('currentUser');
	            var confirmation = confirm('\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u0440\u044B \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ' + user + '?');
	            if (confirmation) {
	                clientsHelper.removeClient().then(function () {
	                    _this4.disconnectUser(user);
	                    _this4.showSnackbarMessage('User ' + user + ' has been removed');
	                });
	            }
	        },
	        connectUser: function connectUser(username) {
	            this.showSnackbarMessage('Welcome to chat, ' + username + '!');
	            domHelper.unlock();
	            historyHelper.showHistory();
	            this.setCurrentUser(username);
	            var msg = messageHelper.createMessage('join', username + ' joined to chat', 'admin', username);
	            socket.send(JSON.stringify(msg));
	            setTimeout(function () {
	                historyHelper.updateHistory(msg);
	            }, 1000);
	        },
	        disconnectUser: function disconnectUser(username) {
	            var user = username || this.getCurrentUser();
	            var msg = messageHelper.createMessage('leave', user + ' disconnected', 'admin', user);
	            historyHelper.updateHistory(msg);
	            socket.send(JSON.stringify(msg));
	            this.setCurrentUser('');
	            domHelper.lock();
	            /*            var auth2 = gapi.auth2.getAuthInstance();
	             auth2.signOut().then(function () {
	             console.log('User signed out.');
	             });*/
	        },
	        changeAvatar: function changeAvatar() {
	            var file = this.files && this.files[0];
	            var reader = new FileReader();
	            reader.addEventListener("load", function () {
	                var user = sessionStorage.getItem('currentUser');
	                var msg = messageHelper.createMessage('avatar', reader.result, 'admin', user);
	                socket.send(JSON.stringify(msg));
	                var msgAdmin = messageHelper.createMessage('message', 'User ' + user + ' changed avatar', 'admin', user);
	                socket.send(JSON.stringify(msgAdmin));
	                historyHelper.updateHistory(msgAdmin);
	                this.showSnackbarMessage('Your avatar has been changed');
	            });
	            if (file) {
	                reader.readAsDataURL(file);
	            }
	        },
	        handleImages: function handleImages() {
	            var file = this.files && this.files[0];
	            var reader = new FileReader();
	            reader.addEventListener("load", function () {
	                var user = sessionStorage.getItem('currentUser');
	                var msg = messageHelper.createMessage('image', reader.result, user);
	                historyHelper.updateHistory(msg);
	                socket.send(JSON.stringify(msg));
	            }, false);
	            if (file) {
	                reader.readAsDataURL(file);
	            }
	        }
	    };
	};

/***/ },
/* 2 */
/*!**************************************!*\
  !*** ./public/scripts/dom-helper.js ***!
  \**************************************/
/***/ function(module, exports) {

	"use strict";
	
	var input = document.getElementById("messageTxt"),
	    sendBtn = document.getElementById("sendMessage"),
	    signUpBtn = document.getElementById("signUpBtn"),
	    logInBtn = document.getElementById("logInBtn"),
	    logOutBtn = document.getElementById("logOutBtn"),
	    userAvatar = document.getElementById("avatarImg"),
	    msgsBlock = document.getElementById('messages'),
	    chat = document.getElementById('nodejs-chat'),
	    offlineImgSrc = 'images/offline.png',
	    defaultImgSrc = 'images/face.png';
	
	module.exports = {
	    createClient: function createClient(msg) {
	        var currentUser = sessionStorage.getItem('currentUser');
	        var fragment = document.createDocumentFragment();
	        var messageElem = fragment.appendChild(document.createElement('li'));
	        var img = messageElem.appendChild(document.createElement('img'));
	        img.setAttribute('title', msg.location ? msg.location : '');
	        var info = messageElem.appendChild(document.createElement('div'));
	        var user = info.appendChild(document.createElement('div'));
	        var status = info.appendChild(document.createElement('div'));
	        var statusText = msg.online ? 'online' : 'offline';
	        status.appendChild(document.createTextNode(statusText));
	        user.appendChild(document.createTextNode(msg.name));
	        info.className = "info";
	        user.className = "user";
	        status.className = msg.online ? "status on" : "status off";
	        var imgSrc = msg.avatar ? msg.avatar.replace(/ /ig, '+') : defaultImgSrc;
	        img.setAttribute('src', imgSrc);
	        img.setAttribute('width', '50');
	        img.setAttribute('height', '50');
	        if (msg.name === currentUser) {
	            user.classList.add('currentUser');
	        }
	        document.getElementById('clients').appendChild(fragment);
	    },
	    updateClientStatus: function updateClientStatus(msg) {
	        var clientsInfo = document.querySelectorAll('#clients .info');
	        var statusText = msg.online ? 'online' : 'offline';
	        [].forEach.call(clientsInfo, function (el) {
	            if (el.querySelector('.user').innerHTML === msg.name) {
	                var status = el.querySelector('.status');
	                status.className = msg.online ? "status on" : "status off";
	                status.innerHTML = statusText;
	            }
	        });
	    },
	    addMessage: function addMessage(msg) {
	        var fragment = document.createDocumentFragment();
	        var messageElem = fragment.appendChild(document.createElement('li'));
	        var messageInfo = messageElem.appendChild(document.createElement('div'));
	        var messageText = messageElem.appendChild(document.createElement('div'));
	        if (msg.type === 'image') {
	            var img = document.createElement('img');
	            var imgSrc = msg.text.replace(/ /ig, '+'); // fix base64 format after saving in MongoLab
	            img.setAttribute('src', imgSrc);
	            img.setAttribute('width', '50');
	            img.setAttribute('height', '50');
	            messageText.appendChild(img);
	        } else {
	            messageText.appendChild(document.createTextNode(msg.text));
	        }
	        var messageInfoName = messageInfo.appendChild(document.createElement('span'));
	        var messageInfoTime = messageInfo.appendChild(document.createElement('span'));
	        messageElem.className = "i";
	        messageInfo.className = "head";
	        messageText.className = "message";
	        messageInfoTime.className = "time";
	        messageInfoName.className = "name";
	
	        messageInfoTime.appendChild(document.createTextNode(msg.date));
	        messageInfoName.appendChild(document.createTextNode(msg.author));
	        if (msg.author === 'admin') {
	            messageElem.classList.add('admin');
	        }
	        if (sessionStorage.getItem('currentUser') === msg.author) {
	            messageElem.classList.add('currentUser');
	        }
	        return fragment;
	    },
	    unlock: function unlock() {
	        input.setAttribute('placeholder', 'Type the message here');
	        userAvatar.removeAttribute('disabled');
	        input.removeAttribute('disabled');
	        sendBtn.removeAttribute('disabled');
	        msgsBlock.removeAttribute('disabled');
	        chat.classList.toggle('locked');
	    },
	    lock: function lock() {
	        input.value = '';
	        input.setAttribute('placeholder', 'Please Sign Up or Log In');
	        chat.classList.toggle('locked');
	        userAvatar.setAttribute('disabled', 'disabled');
	        input.setAttribute('disabled', 'disabled');
	        sendBtn.setAttribute('disabled', 'disabled');
	        msgsBlock.innerHTML = '';
	        msgsBlock.setAttribute('disabled', 'disabled');
	        document.getElementById('currentUser').innerHTML = '';
	        document.getElementById('avatar').src = offlineImgSrc;
	    }
	};

/***/ },
/* 3 */
/*!*******************************************!*\
  !*** ./public/scripts/history-storage.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var domHelper = __webpack_require__(/*! ./dom-helper */ 2),
	    requestHelper = __webpack_require__(/*! ./http-request */ 4);
	
	module.exports = {
	    getHistory: function getHistory() {
	        return requestHelper.request('/messages', 'GET').then(function (data) {
	            return JSON.parse(data);
	        });
	    },
	    updateHistory: function updateHistory(msg) {
	        var time = new Date(msg.date);
	        var dateStr = time.toLocaleDateString('en-US');
	        var timeStr = time.toLocaleTimeString();
	        msg.date = dateStr + '  ' + timeStr;
	        return requestHelper.request('/messages', 'POST', msg).then(function () {
	            console.log('History POST message');
	        });
	    },
	    showHistory: function showHistory() {
	        var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;
	
	        this.getHistory().then(function (messages) {
	            var msgBlock = document.getElementById('messages');
	            msgBlock.style.display = 'block';
	            for (var i = messages.length; i >= messages.length - length; i--) {
	                var msg = messages[i];
	                if (msg) {
	                    var messageElem = domHelper.addMessage(msg);
	                    msgBlock.insertBefore(messageElem, msgBlock.firstChild);
	                }
	            }
	            var scrollArea = document.getElementById('messages');
	            scrollArea.scrollTop = scrollArea.scrollHeight;
	        });
	    }
	};

/***/ },
/* 4 */
/*!****************************************!*\
  !*** ./public/scripts/http-request.js ***!
  \****************************************/
/***/ function(module, exports) {

	'use strict';
	
	module.exports = {
	    request: function request(url, method, data, type) {
	        var _this = this;
	
	        return new Promise(function (resolve, reject) {
	            var req = new XMLHttpRequest();
	            req.open(method, url);
	            req.onload = function () {
	                return req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
	            };
	            req.onerror = function (e) {
	                return reject(Error('Network Error: ' + e));
	            };
	            if (method = 'POST') {
	                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	            }
	            if (type) {
	                req.setRequestHeader('Content-Type', 'application/json');
	            }
	            req.send(_this.setParams(data));
	        });
	    },
	    setParams: function setParams(object) {
	        var encodedString = '';
	        for (var prop in object) {
	            if (object.hasOwnProperty(prop)) {
	                if (encodedString.length > 0) {
	                    encodedString += '&';
	                }
	                encodedString += encodeURI(prop + '=' + object[prop]);
	            }
	        }
	        return encodedString;
	    }
	};

/***/ },
/* 5 */
/*!****************************************!*\
  !*** ./public/scripts/chat-clients.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var domHelper = __webpack_require__(/*! ./dom-helper */ 2),
	    requestHelper = __webpack_require__(/*! ./http-request */ 4);
	module.exports = {
	    getClients: function getClients() {
	        return requestHelper.request('/clients', 'GET').then(function (data) {
	            return JSON.parse(data);
	        });
	    },
	    isClientOnline: function isClientOnline(username) {
	        return this.getClients().then(function (clients) {
	            return clients[username].online;
	        });
	    },
	    showClients: function showClients() {
	        document.getElementById('clients').innerHTML = '';
	        this.getClients().then(function (clients) {
	            for (var key in clients) {
	                domHelper.createClient(clients[key]);
	            }
	        });
	    },
	    isClientExists: function isClientExists(username) {
	        return this.getClients().then(function (clients) {
	            return !clients[username];
	        });
	    },
	    isClientAuthorized: function isClientAuthorized(username, password) {
	        return this.getClients().then(function (clients) {
	            return clients[username] && clients[username].password === password;
	        });
	    },
	    connectClient: function connectClient(username) {
	        var currentUser = sessionStorage.getItem('currentUser');
	        var updateData = {
	            online: true,
	            name: username
	        };
	        this.updateClient(updateData);
	        username && currentUser === username && this.getClients().then(function (clients) {
	            document.getElementById('avatar').src = clients[username].avatar.replace(/ /ig, '+');
	        });
	    },
	    disconnectClient: function disconnectClient(username) {
	        this.updateClient({
	            online: false,
	            name: username
	        });
	    },
	    updateClient: function updateClient(data) {
	        var _this = this;
	
	        requestHelper.request('/clients', 'PUT', data).then(function () {
	            _this.showClients();
	            //domHelper.updateClientStatus(data);
	        });
	    },
	    removeClient: function removeClient() {
	        var username = sessionStorage.getItem('currentUser');
	        return requestHelper.request('/clients', 'DELETE', { username: username }).then(function () {});
	    },
	    setClientAvatar: function setClientAvatar(msg) {
	        var username = sessionStorage.getItem('currentUser');
	        if (username === msg.username) {
	            document.getElementById('avatar').src = msg.text;
	        }
	        this.updateClient({
	            avatar: msg.text,
	            name: msg.username
	        });
	    },
	    createClient: function createClient(currentUser) {
	        return requestHelper.request('http://ip-api.com/json', 'GET').then(function (data) {
	            if (data) {
	                data = JSON.parse(data);
	                currentUser.location = data.country;
	            }
	            return requestHelper.request('/clients', 'POST', currentUser).then(function () {
	                alert('User ' + currentUser.nickname + ' has been added to chat');
	            });
	        });
	    }
	};

/***/ },
/* 6 */
/*!*******************************************!*\
  !*** ./public/scripts/message-handler.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var domHelper = __webpack_require__(/*! ./dom-helper */ 2),
	    historyHelper = __webpack_require__(/*! ./history-storage */ 3),
	    input = document.getElementById("messageTxt");
	
	module.exports = function (socket) {
	    return {
	        createMessage: function createMessage(type, text, author, username) {
	            return { type: type, text: text, author: author, date: Date.now(), username: username };
	        },
	        showMessage: function showMessage(msg) {
	            var time = new Date(msg.date);
	            var dateStr = time.toLocaleDateString('en-US');
	            var timeStr = time.toLocaleTimeString();
	            msg.date = dateStr + '  ' + timeStr;
	            var messageElem = domHelper.addMessage(msg);
	            if (!document.getElementById('nodejs-chat').classList.contains('locked')) {
	                var scrollArea = document.getElementById('messages');
	                scrollArea.appendChild(messageElem);
	                scrollArea.scrollTop = scrollArea.scrollHeight;
	            }
	        },
	        submitMessage: function submitMessage() {
	            var value = input.value;
	            if (!value) {
	                return;
	            }
	            var user = sessionStorage.getItem('currentUser');
	            var msg = this.createMessage('message', value, user);
	            historyHelper.updateHistory(msg);
	            socket.send(JSON.stringify(msg));
	            input.value = '';
	            this.submitBotMessage();
	        },
	        submitBotMessage: function submitBotMessage() {
	            var text = this.botMsgs[Math.floor(Math.random() * this.botMsgs.length)];
	            var msg = this.createMessage('message', text, 'Lola');
	            var msg2 = this.createMessage('typing', 'Lola is typing ...', 'admin');
	            setTimeout(function () {
	                socket.send(JSON.stringify(msg2));
	            }, 500);
	            setTimeout(function () {
	                socket.send(JSON.stringify(msg));
	                historyHelper.updateHistory(msg);
	            }, 3000);
	        },
	
	        botMsgs: ["Добро пожаловать в наш чатик!", "Я счастлива!", "Вот это новость", "А расскажи о себе!", "Lol", "Помни, чай нужно пить с малиновым вареньем!", "Je parle francais tres bien, tu peux le faire", "А мы тут плюшками балуемся...", "Да ну это все...Я наверное пойду.", "Не уходи, мы же тебя любим!"]
	    };
	};

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map