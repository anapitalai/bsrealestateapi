const mongoose = require('mongoose');


const emailSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{type: String,required:true},
    telephone:{type: String,required:true},
    company:{type: String,required:true},
    email:{type: String,required:true},
    subject:{type: String,required:true},
    message:{type:String,required:true}
 
});

emailSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.createdAt = currentDate;
    if (!this.updatedAt)

    this.updatedAt = currentDate;
    next();

    });
    

module.exports = mongoose.model('Email',emailSchema);