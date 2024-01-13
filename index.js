require("dotenv").config(); 
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL)

//--------------------------------------------------------------------------------------------------------------------------------------------------



const express = require('express');
const app = express();
const session = require('express-session')
var path = require('path');
const nocache = require('nocache')


//view engine 

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');


app.use(express.static(path.join(__dirname,'public')))

app.use(express.urlencoded({extended:true}))
app.use(express.json());

app.use(nocache())

app.use(
    session({
        secret:process.env.SECRET,
        saveUninitialized:true,
        resave:true
    })
);


var userRouter =require('./routes/userRoute');
app.use('/',userRouter);


var adminRouter = require('./routes/adminRoute');
const { hydrate } = require('./models/userModel');
app.use('/admin',adminRouter)
  













const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})