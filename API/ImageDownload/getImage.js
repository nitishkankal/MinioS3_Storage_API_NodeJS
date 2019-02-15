//this is to upload multiple file and update record (bucket name, object name, URL ) to database
// bucket name consists of seller ID  encrypted with private key
//objectID consists of path as per types of Image
// SellerID + /Profile/profilePic
//URL :- $env.Host + $env.POrt / BucketID (encrypted SellerID) / ObjectPath 


const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
var multer = require('multer');
var Minio = require("minio");
const sharp = require('sharp');
 

var CONSTANTS = {
    INVALID_HEIGTH : "INVALID_HEIGTH",
    INVALID_WIDTH : "INVALID_WIDTH",
    INCORRECT_BUCKETNAME: " INCORRECT BUCKET Name",
    SCALE_SUCCESSFUL: "file SCALED successfully",
    SCALE_UNSUCCESSFUL: "file SCALED failed",
    SERVER_OK_HTTP_CODE: 200,
    SERVER_ERROR_MESSAGE: "cant get file "
}


// Instantiate the minio client with the endpoint
// and access keys as shown below.
var minioClient = new Minio.Client({
    endPoint: '192.168.23.204',
    port: 9002,
    useSSL: false,
    accessKey: 'nitish',
    secretKey: 'Abc1234!'
});
 

function ecryptName(SellerID) {

    var encryptedname = SellerID;
    return encryptedname;
}
function checkBucketExist(bucketName) {

    return new Promise((resolve, reject) => {
        minioClient.bucketExists(bucketName, function (err, exists) {
            if (err) {

                reject(false);
                return console.log(err)
            }
            if (exists) {
                console.log('Bucket exists.')
                //  resolve(true);
                resolve({
                    'status': 'bucket exists',
                    'fileName': bucketName
                });
            }
            else {
                minioClient.makeBucket(bucketName, 'us-east-1', function (err) {
                    if (err) {
                        reject(false);
                        return console.log('Error creating bucket.', err)
                    }
                    console.log('Bucket created successfully in "us-east-1".');
                    resolve(true);


                })
            }
        })

    });

}

router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(bodyParser.json());
//http://localhost:3000/FileDownload/Raw?SellerID=asas&objectPath=API.png
router.get('/Raw', (request, response, next) => {

    // Extract the query-parameter
    var SellerID = request.query.SellerID;
    var objectPath = request.query.objectPath;

    console.log(SellerID);
    console.log(objectPath);
    // var bucketName = decryptBucketName(SellerID);

    minioClient.getObject(SellerID, objectPath, function (error, stream) {
        if (error) {
            return response.status(500).send(error);
        }
        stream.pipe(response);
    });



});


//http://localhost:3000/FileDownload/Scaled?SellerID=asas&objectPath=API.png&format=png&width=500&height=200
router.get('/Scaled', (request, response, next) => {

    var SellerID = request.query.SellerID;
    var objectPath = request.query.objectPath;

    // Extract the query-parameter
    const widthString = request.query.width;
    const heightString = request.query.height;
    const format = request.query.format;

    //parsing 
    let width, height;   //variable declaration kind of small scoped if let used
    if (widthString) {

        width = parseInt(widthString, 10);
    }
    if (heightString) {

        height = parseInt(heightString, 10);
    }
    if (height === '' || height === null || height === undefined) {
        response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
            error: true,
            filepath: CONSTANTS.INVALID_HEIGTH
        });
    } else if (width === '' || width === null || width === undefined) {
        response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
            error: true,
            filepath: CONSTANTS.INVALID_WIDTH
        });
    }
    // Set the content-type of the response
    //response.type(`image/${format || 'jpg'}`);


    minioClient.getObject(SellerID, objectPath, function (error, stream) {
        if (error) {
            //return response.status(500).send(error);
            return response.status(500).json({
                error: true,
                filepath: error
            });
        }
        // stream.pipe(response);


        let transform = sharp();

        if (format) {
            transform = transform.toFormat(format);
        }

        if (width || height) {
            transform = transform.resize(width, height);
        }

        return stream
            .pipe(transform)
            .pipe(response);

    });

});

 

 
 
module.exports = router;
