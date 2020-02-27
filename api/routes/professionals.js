const express = require('express');
const router = express.Router();
const Pusher =require('pusher');
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');



const Professionals = require('../models/professionals.model');


const multer = require('multer');

const storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./stationery/');
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



//get all alumni routes
/** router.get('/',(req,res,next)=>{
 Professionals.find()
 .select('_id name description images')
 .populate('teacherId')
 .exec()
 .then(docs=>{
    res.status(200).json(docs);
})
 .catch(err=>{
     console.log(err);
     res.status(500).json({error:err});
 });
});**/

router.get('/',(req,res,next)=>{
    Professionals.find()
    .select('_id  name description images createdAt updatedAt')
    .exec()
    .then(doc=>{
    
   
       console.log(doc);
     
   
       const response={
           count:doc.length,
   
           
           professionals:doc.map(docs=>
              {
               
               return {
                   id:docs._id,
                   name:docs.name,
                   description:docs.description,
                   singleViewImages:docs.images,
                   updatedAt:doc.updatedAt,
                   createdAt:doc.createdAt,
                   listViewImage:docs.images[0],
               request:{
                 type:'GET',
                 url:'http://localhost:3007/professionals/' + docs._id
               },
               
               requestAvatar:{
                   type:'GET',
                   url:docs.images[0]
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


//pushe
var pusher = new Pusher({
    appId: '947043',
    key: '6384e05eafa2609b7f1e',
    secret: 'f2453bf8c62751ecc148',
    cluster: 'ap4',
    encrypted: true
  });
  

//add a new alumni route
router.post('/',upload.array('images',5),(req,res,next)=>{

    var arr = [];
    for (var i = 0; i < req.files.length; ++i) {
      arr.push('http://localhost:3000/'+req.files[i].path );
    };

    const professional = new Professionals({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        description: req.body.description,
        images:arr
    }); 
    professional
    .save()
    .then((professionalData)=>{
        console.log(professionalData);
        res.status(201).json(pusher.trigger('bsea-channel','bsea-event',{
            message:'New Property Details created',
            createdTeacher:professionalData
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
    Professionals.findById(id)
    .select('_id name description images')
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

    Professionals.findOneAndUpdate({ _id },
      req.body,
      { new: true },
      (err, professional) => {
      if (err) {
         res.status(400).json(err);
      }
       res.json(professional);
    });
    });


//delete route

router.delete('/:memberId',(req,res,next)=>{
    const id=req.params.memberId;
    Professionals.deleteOne({_id:id})
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