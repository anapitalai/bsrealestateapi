const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{type:String,required:true},
    contacts:{type:String,required:true},
    message:{type:String,required:true},
    createdAt:Date,
    updatedAt:Date

});

feedbackSchema.pre('save', function(next) {
    
    var currentDate = new Date();
    
    this.createdAt = currentDate;
    
    if (!this.updatedAt)
    this.updatedAt = currentDate;

    next();
    });
    

module.exports = mongoose.model('Feedback',feedbackSchema);