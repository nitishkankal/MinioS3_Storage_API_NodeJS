var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var fs = require("fs");


var app = express();


 var  storage = multer.diskStorage({
            destination : function(req, file, next){
                next(null,'./public/fileUploaded');
            },
            filename : function(req,file, next){
                   console.log(file); 
                   console.log(file.originalname); 
                   next(null, Date.now() + '-' + file.originalname);
            }
    
        })  
        
 const upload = multer({storage: storage}).single('file');  //maxxount 5 files more than it throw error
// const upload = multer({storage: storage}).array('file',5);  //maxxount 5 files more than it throw error
 
 
 
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(multer({ dest: __dirname+ '/fileUploaded/'}).any());

 app.get('/index.html', function (req, res,next) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.post('/file_upload', upload, function (req, res,next) {

    res.send('sd');
  //  var filearray = req.files['file'];
  //  console.log("2"+filearray.length); 
/*     console.log("1 --"+req.file);
   
   console.log(req.files.file.name);
   console.log(req.files.file.path);
   console.log(req.files.file.type);
   var file = __dirname + "/" + req.files.file.name;
   
   fs.readFile( req.files.file.path, function (err, data) {
      fs.writeFile(file, data, function (err) {
         if( err ) {
            console.log( err );
            } else {
               response = {
                  message:'File uploaded successfully',
                  filename:req.files.file.name
               };
            }
         
         console.log( response );
         res.end( JSON.stringify( response ) );
      });
   }); */
}) 
 
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})