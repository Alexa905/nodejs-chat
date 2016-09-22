// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var messageSchema = new Schema({
    type: { type: String, required: true },
    text: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: String, required: true },
    username:  { type: String, required: false }
});

// the schema is useless so far
// we need to create a model using it
var Message = mongoose.model('Message', messageSchema);

// make this available to our users in our Node applications
module.exports = Message;