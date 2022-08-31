const express = require('express');
const app=express();
const userRoutes=require('./routes/user')
const adminRoutes=require('./routes/admin')
const subadminRoutes=require('./routes/subadmin')
const errorHandler= require('./middleware/errorHandlingMiddleware')

app.use(express.json());
app.use('/user',userRoutes)
app.use('/admin',adminRoutes)
app.use('/subadmin',subadminRoutes)
app.use(errorHandler.errorHandler)


app.listen(3000,()=>{

    console.log("listening on port no 3000!");
})
