/* MODEL INSTRUCTIONS:
 * Scroll below the schema in this file
 * and create the custom methods we're looking for.
 * -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/ */

// require mongoose

var mongoose = require('mongoose');

// create the Schema class
var Schema = mongoose.Schema;


// new Schema: UserSchema
var leakSchema = new Schema({
   title: {
    type: String,
    trim: true
  },
  intro: {
    type: String,
    trim: true
  },
  img: {
    type: String,
    trim: true
  },
  comments: [{
    user: {type: String, trim: true},
    comment: {type: String, trim: true}
  }]
});

var Leak = mongoose.model('Leak', leakSchema);

// export the model so the server can use it
module.exports = Leak;
