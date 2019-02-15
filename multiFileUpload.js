//multiple file upload to local or ftp file storage 

var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var fs = require("fs");
const ejs = require('ejs');
const path = require('path');
var sftpStorage = require('multer-sftp');


//this is sftp connection to remote server -sftp linux server
var storage = sftpStorage({
    sftp: {
      host: '192.168.23.27',
      port: 22,
      username: 'Nitish',
      password: '123456'  

    },
    destination: function (req, file, cb) {
      cb(null, '/Uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })


  //this is for local storage

/*  var  storage = multer.diskStorage({
            destination : function(req, file, next){
                next(null,'./public/fileUploaded');
            },
            filename : function(req,file, next){
                  // console.log(file); 
                  // console.log(file.originalname); 
                   next(null, Date.now() + '-' + file.originalname);
            }
    
        })   */
        
 const upload = multer({
     storage: storage,
     limits:{fileSize: 1024 * 1024 *5 },
     fileFilter : function(req,file,cb){
         checkFileType(file,cb);
     }
    }).array('file',50);
 
 
//Check File type
function checkFileType(file,cb)
{
    //allowed extention check
    //regular expression of file typws
    const fileTypes = /jpeg|jpg|png|gif/;

    //check ext
    const extname =  fileTypes.test(path.extname(file.originalname));

    //check mime type in case someone change actual filetype to deceive
    const mimetype = fileTypes.test(file.mimetype);

    //if both ext and mime are true it means uploaded are images only
    if(extname && mimetype)
    {
        return cb(null,true);
    }else{
        return cb('Error : images only pls');
    }

}
 
// Init app
const app = express();

// EJS
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => res.render('index'));

app.post('/file_upload', (req, res)  => {

    upload(req,res,(err) =>{
        if(err)
        {
            res.render('index',{
                msg:err
            });
        } else {
            //console.log(req.files);
            if(req.files == undefined)
            {
                res.render('index',{
                    msg : 'Error : No file selected !!'
                })
            } else {
                 
                var imageNames = req.files.map(a =>"fileUploaded/" +a.filename);
                //console.log(imageNames);
                res.render('index', {
                    msg : 'File Uploaded sucessfully',
                    fileArray : `${imageNames}`
                    
                });
            }
        }

    })
  
}) 
 
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})