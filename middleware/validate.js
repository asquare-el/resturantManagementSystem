const joi = require("joi")

module.exports.validateRegister = (req,res,next)=>{
    const validation = joi.object({
        name: joi.string().alphanum().min(3).max(25).trim(true).required(),
        email_id: joi.string().email().trim(true).required(),
        password: joi.string().min(2).trim(true).required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}


module.exports.validatelogin = (req,res,next)=>{
    const validation = joi.object({
        email_id: joi.string().email().trim(true).required(),
        password: joi.string().min(2).trim(true).required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}
 
module.exports.validateAddress = (req,res,next)=>{
    const validation = joi.object({
        addr: joi.string().alphanum().min(3).max(50).trim(true).required(),
        geopoint: joi.string().required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}

module.exports.validateResturant = (req,res,next)=>{
    const validation = joi.object({
        res_name: joi.string().min(3).max(25).trim(true).required(),
        res_addr: joi.string().min(3).max(25).trim(true).required(),
        geopoint: joi.string().required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}
module.exports.validateDish = (req,res,next)=>{
    const validation = joi.object({
        dish_name: joi.string().alphanum().min(3).max(25).trim(true).required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}




