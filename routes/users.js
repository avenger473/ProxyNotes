var express = require('express');
var router = express.Router();
var mongo = require('mongoose');
var hidden = require('../bin/hidden');
var Schema = mongo.Schema; // <-- EDIT: missing in the original post

var UserSchema = new Schema({
    name     : String, 
    email    : String,
    userid   : {type: String, unique: true, index: true},
    password : String
});

var CodeSchema = new Schema({
  userid : {type: String, unique: true, index: true},
  email :String,
  code : String
})

var Users = mongo.model("Users", UserSchema );
var UserCode = mongo.model("UserCode", CodeSchema);

var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(hidden.SENDGRIDAPI);




/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', function(req, res, next){

  // console.log(req.body.name + req.body.email + req.body.userid + req.body.password)
  Users.create({
    name     : req.body.name, 
    email    : req.body.email,
    userid   : req.body.userid,
    password : req.body.password
  },(err,data)=>{
    if(err)
      throw(err);

      console.log(data.name + " saved to user collection.")
      res.end("User Registered");
  });

});

router.get('/login', function(req,res,next){
  res.render('login');
})

router.post('/login', function(req, res, next) {

  Users.findOne({
    userid: req.body.userid}, (err,data)=>{
      if(err)
        throw(err);
      console.log(data);

      if(data){
        if(data.password===req.body.password)
        {
          req.session.user = data.userid;
          res.redirect('/');
        }
        else
        {
          res.end("Password mismatch");
        }
      }
      else
      {
        res.end("User not registered");
      }
      
  })

});

router.get('/forgotpass', function(req, res, next) {

  var code = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  console.log(code); 
  console.log(req.query.userid);  // /users/forgotpass?userid=
  Users.findOne({
    userid: req.query.userid}, (err,data)=>{
      if(err)
        throw(err);
      console.log(data);

      if(data){
        console.log(data);
        const msg = {
          to: data.email,
          from: 'er.aks473@gmail.com',
          subject: 'Forgot Password',
          text: `Recovery Code:  ${code}`,
          html: `<strong>Recovery Code:  ${code}</strong>`,
        };
        sgMail.send(msg);

        UserCode.create({
          userid: data.userid,
          email: data.email,
          code: code
        }, (err,data)=>{
          if(err)
            throw(err);
          console.log("Code Saved for "+ data.userid);
        })

        res.end("Code Sent");
      }
      else
      {
        res.end("User not registered");
      }
      
  })
})

router.post('/forgotpass', function(req, res, next){
  UserCode.findOne(
    {email: req.body.email}, (err,data)=>{
      if(err)
        throw(err);
      
      if(data)
      {
        if(data.code===req.body.code)
        {
          Users.findOneAndUpdate({userid: data.userid}, 
                                  { $set: { password: req.body.password }}, (err,data)=>{
                                    if(err)
                                      throw(err);
                                    console.log(data);
                                    UserCode.deleteOne({userid: data.userid}, (err,data)=>{
                                      if(err)
                                        throw(err);

                                        console.log("Password Updated to "+ req.body.password);
                                        res.end("Password Updated")
                                      
                                    })
                                  })
        }
        else
        {
          res.end("Invalid Code");
        }
      }
      else
      {
        res.end("User not registered");
      }
    })
})


router.get('/logout', function(req,res,next){
  req.session.user = null;
  res.redirect('/');
})
module.exports = router;
