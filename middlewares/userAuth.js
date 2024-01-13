const User = require('../models/userModel')

const isLogin = async (req, res, next) => {

    try {
        console.log('my_session', req.session.userId);

        if (req.session.userId) {

            if (req.path === '/login') {
                res.redirect('/home')
                return;
            }

            next();
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }
} 


const isLogout = async(req,res,next) =>{
    try {
        console.log('my_session',req.session.userId);

        if(req.session.userId){
            res.redirect('/home')
            return;
        }
        next();

    } catch (error) {
        console.log(error.message);
    }
}

const checkBlocked = async(req,res,next) => {
    const userId = req.session.userId;
    if(userId){
        try {
            const user = await User.findOne({_id:userId})
            if(user && user.isBlocked ==1){
                return res.redirect('/blockedUser');
            }
        } catch (error) {
            console.log(error.message);
        }
    }
    next();
}


module.exports = {
    isLogin,
    isLogout,
    checkBlocked
}
