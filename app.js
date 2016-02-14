var express = require('express')
var app = express()

app.use(express.static('./public'))

app.set('view engine', 'html')

var indexRouter = require('./routes/index');
app.use('/', indexRouter);
var port = 8080;
app.listen(port, function(){
  console.log("listening on port "+port);
})
