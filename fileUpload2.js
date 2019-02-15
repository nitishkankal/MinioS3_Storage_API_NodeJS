import bodyParser from 'body-parser';
import morgan from 'morgan';
import express from 'express';
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static(__dirname, 'public'));

const storage = multer.diskStorage({
  destination:  __dirname + "/" +  'temp',
  filename: function (req, file, callback) {
    //..
  }
});

crypto.pseudoRandomBytes(16, function(err, raw) {
  if (err) return callback(err);

  callback(null, raw.toString('hex') + path.extname(file.originalname));
});

 
app.post('/', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    console.log("No file received");
    return res.send({
      success: false
    });

  } else {
    console.log('file received');
    const host = req.host;
    const filePath = req.protocol + "://" + host + '/' + req.file.path;
    return res.send({
      success: true
    })
  }
});


