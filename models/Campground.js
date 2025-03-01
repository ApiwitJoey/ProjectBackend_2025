const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  address: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
<<<<<<< HEAD
    
=======
    required: true
>>>>>>> f8f9570d41eccf0c5bc46e4a220b206eea92da74
  }
}, {
  toJSON : {virtuals:true},
  toObject : {virtuals:true}
});

CampgroundSchema.virtual('reserves',{
  ref:'Reserve',
  localField:'_id',
  foreignField:'campground',
  justOne:false
})

const Campground = mongoose.model('Campground', CampgroundSchema);

module.exports = Campground;