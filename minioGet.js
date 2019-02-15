//this one use older version of promise, and works properly
//upload single file and delete from local storage


var Express = require("express");
var multer  = require('multer');
var Minio = require("minio");
var BodyParser = require("body-parser");
var fs = require("fs");
const path = require('path');

var app = Express();


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
    secretKey: 'Abc1234!s'
});

var metaData = {
    'Content-Type': 'image/png',
    'X-Amz-Meta-Testing': 1234,
    'example': 5678
}
 
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
    limits:{fileSize: 4000000} 
    }).single('file');  //maxxount 5 files more than it throw error
 
 
 

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