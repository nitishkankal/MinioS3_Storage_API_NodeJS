var Minio = require('minio')

// Instantiate the minio client with the endpoint
// and access keys as shown below.
var minioClient = new Minio.Client({
    endPoint: '192.168.23.204',
    port: 9001,
    useSSL: false,
    accessKey: 'admin',
    secretKey: 'Abc1234!'
});

// File that needs to be uploaded.
var file = './public/fileUploaded/texas.png'


minioClient.listBuckets(function(err, buckets) {
    if (err) return console.log(err)
    console.log('buckets :', buckets)
  })
  minioClient.bucketExists('mybucket', function(err, exists) {
    if (err) {
        // Make a bucket called NikBucket.
minioClient.makeBucket('asas', function(err) {
    if (err) return console.log(err)

    console.log('Bucket created successfully.')
            }); 
    }
    if (exists) {
     return console.log('Bucket exists.');
      
    }
  })
   


    var metaData = {
        'Content-Type': 'image/png',
        'X-Amz-Meta-Testing': 1234,
        'example': 5678
    }
    // Using fPutObject API upload your file to the bucket NikBucket.
    minioClient.fPutObject('asas', 'texas.png', file, metaData, function(err, etag) {
      if (err) return console.log(err)
      console.log('File uploaded successfully.')
    });
