const requestIp = require('request-ip');
const User=require('../models/user');
const router = require('./cipher');
const otpGenerator=require('otp-generator')
const sgMail = require('@sendgrid/mail'); // SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/user/create',async(req,res)=>{
    const user=new User(req.body)
    try{
        await user.save()
        res.status(201).json({data:user})
    }
    catch{
        res.status(400).json()
    }
})

router.post('/user/login',async(req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateToken()
        if(!user)
        {
            res.status(404).json()
        }
        else
        {
            const clientIp = requestIp.getClientIp(req); 
            if(user.ip=="")
            {
                
                user.ip=clientIp;
                var currentdate = new Date(); 
                var datetime =  currentdate.getDate() + "/"
                                + (currentdate.getMonth()+1)  + "/" 
                                + currentdate.getFullYear() + " @ "
                                + currentdate.getHours() + ":"
                                + currentdate.getMinutes() + ":" 
                                + currentdate.getSeconds();
                user.lastLogin=datetime
                await user.save()
                res.status(200).json({token,user})
            }
            else if(user.ip==clientIp)
            {
                var currentdate = new Date(); 
                var datetime =  currentdate.getDate() + "/"
                                + (currentdate.getMonth()+1)  + "/" 
                                + currentdate.getFullYear() + " @ "
                                + currentdate.getHours() + ":"
                                + currentdate.getMinutes() + ":" 
                                + currentdate.getSeconds();
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
            return res.json({
                message: `OTP has been sent to ${email}.`
            });
        });
    }
    catch{
        res.status(400).json({error:"Invalid email"})
    }
})

router.get('/verify/otp',async(req,res)=>{
    try
    {
        var otp=req.query.otp
        var user=User.findOne({email:req.query.email});
        if(!user)
            {
                res.status(404).json()
            }
        if(otp==user.otp)
        {
            res.status(200).json({message:"OTP verified"})
        }
    }
    catch{
        res.status(400).json({error:"Invalid email"})
    }
})

module.exports=router;