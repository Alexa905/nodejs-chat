const domHelper = require('./dom-helper'),
    historyHelper = require('./history-storage'),
    input = document.getElementById("messageTxt");

module.exports = function (socket) {
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
            if (!document.getElementById('nodejs-chat').classList.contains('locked')) {
                var scrollArea = document.getElementById('messages');
                scrollArea.appendChild(messageElem);
                scrollArea.scrollTop = scrollArea.scrollHeight;
            }
        },
        submitMessage () {
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
        submitBotMessage (){
            var text = this.botMsgs[Math.floor(Math.random() * this.botMsgs.length)];
            var msg = this.createMessage('message', text, 'Lola');
            var msg2 = this.createMessage('typing', 'Lola is typing ...', 'admin');
            setTimeout(() => {
                socket.send(JSON.stringify(msg2));
            }, 500);
            setTimeout(()=> {
                socket.send(JSON.stringify(msg));
                historyHelper.updateHistory(msg);
            }, 3000)
        },
        botMsgs: ["Добро пожаловать в наш чатик!", "Я счастлива!", "Вот это новость", "А расскажи о себе!", "Lol", "Помни, чай нужно пить с малиновым вареньем!", "Je parle francais tres bien, tu peux le faire", "А мы тут плюшками балуемся...", "Да ну это все...Я наверное пойду.", "Не уходи, мы же тебя любим!"]
    }
};