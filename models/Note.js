// require mongoose
var mongoose = require('mongoose');
// create a schema class
var Schema = mongoose.Schema;

// create the Note schema
var NoteSchema = new Schema({
  title: {
    type:String
  },
  body: {
    type:String
  }
});

// note model with note schema
var Note = mongoose.model('Note', NoteSchema);

module.exports = Note;