const errorHandling = require('../error/errorHandling')

exports.errorHandler = (error, req, res, next) =>{
    if(error instanceof errorHandling){
        return res.status(error.statusCode).json({message:error.message,error:error.error})
    }
    console.log(error)
    return res.status(500).send("something went wrong")
}