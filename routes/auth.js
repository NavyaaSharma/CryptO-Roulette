const requestIp = require('request-ip');
const User=require('../models/user');
const router = require('./cipher');
const otpGenerator=require('otp-generator')
const sgMail = require('@sendgrid/mail'); // SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

Date.prototype.getCurrentTime = function(){
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds() + ((this.getHours()>12)?(' PM'):' AM');
    };

router.post('/user/create',async(req,res)=>{
    var obj={
        name:req.query.name,
        email:req.query.email,
        password:req.query.password
    }
    console.log(obj)
    const user=new User(obj)
    try{
        await user.save()
        res.status(201).json({data:user})
    }
    catch(e){
        res.status(400).json(e)
    }
})

router.post('/user/login',async(req,res)=>{
    try{
        const user=await User.findByCredentials(req.query.email,req.query.password)
        const token=await user.generateToken()
        if(!user)
        {
            res.status(404).json()
        }
        else
        {
            const clientIp = requestIp.getClientIp(req); 
            if(user.ip.length==0)
            {
                
                user.ip.push(clientIp);
                var today = new Date(); // Sun Dec 22 2019 13:18:01 GMT+0530 (India Standard Time)
                var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var datetime = date + ' at ' + time;
                user.lastLogin=datetime
                await user.save()
                res.status(200).json({token,user})
            }
            var userIp=user.ip.find(function(element){
                return element==clientIp
            })
            console.log(clientIp)
            if(userIp!=undefined)
            {
                var today = new Date(); // Sun Dec 22 2019 13:18:01 GMT+0530 (India Standard Time)
                var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var datetime = date + ' at ' + time;
                user.lastLogin=datetime
                await user.save()
                res.status(200).json({token,user})
            }
            else
            {
                res.status(401).json({error:"Acces Denied as we noticed a request from a unknown source. Please verify yourself to contine."})
            }
        }
    }
    catch{
        res.status(400).json({error:"Invalid email or password"})
    }
})

router.post('/send/mail',async(req,res)=>{
    try
    {
        var email=req.query.email
        console.log(email)
        var user=await User.findOne({email:req.query.email});
        if(!user)
            {
                res.status(404).json()
            }
        var otp=otpGenerator.generate(6, { specialChars: false });
        user.otp=otp
        await user.save();
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Confirm Your Identity`,
            html: `
            <p>We detected an usual login to your system from an unknown source. Last login attempt was made
            at ${user.lastLogin} from ${user.location}. IP detected was ${user.ip}.
            <p>The attempt was blocked by us, to continue please use the following OTP to confirm your identity :</p>
            <h3><b>${otp}</h3>  
        `
        };

        sgMail.send(emailData).then(sent => {
            console.log(emailData)
            console.log(sent)
            return res.json({
                message: `OTP has been sent to ${email}.`
            });
        });
    }
    catch{
        res.status(400).json({error:"Invalid email"})
    }
})
router.get('/verify',async(req,res)=>{
    try
    {
        var otp=req.query.otp
        console.log(otp)
        console.log(req.query.email)
        var user=await User.findOne({email:req.query.email});
        if(!user)
            {
                res.status(404).json()
            }
        console.log(user)
        if(otp==user.otp)
        {
            const clientIp = requestIp.getClientIp(req); 
            user.ip.push(clientIp)
            console.log('fg')
            await user.save()
            res.status(200).json({message:"OTP verified"})
        }
        else
        {
            res.status(401).json({message:"Wrong OTP"})
        }
    }
    catch(e){
        res.status(400).json({e})
    }
})

module.exports=router;