const express = require('express');
const router = express.Router();
const Pusher = require('pusher');
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');



const Feedbacks = require('../models/feedback.model');


const multer = require('multer');



const upload = multer({

});


router.get('/', (req, res, next) => {
    Feedbacks.find()
        .select('_id  name  contacts message createdAt updatedAt')
        .exec()
        .then(doc => {


            console.log(doc);


            const response = {
                count: doc.length,


                feedbacks: doc.map(docs => {

                    return {
                        id: docs._id,
                        name: docs.name,
                        contacts: docs.contacts,
                        message: docs.message,
                        updatedAt: doc.updatedAt,
                        createdAt: doc.createdAt

                    }
                }
                )
            }
                ;



            res.status(200).json(response); //change back to docs
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
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
router.post('/', (req, res, next) => {

    const feedback = new Feedbacks({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        contacts: req.body.contacts,
        message: req.body.message
    });
    feedback
        .save()
        .then((feedbackData) => {
            console.log(feedbackData);
            res.status(201).json(pusher.trigger('bsea-channel', 'bsea-event', {
                message: 'New Feedback created',
                createdFeedback: feedbackData
            }));
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });





});

//get single alumni route
router.get('/:memberId', (req, res, next) => {
    const id = req.params.memberId;
    Feedbacks.findById(id)
        .select('_id name contacts message')
        .exec()
        .then(doc => {
            console.log('From DB', doc);
            if (doc) {
                res.status(200).json(doc);
            }
            else {
                res.status(400).json({
                    message: 'No valid member for the given ID'
                });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});


router.put('/:memberId', (req, res) => {
    const _id = req.params.memberId;

    Feedbacks.findOneAndUpdate({ _id },
        req.body,
        { new: true },
        (err, feedback) => {
            if (err) {
                res.status(400).json(err);
            }
            res.json(feedback);
        });
});


//delete route

router.delete('/:memberId', (req, res, next) => {
    const id = req.params.memberId;
    Feedbacks.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});



module.exports = router;