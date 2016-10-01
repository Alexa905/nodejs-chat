module.exports = function (socket) {
    var input = document.getElementById("messageTxt");
    var sendBtn = document.getElementById("sendMessage");
    var signUpBtn = document.getElementById("signUpBtn");
    var logInBtn = document.getElementById("logInBtn");
    var logOutBtn = document.getElementById("logOutBtn");
    var userAvatar = document.getElementById("avatarImg");
    var tabs = document.getElementById("tab-area");
    const offlineImgSrc = 'images/offline.png';
    const defaultImgSrc = 'images/face.png';
    return {
        createClient (msg) {
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
            var imgSrc = msg.avatar ? msg.avatar.replace(/ /ig,'+') : defaultImgSrc;
            img.setAttribute('src', imgSrc );
            img.setAttribute('width', '50');
            img.setAttribute('height', '50');
            if (msg.name === currentUser) {
                user.classList.add('currentUser');
            }
            document.getElementById('clients').appendChild(fragment);
        },
        addMessage (msg) {
            var fragment = document.createDocumentFragment();
            var messageElem = fragment.appendChild(document.createElement('li'));
            var messageInfo = messageElem.appendChild(document.createElement('div'));
            var messageText = messageElem.appendChild(document.createElement('div'));
            if (msg.type === 'image') {
                var img = document.createElement('img');
                var imgSrc = msg.text.replace(/ /ig,'+');
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
        unlock   () {
            input.setAttribute('placeholder', 'Type the message here');
            userAvatar.removeAttribute('disabled');
            input.removeAttribute('disabled');
            sendBtn.removeAttribute('disabled');
            tabs.style.display = 'none';
            logOutBtn.style.display = 'block';
        },
        lock   () {
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
    }
};