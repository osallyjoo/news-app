// require mongoose
var mongoose = require('mongoose');
// create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  title: {
    type:String,
    required:true
  },
  link: {
    type:String,
    required:true
  },
  note: {
      type: Schema.Types.ObjectId,
      ref: 'Note'
  }
});

// article model with article schema
var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;