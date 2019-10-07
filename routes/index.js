var express = require('express');
var router = express.Router();
var multer  =   require('multer');
var mongo = require('mongoose');

var Schema = mongo.Schema; // <-- EDIT: missing in the original post

var UserURLSchema = new Schema({
    userid   : {type: String, unique: true, index: true},
    urls : [{url: String, fileName: String}]
});

var URLs = mongo.model("URLs", UserURLSchema);

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    // console.log(file);
    callback(null, Date.now()+file.originalname);  //timer added to make it unique
  }
});
var upload = multer({ storage : storage}).single('userVideo');




/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.user)
    res.redirect("./users/login");
  else
  {
    
    URLs.findOne({userid: req.session.user}, (err,data)=>{
      if(err)
        throw(err);
      
        if(data)
        {
          console.log(data.urls);
          res.render('index', { list:  data.urls, user: req.session.user});
        }

        else
        {
          res.render('index', { list:  [], user: req.session.user});
        }
    })
    
    
    


  }
});

router.post('/api/media/upload',function(req,res){   //uploading file 
  upload(req,res,function(err) {
      if(err) {
          throw err;
      }
      console.log("Session of: "+req.session.user);
      var URLobject = {"url": `${req.headers.origin}/api/media/download/${req.file.filename}` , "fileName": req.file.filename.substring(13)};
      
      URLs.findOne({userid: req.session.user}, (err,data)=>{
        if(err)
          throw(err);
          // console.log(data);

          if(data)
          {
            console.log("Url object" + URLobject.url);
            URLs.findOneAndUpdate({userid: data.userid}, {$push:{urls: URLobject}}, (err,data)=>{
              if(err)
                throw(err);
              // console.log(data);
            });
          }
          else
          {

            URLs.create({userid: req.session.user, urls: [URLobject]},(err,data)=>{
              console.log("created file");
              // console.log(data);
              // URLs.findOneAndUpdate({userid: data.userid}, {$push:{urls: URLobject}}, (err,data)=>{
              //   if(err)
              //     throw(err);
              //   console.log(data);
              // });
            });
            
          }

          console.log("URL added");
      });
      // res.send("File is uploaded. URL : " + `<a href=${URLobject.url}>${URLobject.fileName}</a>`);
      res.redirect('/');
  });
});

router.get('/api/media/download/:filename', function(req, res){
  var fileName = req.params.filename;
  var filePath = "./public/uploads/" + fileName ; 
   
  fileName = fileName.substring(13);  // setting the original name
  

  console.log(fileName);
  res.download(filePath, fileName);    
})


module.exports = router;
