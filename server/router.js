const bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    express = require('express'),
    helper = require('./helper'),
    app = express(),
    User = require('./models/User'),
    Message = require('./models/Message');

module.exports = function () {
    mongoose.connect('mongodb://x:y@ds029635.mlab.com:29635/nodejs-chat');
    mongoose.Promise = global.Promise;

    app.use(express.static(__dirname + '/../public'));
    app.use(bodyParser.urlencoded({extended: true}));
    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/../public/index.html');
    });
    app.post('/tokensignin', function (req, res) {
        res.sendFile(__dirname + '/../public/index.html');
    });

    app.route('/clients')
        .get((req, res) => {
            User.find({}, function (err, users) {
                if (err) throw err;
                res.statusCode = 200;
                var response = helper.transformResponse(users);
                res.send(JSON.stringify(helper.sortObject(response)));
            });
        })
        .post((req, res) => {
            var user = {
                name: req.body.nickname,
                avatar: 'images/face.png',
                password: req.body.password,
                online: true,
                location: req.body.location || ''
            };
            new User(user).save(function (err) {
                if (err) throw err;
                console.log('User saved successfully!');
                res.redirect('/')
            });
        })
        .put((req, res) => {
            User.findOneAndUpdate({name: req.body.name}, {$set: req.body}, {new: true}, (err, result)=> {
                if (err) return res.send(err);
                res.send(result)
            })
        })
        .delete((req, res) => {
            User.findOneAndRemove({name: req.body.username}, function (err, result) {
                if (err) throw err;
                console.log('User deleted!');
                res.send(result)
            });
        });

    app.route('/messages')
        .get((req, res) => {
            Message.find({}, function (err, messages) {
                if (err) throw err;
                res.statusCode = 200;
                res.send(JSON.stringify(messages));
            });
        })
        .post((req, res) => {
            var msg = {
                type: req.body.type,
                text: req.body.text,
                date: req.body.date,
                author: req.body.author,
                username: req.body.username
            };
            new Message(msg).save(function (err) {
                if (err) throw err;
                console.log('Message saved successfully!');
                res.redirect('/')
            });
        });

    return app;
};