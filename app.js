var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/proxynotes', {useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true},()=>{
  console.log("Database Connected");
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:"mainahibataunga123bolananahi", resave:false, saveUninitialized:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false })) //body-parwser
// app.use(bodyParser.json())

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey('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');
// const msg = {
//   to: 'amansngh473@gmail.com',
//   from: 'er.aks473@gmail.com',
//   subject: 'Hi Chacha',
//   text: 'Will you be my chacha?',
//   html: '<strong>Will you be my chacha?</strong>',
// };
// sgMail.send(msg);


// let options = { method: 'POST',
//       url: 'https://api.sendgrid.com/v3/mail/send',
//       headers: 
//        { 
//          'cache-control': 'no-cache',
//          'Content-Type': 'application/json',
//          authorization: process.env.SENDGRID_API_KEY },
//       body: 
//        { personalizations: [ { to: [ { email: 'aks13597@gmail.com' } ] } ],
//          from: { email: 'er.aks473@gmail.com' },
//          subject: 'sendgrid mail data',
//          content: 
//           [ { type: 'text/plain',
//               value: 'Sending this mail from sendgrid server!' } ] },
//       json: true };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);
//       console.log(body);
// })


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
