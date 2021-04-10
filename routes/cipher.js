var express=require('express')
var router=express.Router();
const crypto = require("crypto")
var CryptoJS = require("crypto-js");

router.get('/encrypt',async(req,response)=>{

    var text=req.query.text;
    var length=text.length;
    var range=Math.floor(length/4);
    var prev=0;
    var cipher="";
    for(var i=0;i<4;i++)
    {
        var rand=Math.floor(Math.random()*4)+1;
        var lo=prev;
        var up;
        if(i==3)
        {
            up=length;
        }
        else
        {
            up=lo+range;
        }
        prev=up;
        if(rand==1)
        {
            var msg=text.substring(lo,up);
            var key="abcde"
            var res=CryptoJS.AES.encrypt(JSON.stringify(msg),key).toString();
            cipher+=res+"@"+rand;
        }
        else if(rand==2)
        {
            var msg=text.substring(lo,up);
            var key="abcde"
            var res=CryptoJS.TripleDES.encrypt(JSON.stringify(msg),key).toString();
            cipher+=res+"@"+rand;
        }
        else if(rand==3)
        {
            var msg=text.substring(lo,up);
            var key="abcde";
            var res=CryptoJS.Rabbit.encrypt(JSON.stringify(msg),key).toString()
            cipher+=res+"@"+rand;
        }
        else if(rand==4)
        {
            var msg=text.substring(lo,up);
            var key="abcde";
            var res=CryptoJS.RC4.encrypt(JSON.stringify(msg),key).toString();
            cipher+=res+"@"+rand;
        }
    }

    response.status(200).json({data:cipher});
})

router.get('/decrypt',async(req,res)=>{
    var cipher = req.query.text;
    var prev=0;
    var ansText=""
    for(var i=0; i<cipher.length;i++) {
        if (cipher[i] === "@")
        {
            if(cipher[i+1]=='1')
            {
                var msg=cipher.substring(prev,i);
                // console.log(msg)
                var key='abcde';
                var decrypt=CryptoJS.AES.decrypt(msg,key);
                var obj=JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
                ansText+=obj;
                // console.log(prev,i);
                prev=i+2;
            }
            else if(cipher[i+1]=='2')
            {
                var msg=cipher.substring(prev,i);
                // console.log(msg)
                var key='abcde';
                var decrypt=CryptoJS.TripleDES.decrypt(msg,key);
                var obj=JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
                ansText+=obj;
                // console.log(prev,i);
                prev=i+2;
            }
            else if(cipher[i+1]=='3')
            {
                var msg=cipher.substring(prev,i);
                // console.log(msg)
                var key='abcde';
                var decrypt=CryptoJS.Rabbit.decrypt(msg,key);
                var obj=JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
                ansText+=obj;
                // console.log(prev,i);
                prev=i+2;
            }
            if(cipher[i+1]=='4')
            {
                var msg=cipher.substring(prev,i);
                // console.log(msg)
                var key='abcde';
                var decrypt=CryptoJS.RC4.decrypt(msg,key);
                var obj=JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
                ansText+=obj;
                // console.log(prev,i);
                prev=i+2;
            }
        }
    }
    res.status(200).json({data:ansText});
})

module.exports=router;
