var express= require('express')
var bodyParser=require('body-parser')
var cors=require('cors')
var app=express()

var port=process.env.PORT || 8000

var cipherRoutes=require('./routes/cipher')

app.use(bodyParser.json())
app.use(cors())

app.use('/api',cipherRoutes)

app.listen(port,()=>{
    console.log('Server started')
})