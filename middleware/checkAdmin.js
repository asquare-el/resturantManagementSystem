const pool  = require('../db');

module.exports.checkAdmin = (req,res,next)=>
{
    if(req.user.role=="admin")
        { 
            next();
        }
    else
    {
        res.send("You are not admin")
    }
}

