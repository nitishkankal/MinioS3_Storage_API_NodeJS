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

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */

var CONSTANTS = {
    INCORRECT_BUCKETNAME: " INCORRECT BUCKET Name",
    SUCCESSFUL_MESSAGE: "file uploaded successfully",
    SERVER_OK_HTTP_CODE: 200,
    SERVER_ERROR_MESSAGE: "file uploading  failed"
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

var metaData = {
    'Content-Type': 'image/jpg',
    'X-Amz-Meta-Testing': 1234,
    'example': 5678
}

var storage = multer.diskStorage({
    destination: function (req, file, next) {
        next(null, __dirname + '../../../public/fileUploaded');
    },
    filename: function (req, file, next) {
        // console.log(file); 
        // console.log(file.originalname); 
        next(null, Date.now() + '-' + file.originalname);
    }

})


const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },   //limit file size 2MB

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
function uploadToRemoteBucket(bucketName, folderpath, fileObject) {
    return new Promise((resolve, reject) => {
        console.log(fileObject.path);
        console.log(fileObject.originalname);

        minioClient.fPutObject(bucketName, folderpath + "/" + fileObject.originalname, fileObject.path, metaData, function (error, etag) {
            if (error) {
                console.log("Minio error-" + error);
                reject(error)
            }
            //  console.log('File uploaded successfully.');
            // resolve(etag);
            resolve({
                'status': 'uploaded',
                'fileName': fileObject.originalname,
                'etag': etag
            });
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

 
router.post('/', (request, response, next) => {

    upload(request, response, function (err) {
        if (err instanceof multer.MulterError) {
            response.json({
                'Multer': 'file may be large'

            })
        } else if (err) {
            console.log("not multer error - " + err);
            response.json({
                'Ouchhhh': 'some multer fail'

            })
        } else {

            //console.log(req.files);
            if (request.files == undefined) {
                response.json({
                    'status': 'No file selected Error'

                })
            } else {
                var responseJson = [];
                var errorJson = [];
                // var responseArray = [];
                let promiseArray = [];

                // Extract the query-parameter
                const SellerID = request.body.SellerID;
                const objectPath = request.body.objectPath;

                console.log('_________________________________');

                console.log(SellerID);
                console.log(objectPath);

                var bucketName = 'unassignedseller';
                var folderpath = 'RandomUpload/';


                if (SellerID != '' || SellerID != null || SellerID != undefined) {
                    bucketName = ecryptName(SellerID);
                    //create bucket if not exists

                    promiseArray.push(checkBucketExist(bucketName).then(function (bucketExists) {
                        console.log(bucketExists);
                        if (bucketExists) {
                            if (objectPath != '' || objectPath != null || objectPath != undefined) {
                                folderpath = objectPath;
                                request.files.forEach(function (fileObject) {
                                    uploadToRemoteBucket(bucketName, folderpath, fileObject).then(function (result) {
                                        // Delete the file like normal

                                        deleteLocalFile(fileObject);
                                        /*  responseJson.push({
                                             'status': 'uploaded',
                                             'fileName': fileObject.originalname,
                                             'etag': result
                                         }); */
                                        // console.log(responseJson);


                                    }).catch((err) => {
                                        console.error("upload promise error -" + err);
                                        errorJson.push({
                                            'status': 'Error in uploading',
                                            'Details': err

                                        })
                                    }); //catch end

                                });     //foreach end

                            }  //object path checked if entered
                        } //if bucket exists
                        else {
                            response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
                                error: true,
                                filepath: INCORRECT_BUCKETNAME
                            });
                        }

                    }));

                    Promise.all(promiseArray)
                        .then((results) => {
                            console.log('_________________all_______');
                            console.log("promise :-" + promiseArray);
                            console.log("data - " + results);
                            for (let i = 0; i < results.length; i++) {
                                console.log(results[i]);

                            }
                            response.json(results);

                        })
                        .catch((e) => {
                            console.log(e);
                        });

                } //if sellerdID is not empty       
            }

        }//else end

    }) //Upload end;

});
module.exports = router;
