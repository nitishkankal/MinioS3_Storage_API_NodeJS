//this one use older version of promise, and works properly
//upload Multiple file and delete from local storage


var Express = require("express");
var multer = require('multer');
var Minio = require("minio");
var BodyParser = require("body-parser");
var fs = require("fs");
//const ejs = require('ejs');
const path = require('path');

var app = Express();

// const unlinkAsync = promisify(fs.unlink)

app.use(BodyParser.json({ limit: "4mb" }));
// EJS
app.set('view engine', 'ejs');

app.use(Express.static('public'));
//app.use(BodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => res.render('index_minio_Multer_multi'));

// Instantiate the minio client with the endpoint
// and access keys as shown below.
var minioClient = new Minio.Client({
    endPoint: '192.168.23.204',
    port: 9002,
    useSSL: false,
    accessKey: 'admin',
    secretKey: 'Abc1234!'
});

var metaData = {
    'Content-Type': 'image/jpg',
    'X-Amz-Meta-Testing': 1234,
    'example': 5678
}

var storage = multer.diskStorage({
    destination: function (req, file, next) {
        next(null, './public/fileUploaded');
    },
    filename: function (req, file, next) {
        // console.log(file); 
        // console.log(file.originalname); 
        next(null, Date.now() + '-' + file.originalname);
    }

})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 *2 },   //limit file size 2MB
   
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).array('file', 50);  //maxxount 50 files more than it throw error


//Check File type
function checkFileType(file, cb) {
    //allowed extention check
    //regular expression of file typws
    const fileTypes = /jpeg|jpg|png|gif/;

    //check ext
    const extname = fileTypes.test(path.extname(file.originalname));

    //check mime type in case someone change actual filetype to deceive
    const mimetype = fileTypes.test(file.mimetype);

    //if both ext and mime are true it means uploaded are images only
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb('Error images only pls');
    }

}


function uploadToRemoteBucket(fileObject) {
    return new Promise((resolve, reject) => {
        console.log(fileObject.path);
        console.log(fileObject.originalname);
        minioClient.fPutObject("test1","folder/" +fileObject.originalname, fileObject.path, metaData, function (error, etag) {
            if (error) {
                console.log("Minio error-"+error);
                reject(error)
            }
            //  console.log('File uploaded successfully.');
            resolve(etag);
            //  response.send(fileObject);
        })
    })
}

function deleteLocalFile(fileObject) {
    fs.unlink(fileObject.path, function (err) {
        if (err && err.code == 'ENOENT') {
            // file doens't exist
            console.info("File doesn't exist, won't remove it.");
        } else if (err) {
            // other errors, e.g. maybe we don't have enough permission
            console.error("Error occurred while trying to remove file");
        } else {
            console.info(`removed`);
        }
    });
}


//app.post("/uploadfile", multer({dest: "./public/fileUploaded"}).single("file"), function(request, response) {
app.post("/uploadfile", function (request, response) {
    upload(request, response, function (err) {
        if (err instanceof multer.MulterError) {
            response.json({
                'Multer': 'file may be large'
    
            })
          } else if (err) {
            response.json({
                'Ouchhhh': 'some multer fail'
    
            })
          } else{

    //console.log(req.files);
    if (request.files == undefined) {
        response.json({
            'status': 'No file selected Error'

        })
    } else {
        var responseJson = [];
        var errorJson =[] ;
        var responseArray =[];
        var promiseArray =[]; 
        request.files.forEach(function (fileObject) {


            promiseArray.push(uploadToRemoteBucket(fileObject).then(function (result) {
                // Delete the file like normal
                deleteLocalFile(fileObject);                                                                                                                                                          
                responseJson.push({
                    'status': 'uploaded',
                    'fileName': fileObject.originalname,
                    'etag': result
                })
            }).catch((err) => {
                console.error("upload promise error -" + err);
                errorJson.push({
                    'status': 'Error in uploading',
                    'Details': err

                })
            }))//catch end
        })//foreach end

        Promise.all(promiseArray).then(function(data) {
           // console.dir(data);
            console.log(responseJson);
            response.json(responseJson);

          }).catch(function(e) {
            console.log(e);
          });
        //responseArray.push(responseJson);
       // responseArray.push(errorJson);
     
    
        
    }//else end
}
}) //Upload end;
}) //post end;



app.get("/download", function (request, response) {
    minioClient.getObject("asas", request.query.filename, function (error, stream) {
        if (error) {
            return response.status(500).send(error);
        }
        stream.pipe(response);
    });
});

/* minioClient.bucketExists("asas", function(error) {
    if(error) {
        return console.log(error);
    }
    var server = app.listen(3000, function() {
        console.log("Listening on port %s...", server.address().port);
    });
}); */

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})