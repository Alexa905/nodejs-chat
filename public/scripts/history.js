module.exports = function () {
    var domHelper = require('./dom')();
    var requestHelper = require('./request')();
    return {
        getHistory () {
            //return JSON.parse(localStorage.getItem('messageHistory')) || [];
            return requestHelper.request('/messages', 'GET').then((data) => {
                return JSON.parse(data);
            });
        },
        updateHistory (msg) {
            return requestHelper.request('/messages', 'POST', msg).then(() => {
                console.log('History POST message')
            });
        },
        showHistory   (length = 20) {
            this.getHistory().then((messages) => {
                var msgBlock = document.getElementById('messages');
                msgBlock.style.display = 'block';
                for (var i = messages.length; i >= messages.length - length; i--) {
                    var msg = messages[i];
                    if (msg) {
                        var messageElem = domHelper.addMessage(msg);
                        msgBlock.insertBefore(messageElem, msgBlock.firstChild)
                    }
                }
            });

        }
    }
};