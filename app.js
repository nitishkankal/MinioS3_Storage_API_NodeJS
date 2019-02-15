const express = require('express');
const app = express();
const fs = require('fs');


// EJS
app.set('view engine', 'ejs');

app.use(express.static('public'));
//app.use(BodyParser.urlencoded({ extended: false }));


//const singleFileUpload = require('./api/ImageUpload/singleUpDB');
const multiFileUpload = require('./api/ImageUpload/multiUpDB');
const  FileDownload= require('./API/ImageDownload/getImage');

//app.use('/singleFileUpload',singleFileUpload);
app.use('/multiFileUpload',multiFileUpload);
app.use('/FileDownload',FileDownload);


app.get('/', (req, res) => res.render('multiFileUploadDB')); 



module.exports = app;




