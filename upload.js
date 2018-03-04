const replaceExt = require('replace-ext');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');
const express = require('express');
const serveStatic = require('serve-static');
const app = express();

app.locals.pretty = true;

const uploadDir = path.join(__dirname, 'upload');
const jsDir = path.join(__dirname, 'js');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir) // uppload to this dir
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //keep original file name
  }
})

const upload  = multer({storage: storage});

app.set('view engine', 'pug');

app.use('js', serveStatic(jsDir));
app.use('/uploaded', serveStatic(uploadDir));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.get('/',function(req,res){
  res.render('index', {content: fs.readdirSync(uploadDir)});
});

app.post('/upload', upload.single('uploadFile'), function(req, res) {
  if (!req.file)
    return res.status(400).send('No file has been uploaded.');
 
  let docFile = req.file.path;
  
  console.log("The file " + req.file.originalname + " has been uploaded to " + docFile);
 
  exec('asciidoctor-pdf -r asciidoctor-diagram ' + docFile, (err, stdout, stderr) => {
    if(err)
      return res.status(500).send(err);

    res.sendFile(replaceExt(docFile, '.pdf'));
  });    
});

app.post('/upload-extras', upload.any(), function(req, res){
  if(!req.files)
    return res.status(400).send('No files have been uploaded.');

  req.files.forEach(file => console.log('Uploaded file ' + file.path));
  
  res.render('index', {message: 'Files successfully uploaded.', content: fs.readdirSync(uploadDir)});
});

app.get('/purge', function(req, res){
  fs.readdirSync(uploadDir).forEach(file => fs.unlinkSync(path.join(uploadDir, file)));
  res.render('index', {message: 'Purged upload directory', content: fs.readdirSync(uploadDir)});
});
