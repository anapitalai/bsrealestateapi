'use strict';
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');

//routes
const alumniRoutes = require('./api/routes/teachers');
const feedbackRoutes = require('./api/routes/feedback');
const userRoutes = require('./api/routes/users');
const emailRoutes = require('./api/routes/emails');


const mongodbUri ="mongodb://bismarksea:bismarksea@localhost:27017/bismarksea";

const mongooseUri = uriUtil.formatMongoose(mongodbUri);
const dbOptions = {};

mongoose.connect(mongooseUri, dbOptions, (err) => {
    if (err) {
      console.log(err);
    }
    console.log('Db started');
  });


const app = express();
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads')); //added sly
app.use('/avatars', express.static('avatars')); //added sly
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));




app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept');
  next();
});


app.use('/teachers', alumniRoutes);
app.use('/emails', emailRoutes);
app.use('/users', userRoutes);
app.use('/feedbacks', feedbackRoutes);
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});


app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: { message: error.message }
  });
});


module.exports = app;
