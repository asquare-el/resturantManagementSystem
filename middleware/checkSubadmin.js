const pool  = require('../db');

module.exports.checkSubadmin = (req,res,next)=>
{
    if(req.user.role=="subadmin")
        { 
            next();
        }
    else
    {
        res.send("You are not subadmin")
    }
}