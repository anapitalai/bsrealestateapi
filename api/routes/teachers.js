const express = require('express');
const router = express.Router();
const Pusher =require('pusher');
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');
const checkAuth = require('../middleware/check-auth');
//multer from here
const multer = require('multer');

const storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename: function(req,file,cb){
        cb(null,new Date().toISOString()+file.originalname);
    }
});
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
        cb(null,true);
    }
    else{
        cb(null,false);
    }
};
const upload = multer({storage:storage,limit:{
    fileSize:1024 * 1024 * 5
},
fileFilter:fileFilter
}); 


var pusher = new Pusher({
    appId: '947043',
    key: '6384e05eafa2609b7f1e',
    secret: 'f2453bf8c62751ecc148',
    cluster: 'ap4',
    encrypted: true
  });
  

//multer to here

const Teacher = require('../models/teacher.model');



//get all alumni routes
router.get('/',(req,res,next)=>{
 Teacher.find()
 .select('_id  location price status type description avatarImage createdAt updatedAt')
 .exec()
 .then(doc=>{
 

    console.log(doc);
  

    const response={
        count:doc.length,

        
        teachers:doc.map(docs=>
           {
            
            return {
                id:docs._id,
                location:docs.location,
                price:docs.price,
                status:docs.status,
                price:docs.price,
                description:docs.description,
                singleViewImages:docs.avatarImage,
                updatedAt:doc.updatedAt,
                createdAt:doc.createdAt,
                listViewImage:docs.avatarImage[0],
            request:{
              type:'GET',
              url:'http://localhost:3000/teachers/' + docs._id
            },
            
            requestAvatar:{
                type:'GET',
                url:docs.avatarImage[0]
              }

            }
            }
    )}
    ;
    


    res.status(200).json(response); //change back to docs
})
 .catch(err=>{
     console.log(err);
     res.status(500).json({error:err});
 });
});

//add a new alumni route
  // router.post('/',upload.array("uploads[]",12),(req,res,next)=>{
   router.post('/',upload.array('avatarImage',3),(req,res,next)=>{
    
    var arr = [];
    for (var i = 0; i < req.files.length; ++i) {
      arr.push('http://localhost:3000/'+req.files[i].path);
    }
    console.log(arr);

//

    const teacher = new Teacher({
        _id: new mongoose.Types.ObjectId(),
        location: req.body.location,
        price: req.body.price,
        status: req.body.status,
        type: req.body.type,
        description:req.body.description,
        avatarImage:arr

    }); 
    teacher.save()
    .then((teacherData)=>{
        console.log(teacherData);
        res.status(201).json(pusher.trigger('bsea-channel','bsea-event',{
            message:'New teacher created',
            createdTeacher:teacherData
           }));
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });


});



//get single alumni route
router.get('/:memberId',(req,res,next)=>{
    const id=req.params.memberId;
    Teacher.findById(id)
    .select('_id location price status type description avatarImage')
    .exec()
    .then(doc=>{
       console.log('From DB',doc);
       if(doc){
        res.status(200).json(doc);
       }
        else{
            res.status(400).json({
                message:'No valid member for the given ID'
            });
        }
      
   })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });
   });


   router.put('/:memberId',(req,res)=>{
    const _id = req.params.memberId;

    Teacher.findOneAndUpdate({ _id },
      req.body,
      { new: true },
      (err, user) => {
      if (err) {
         res.status(400).json(err);
      }
       res.json(user);
    });
    });





//delete route

router.delete('/:memberId',(req,res,next)=>{
    const id=req.params.memberId;
    Teacher.deleteOne({_id:id})
    .exec()
    .then(result=>{
       res.status(200).json(result);
   })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });
   });


module.exports = router;
