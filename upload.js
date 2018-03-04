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

app.use('/js', serveStatic(jsDir));
app.use('/uploaded', serveStatic(uploadDir));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.get('/',function(req,res){
  index(res);
});

app.get('/2pdf/:file', function(req, res){
  var docFile = path.join(uploadDir, req.params.file);

  exec('asciidoctor-pdf -r asciidoctor-diagram ' + docFile, (err, stdout, stderr) => {
    if(err)
      return res.status(500).send(err);

    res.sendFile(replaceExt(docFile, '.pdf'));
  });
});

app.post('/upload', upload.any(), function(req, res){
  if(!req.files)
    return res.status(400).send('No files have been uploaded.');

  req.files.forEach(file => console.log('Uploaded file ' + file.path));
  
  index(res, 'Files successfully uploaded.');
});

app.get('/purge', function(req, res){
  fs.readdirSync(uploadDir).forEach(file => fs.unlinkSync(path.join(uploadDir, file)));
  index(res, 'Purged upload directory');
});

function index(res, message) {
  var files = [];

  fs.readdirSync(uploadDir).forEach(file => files.push(forView(file)));

  res.render('index', {message: message, content: files});
}

function forView(file) {
  return {path: file, isAsciidoc: isAsciidoc(file)};
}

function isAsciidoc(file) {
  return file.toLowerCase().endsWith('.adoc') || file.toLowerCase().endsWith('asciidoc');
}
