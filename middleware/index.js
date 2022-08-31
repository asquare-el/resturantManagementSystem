const jwt = require('jsonwebtoken')
const pool  = require('../db');


module.exports.authenticateToken = (req,res, next)=>
{
    const authHeader = req.headers['autherization']
    
    if(authHeader== null) return res.status(401).send('login first')

    jwt.verify(authHeader, process.env.ACCESS_TOKEN, async (err,user) =>
    {
        if(err) return res.status(403).send('access had been denied');
        req.user=user
        console.log(req.user)
        let isInvalidToken= await pool.query(`select end_time from sessions where s_id='${req.user.sessionID}'`);
        if(isInvalidToken.rows[0].endtime!=null)
        {return res.send("session has expired. please login again");}

        next();
        
    
    })
}


