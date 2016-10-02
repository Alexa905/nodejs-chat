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

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	if (!window.WebSocket) {
	    document.body.innerHTML = 'WebSocket is not supported in this browser.';
	}
	var host = process.env.NODE_ENV === 'production' ? 'nodejswschat.herokuapp.com' : 'localhost';
	var socket = new WebSocket('ws://' + host + ':3001');
	var helper = __webpack_require__(/*! ./event-handler */ 1)(socket);
	var clientsHelper = __webpack_require__(/*! ./clients */ 5)();
	
	helper.init();
	
	socket.onopen = function () {
	    var currentUser = helper.getCurrentUser();
	    currentUser ? helper.connectUser(currentUser) : clientsHelper.showClients();
	};
	socket.onerror = function (e) {
	    socket.send('error' + e);
	};
	socket.onclose = function () {
	    helper.disconnectUser();
	};
	socket.onmessage = function (event) {
	    helper.handleMessage(event);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./~/process/browser.js */ 7)))

/***/ },
/* 1 */
/*!*****************************************!*\
  !*** ./public/scripts/event-handler.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = function (socket) {
	    var domHelper = __webpack_require__(/*! ./dom */ 2)();
	    var historyHelper = __webpack_require__(/*! ./history */ 3)();
	    var clientsHelper = __webpack_require__(/*! ./clients */ 5)();
	    var messageHelper = __webpack_require__(/*! ./message */ 6)(socket);
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
	
	            imgElement.addEventListener("change", this.handleImages, false);
	            userAvatar.addEventListener("change", this.changeAvatar, false);
	            logInBtn.addEventListener('click', function () {
	                _this.logIn();
	            }, false);
	            sendBtn.addEventListener('click', function () {
	                messageHelper.submitMessage();
	            }, false);
	            signUpBtn.addEventListener('click', function () {
	                _this.signUp();
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
	            var user = this.getCurrentUser();
	            switch (incomingMessage.type) {
	                case 'typing':
	                    var type = document.getElementById("type-status");
	                    type.innerHTML = incomingMessage.text;
	                    window.setTimeout(function () {
	                        isTyping = false;
	                        type.innerHTML = '';
	                    }, 3000);
	                    break;
	                case 'avatar':
	                    clientsHelper.setClientAvatar(incomingMessage);
	                    var msg = messageHelper.createMessage('message', 'User ' + user + ' changed avatar', 'admin', user);
	                    socket.send(JSON.stringify(msg));
	                    break;
	                case 'leave':
	                    user && clientsHelper.isClientOnline(user).then(function (isClientOnline) {
	                        if (isClientOnline) {
	                            messageHelper.showMessage(incomingMessage);
	                        }
	                    });
	                    clientsHelper.showClients();
	                    break;
	                case 'join':
	                    user && clientsHelper.isClientOnline(user).then(function (isClientOnline) {
	                        if (isClientOnline) {
	                            messageHelper.showMessage(incomingMessage);
	                            clientsHelper.connectClient(incomingMessage.username);
	                        }
	                    });
	                    clientsHelper.showClients();
	                    break;
	                default:
	                    user && clientsHelper.isClientOnline(user).then(function (isClientOnline) {
	                        if (isClientOnline) {
	                            messageHelper.showMessage(incomingMessage);
	                        }
	                    });
	                    break;
	            }
	        },
	        signUp: function signUp() {
	            var _this2 = this;
	
	            var form = document.forms['signUpForm'];
	            var nickname = form.elements["signupUser"].value;
	            var password = form.elements["signupPassword"].value;
	            if (nickname) {
	                clientsHelper.isClientNew(nickname).then(function (isClientNew) {
	                    if (isClientNew) {
	                        clientsHelper.addClient({ nickname: nickname, password: password }).then(function () {
	                            _this2.connectUser(nickname);
	                        });
	                    } else {
	                        alert('nickname ' + nickname + ' already exists. Please choose another name');
	                    }
	                });
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
	                        alert('Nickname or password is wrong');
	                    }
	                });
	            }
	        },
	        removeUser: function removeUser() {
	            var _this4 = this;
	
	            var user = sessionStorage.getItem('currentUser');
	            var confirmation = confirm('\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u0440\u044B \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ' + user + '?');
	            if (confirmation) {
	                clientsHelper.removeClient().then(function () {
	                    _this4.disconnectUser(user);
	                });
	            }
	        },
	        connectUser: function connectUser(username) {
	            this.setCurrentUser(username);
	            var msg = messageHelper.createMessage('join', username + ' joined to chat', 'admin', username);
	            socket.send(JSON.stringify(msg));
	            domHelper.unlock();
	            historyHelper.showHistory();
	        },
	        disconnectUser: function disconnectUser(username) {
	            var user = username || this.getCurrentUser();
	            var msg = messageHelper.createMessage('leave', user + ' disconnected', 'admin', user);
	            socket.send(JSON.stringify(msg));
	            this.setCurrentUser('');
	            domHelper.lock();
	        },
	        changeAvatar: function changeAvatar() {
	            var file = this.files && this.files[0];
	            var reader = new FileReader();
	            reader.addEventListener("load", function () {
	                var user = sessionStorage.getItem('currentUser');
	                var msg = messageHelper.createMessage('avatar', reader.result, 'admin', user);
	                socket.send(JSON.stringify(msg));
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
/*!*******************************!*\
  !*** ./public/scripts/dom.js ***!
  \*******************************/
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (socket) {
	    var input = document.getElementById("messageTxt");
	    var sendBtn = document.getElementById("sendMessage");
	    var signUpBtn = document.getElementById("signUpBtn");
	    var logInBtn = document.getElementById("logInBtn");
	    var logOutBtn = document.getElementById("logOutBtn");
	    var userAvatar = document.getElementById("avatarImg");
	    var tabs = document.getElementById("tab-area");
	    var offlineImgSrc = 'images/offline.png';
	    var defaultImgSrc = 'images/face.png';
	    return {
	        createClient: function createClient(msg) {
	            var currentUser = sessionStorage.getItem('currentUser');
	            var fragment = document.createDocumentFragment();
	            var messageElem = fragment.appendChild(document.createElement('li'));
	            var img = messageElem.appendChild(document.createElement('img'));
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
	        addMessage: function addMessage(msg) {
	            var fragment = document.createDocumentFragment();
	            var messageElem = fragment.appendChild(document.createElement('li'));
	            var messageInfo = messageElem.appendChild(document.createElement('div'));
	            var messageText = messageElem.appendChild(document.createElement('div'));
	            if (msg.type === 'image') {
	                var img = document.createElement('img');
	                var imgSrc = msg.text.replace(/ /ig, '+');
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
	            tabs.style.display = 'none';
	            logOutBtn.style.display = 'block';
	        },
	        lock: function lock() {
	            input.value = '';
	            input.setAttribute('placeholder', 'Please Sign Up or Log In');
	            userAvatar.setAttribute('disabled', 'disabled');
	            input.setAttribute('disabled', 'disabled');
	            sendBtn.setAttribute('disabled', 'disabled');
	            tabs.style.display = 'block';
	            logOutBtn.style.display = 'none';
	            document.getElementById('messages').innerHTML = '';
	            document.getElementById('currentUser').innerHTML = '';
	            document.getElementById('avatar').src = offlineImgSrc;
	        }
	    };
	};

/***/ },
/* 3 */
/*!***********************************!*\
  !*** ./public/scripts/history.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = function () {
	    var domHelper = __webpack_require__(/*! ./dom */ 2)();
	    var requestHelper = __webpack_require__(/*! ./request */ 4)();
	    return {
	        getHistory: function getHistory() {
	            //return JSON.parse(localStorage.getItem('messageHistory')) || [];
	            return requestHelper.request('/messages', 'GET').then(function (data) {
	                return JSON.parse(data);
	            });
	        },
	        updateHistory: function updateHistory(msg) {
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
	            });
	        }
	    };
	};

/***/ },
/* 4 */
/*!***********************************!*\
  !*** ./public/scripts/request.js ***!
  \***********************************/
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function () {
	    return {
	        request: function request(url, method, data) {
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
	                req.send(_this.param(data));
	            });
	        },
	        param: function param(object) {
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
	};

/***/ },
/* 5 */
/*!***********************************!*\
  !*** ./public/scripts/clients.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = function () {
	    var domHelper = __webpack_require__(/*! ./dom */ 2)();
	    var requestHelper = __webpack_require__(/*! ./request */ 4)();
	    return {
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
	        isClientNew: function isClientNew(username) {
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
	            username && currentUser === username && this.getClients().then(function (clients) {
	                document.getElementById('avatar').src = clients[username].avatar.replace(/ /ig, '+');
	            });
	        },
	        removeClient: function removeClient() {
	            var username = sessionStorage.getItem('currentUser');
	            return requestHelper.request('/clients', 'DELETE', { username: username }).then(function () {});
	        },
	        setClientAvatar: function setClientAvatar(msg) {
	            var _this = this;
	
	            var username = sessionStorage.getItem('currentUser');
	            if (username === msg.username) {
	                document.getElementById('avatar').src = msg.text;
	            }
	            var update = {
	                avatar: msg.text,
	                name: msg.username
	            };
	            requestHelper.request('/clients', 'PUT', update).then(function () {
	                console.log('PUT message');
	                _this.showClients();
	            });
	        },
	        addClient: function addClient(currentUser) {
	            var _this2 = this;
	
	            return requestHelper.request('/clients', 'POST', currentUser).then(function () {
	                console.log('POST message');
	                _this2.showClients();
	            });
	        }
	    };
	};

/***/ },
/* 6 */
/*!***********************************!*\
  !*** ./public/scripts/message.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = function (socket) {
	    var domHelper = __webpack_require__(/*! ./dom */ 2)();
	    var historyHelper = __webpack_require__(/*! ./history */ 3)();
	    var input = document.getElementById("messageTxt");
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
	            historyHelper.updateHistory(msg);
	            var scrollArea = document.getElementById('messages');
	            scrollArea.appendChild(messageElem);
	            scrollArea.scrollTop = scrollArea.scrollHeight;
	        },
	        submitMessage: function submitMessage() {
	            var value = input.value;
	            if (!value) {
	                return;
	            }
	            var user = sessionStorage.getItem('currentUser');
	            var msg = this.createMessage('message', value, user);
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
	            }, 3000);
	        },
	
	        botMsgs: ["Добро пожаловать в наш чатик!", "Помни, чай нужно пить с малиновым вареньем!", "А мы тут плюшками балуемся...", "Да ну это все...", "Не уходи, мы же тебя любим!"]
	    };
	};

/***/ },
/* 7 */
/*!******************************!*\
  !*** ./~/process/browser.js ***!
  \******************************/
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map