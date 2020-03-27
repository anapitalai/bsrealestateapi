const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const DateUpdate = require('../middleware/date');
const multer = require('multer');

const storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./avatars/');
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


//allUsers


//get all alumni routes
router.get('/',(req,res,next)=>{
    User.find()
    .select('_id email password avatar createdAt updatedAt')
    .exec()
    .then(docs=>{
       res.status(200).json(docs);
   })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });
   });
   

//add a login user route
router.post('/signup',upload.single('avatar'),(req,res,next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length>=1){
            return res.status(409).json({message:'Email exists.'});
        }
        else{
           
    bcrypt.hash(req.body.password,10,(err,hash)=>{
        if(err){
            return res.status(500).json({
             error:err
            });
        }else{
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                avatar:'http://chervicontraining.com:3006'+req.file.path,
                email: req.body.email,
                password:hash,
                
            }
            );
            //test

                user.save()
                .then(result=>{
                    return res.status(201).json({message:'User created'});
                })
                .catch(error=>{
                    console.log(err);
                    res.status(500).json({error:err});
                });
        }//ifelse
    });//bcrypt
        }
    })
 


      
});//router

//login
router.post('/login',(req,res,next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length<1){
            res.status(401).json({
             message:'Athentication failed,no email!'
            });
        }
        bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if(err){
                res.status(401).json({
                    message:'Athentication failed!'
                   });
            }
            if(result){
               const token = jwt.sign({email:user[0].email,userId:user[0]._id},'secretpassword',{
                    expiresIn:"1h"
                });


               return res.status(200).json({
                    message:'Authentication sucessful!',
                    token:token
                });
            }
            res.status(401).json({
                message:'Athentication failed!'
               });
        }); //bcrypt compare
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });
});

//get single alumni route
router.get('/:memberId',(req,res,next)=>{
    const id=req.params.memberId;
    User.findById(id)
    //.select('_id name dob nid province district village childCount spouse maritalStatus')
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
   // User.findOneAndUpdate({_id},
   User.findByIdAndUpdate({_id},
      req.body,
      { new: true },
      (err, user) => {
      if (err) {
         res.status(400).json(err);
      }

       res.json(user);


    });
    
    });
//date
router.put('/update/:memberId',(req,res)=>{
    const _id = req.params.memberId;
    var ndate=new Date();
    User.findByIdAndUpdate(_id,{ updatedAt:ndate },
      //req.body,
      //{ new: true },
      (err, user) => {
      if (err) {
         res.status(400).json(err);
      }

       res.json(user);


    });
    
    });
   
//delete route
router.delete('/:userId',(req,res,next)=>{
    
    User.remove({_id:req.params.userId})
    .exec()
    .then(result=>{
        return res.status(200).json({message:'User purged'});
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });

   
    
});



module.exports = router; 
