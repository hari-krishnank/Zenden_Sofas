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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.use(nocache())

app.use(
    session({
        secret: process.env.SECRET,
        saveUninitialized: true,
        resave: true
    })
);


var userRouter = require('./routes/userRoute');
app.use('/', userRouter);


var adminRouter = require('./routes/adminRoute');
const { hydrate } = require('./models/userModel');
app.use('/admin', adminRouter)




app.get('/500', (req, res) => {
    res.status(500).render('users/500');
})

app.get('*', (req, res) => {

    res.status(404).render('users/404');

});









const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})