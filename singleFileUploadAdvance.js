var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var fs = require("fs");
const ejs = require('ejs');
const path = require('path');



 var  storage = multer.diskStorage({
            destination : function(req, file, next){
                next(null,'./public/fileUploaded');
            },
            filename : function(req,file, next){
                  // console.log(file); 
                  // console.log(file.originalname); 
                   next(null, Date.now() + '-' + file.originalname);
            }
    
        })  
        
 const upload = multer({
     storage: storage,
     limits:{fileSize: 4000000},
     fileFilter : function(req,file,cb){
         checkFileType(file,cb);
     }
            
    }).single('file');  //maxxount 5 files more than it throw error
// const upload = multer({storage: storage}).array('file',5);  //maxxount 5 files more than it throw error
 
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
 

//app.use(multer({ dest: __dirname+ '/fileUploaded/'}).any());

app.get('/', (req, res) => res.render('index'));

app.post('/file_upload', (req, res)  => {

    upload(req,res,(err) =>{
        if(err)
        {
            res.render('index',{
                msg:err
            });
        } else {
            console.log(req.file);
            if(req.file == undefined)
            {
                res.render('index',{
                    msg : 'Error : No file selected !!'
                })
            } else {
                res.render('index', {
                    msg : 'File Uploaded sucessfully',
                    file : `fileUploaded/${req.file.filename}`
                    
                });
            }
        }

    })
    

     
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