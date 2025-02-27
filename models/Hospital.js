const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
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
  district: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  postalcode: {
    type: String,
    required: true,
    maxlength: 5
  },
  telephone: {
    type: String
  },
  region: {
    type: String,
    required: true
  }
}, {
  toJSON : {virtuals:true},
  toObject : {virtuals:true}
});

hospitalSchema.virtual('appointments',{
  ref:'Appointment',
  localField:'_id',
  foreignField:'hospital',
  justOne:false
})

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;