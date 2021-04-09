var express=require('express')
var router=express.Router();
const crypto = require("crypto")
var CryptoJS = require("crypto-js");

var cipher=""
function algo(rand,lo,up)
{
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

router.get('/encrypt',async(req,res)=>{

    var text=req.body.text;
    var length=text.length;
    var range=Math.floor(length/4);
    var prev=0;

    for(var i=0;i<4;i++)
    {
        var rand=Math.floor(Math.random()*4)+1;
        var lo=prev;
        var up;
        if(lo+range<length)
        {
            up=lo+range;
        }
        else
        {
            up=length;
        }
        prev=up;
        algo(rand,lo,up);
    }

    res.status(200).json({data:cipher});
})

router.get('/decrypt',async(req,res)=>{
    var str = req.body.text;
    var prev=0;
    var ansText=""
    for(var i=0; i<str.length;i++) {
        if (str[i] === "@")
        {
            if(str[i+1]=='1')
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
            else if(str[i+1]=='2')
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
            else if(str[i+1]=='3')
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
            if(str[i+1]=='4')
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
