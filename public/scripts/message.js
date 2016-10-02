module.exports = function (socket) {
    var domHelper = require('./dom')();
    var historyHelper = require('./history')();
    var input = document.getElementById("messageTxt");
    return {
        createMessage (type, text, author, username) {
            return {type, text, author, date: Date.now(), username}
        },
        showMessage (msg) {
            var time = new Date(msg.date);
            var dateStr = time.toLocaleDateString('en-US');
            var timeStr = time.toLocaleTimeString();
            msg.date = `${dateStr}  ${timeStr}`;
            var messageElem = domHelper.addMessage(msg);
            historyHelper.updateHistory(msg);
            var scrollArea = document.getElementById('messages');
            scrollArea.appendChild(messageElem);
            scrollArea.scrollTop = scrollArea.scrollHeight;
        },
        submitMessage () {
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
        submitBotMessage (){
            var text = this.botMsgs[Math.floor(Math.random() * this.botMsgs.length)];
            var msg = this.createMessage('message', text, 'Lola');
            var msg2 = this.createMessage('typing', 'Lola is typing ...', 'admin');
            setTimeout(() => {
                socket.send(JSON.stringify(msg2));
            }, 500);
            setTimeout(function () {
                socket.send(JSON.stringify(msg));
            }, 3000)
        },
        botMsgs: ["Добро пожаловать в наш чатик!", "Помни, чай нужно пить с малиновым вареньем!", "А мы тут плюшками балуемся...", "Да ну это все...", "Не уходи, мы же тебя любим!"]
    }
};