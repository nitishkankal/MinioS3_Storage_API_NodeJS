//this newer version of promise didnt work properly

var Express = require("express");
var Multer = require("multer");
var Minio = require("minio");
var BodyParser = require("body-parser");
var fs = require("fs");
const ejs = require('ejs');
const path = require('path');
const {promisify} = require('util'); // util.promisify(). It converts a callback-based function to a Promise-based one.

var app = Express();

const unlinkAsync = promisify(fs.unlink)

app.use(BodyParser.json({limit: "4mb"}));
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
    'Content-Type': 'image/png',
    'X-Amz-Meta-Testing': 1234,
    'example': 5678
}
/* app.post("/upload", Multer({storage: Multer.memoryStorage()}).single("file"), function(request, response) {
    minioClient.putObject("asas", request.file.originalname, request.file.buffer, function(error, etag) {
        if(error) {
            return console.log(error);
        }
        response.send(request.file);
    });
}); */


function uploadToRemoteBucket(request, response)
{
    console.log(request.file.path);
    console.log(request.file.originalname);
       minioClient.fPutObject("asas", request.file.originalname, request.file.path, metaData, function(error, etag) {
           if(error) {
               return console.log(error);
           }
           console.log('File uploaded successfully.');
           response.send(request.file);
       });
}

app.post("/uploadfile", Multer({dest: "./public/fileUploaded"}).single("file"), async function(request, response) {

 await   uploadToRemoteBucket(request, response);

 // Delete the file like normal
 //await unlinkAsync(request.file.path)
 unlinkAsync(request.file.path, function(err) {
    if(err && err.code == 'ENOENT') {
        // file doens't exist
        console.info("File doesn't exist, won't remove it.");
    } else if (err) {
        // other errors, e.g. maybe we don't have enough permission
        console.error("Error occurred while trying to remove file");
    } else {
        console.info(`removed`);
    }
});

 res.end("delete COMPLETED!")
});

process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`)
  });
  process.on('unhandledRejection', error => {
    // Prints "unhandledRejection woops!"
    console.log('unhandledRejection, handled yeahh', error.test);
  });


app.get("/download", function(request, response) {
    minioClient.getObject("asas", request.query.filename, function(error, stream) {
        if(error) {
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