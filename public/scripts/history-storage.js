const domHelper = require('./dom-helper'),
    requestHelper = require('./http-request');

module.exports = {
    getHistory () {
        return requestHelper.request('/messages', 'GET').then((data) => {
            return JSON.parse(data);
        });
    },
    updateHistory (msg) {
        var time = new Date(msg.date);
        var dateStr = time.toLocaleDateString('en-US');
        var timeStr = time.toLocaleTimeString();
        msg.date = `${dateStr}  ${timeStr}`;
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
            var scrollArea = document.getElementById('messages');
            scrollArea.scrollTop = scrollArea.scrollHeight;
        });

    }
};