const mongoose = require('mongoose');


const teacherSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    location:{type: String,required:true},
    price:{type: String,required:true},
    status:{type: String,required:true},
    type:{type: String,required:true},
    description:{type:String,required:true},
    avatarImage:{type:Array,required:true}
 
});

teacherSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.createdAt = currentDate;
    if (!this.updatedAt)

    this.updatedAt = currentDate;
    next();

    });
    

module.exports = mongoose.model('Teachers',teacherSchema);