var express= require('express')
var bodyParser=require('body-parser')
var cors=require('cors')
var app=express()

var port=process.env.PORT || 8000

var mongoose = require('mongoose')
mongoose.connect(process.env.db, {
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology:true
})
app.use(bodyParser.urlencoded({
    extended:false
}))
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
  });

var cipherRoutes=require('./routes/cipher')
var userRoutes=require('./routes/auth')

app.use('/api',cipherRoutes)
app.use('/api',userRoutes)

app.listen(port,()=>{
    console.log('Server started')
})