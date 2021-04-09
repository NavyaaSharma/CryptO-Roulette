const requestIp = require('request-ip');
const User=require('../models/user');
const router = require('./cipher');

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
        res.status(400).send({"error":"Invalid email or password"})
    }
})

module.exports=router;