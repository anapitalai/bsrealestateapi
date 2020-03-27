const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');
const checkAuth = require('../middleware/check-auth');

const Email = require('../models/email.model');



//get all alumni routes
router.get('/', (req, res, next) => {
    Email.find()
        .select('_id  name telephone email company subject message createdAt updatedAt')
        .exec()
        .then(doc => {

            console.log(doc);

            const response = {
                count: doc.length,

                emails: doc.map(docs => {

                    return {
                        id: docs._id,
                        name: docs.name,
                        telephone:docs.telephone,
                        company: docs.comapny,
                        email:docs.email,
                        subject:docs.subject,
                        message: docs.message,
                        updatedAt: doc.updatedAt,
                        createdAt: doc.createdAt,

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


router.post('/', (req, res, next) => {


    /**
     *   // Initialize our service with any options it requires
      app.use('/mailer', Mailer(smtpTransport({
        host: 'smtp.gmail.com',
        secure: true,
        auth: {
          user: "anapitalai@gmail.com",
          pass: "lhwjcnqwtqcmeytx"
        }
      })));
     */
    const output = `
    <p>You have a messasage</p>
    <h3>Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Telephone: ${req.body.telephone}</li>
      <li>Company/Individual: ${req.body.company}</li>
      <li>Subject:${req.body.subject}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'anapitalai@gmail.com', // generated ethereal user
        pass:  "lhwjcnqwtqcmeytx"  // generated ethereal password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from:'${req.body.email}',
      //from: '"BSRE Admin" <anapitalai@gmail.com>', // sender address
      to: 'jweslianne@gmail.com,anapitalai@gmail.com', // list of receivers
      subject: `${req.body.subject}`, // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      res.render('contact', {msg:'Email has been sent'});
  });


    const email = new Email({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email:req.body.email,
        telephone: req.body.telephone,
        company: req.body.company,
        subject:req.body.subject,
        message: req.body.message

    });
    email.save()
        .then((emailData) => {
            console.log(emailData);
            res.status(201).json({
                message: 'New email created',
                createdEmail: emailData
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

//get single alumni route
router.get('/:memberId', (req, res, next) => {
    const id = req.params.memberId;
    Teacher.findById(id)
        .select('_id name description avatarImage')
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

router.delete('/:emailId', (req, res, next) => {
    const id = req.params.emailId;
    Email.deleteOne({ _id: id })
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