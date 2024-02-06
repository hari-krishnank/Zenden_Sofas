const User = require('../models/userModel')
const bcrypt = require('bcrypt')



//-----------------------------Login------------------------------------------

const adminLogin = async(req,res) =>{
    try {
        res.render('admin/login')
    } catch (error) {
        console.log(error.message);
    }
}


//------------------------Verify Login-------------------------------------------------

const adminLoginVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        console.log('admin', email);
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_Admin === 1) {
                    req.session.admin = userData;
                    res.redirect('/admin/dashboard');
                }
            } else {
                res.render('admin/login', { message: 'Incorrect password or email' });
            }
        } else {
            res.render('admin/login', { message: 'Admin not Found' });
        }

    } catch (error) {
        console.log(error.message);
    }
};
//----------------------------------LOGOUT--------------------------------------------

const adminLogout = async(req,res)=>{
    try {
        req.session.admin = null;
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}




//----------------------------------LIST USERS--------------------------------------------------

const userManagement = async(req,res)=>{
    try {
        const users = await User.find();
        
        res.render('admin/userManagement',{users})
    } catch (error) {
        console.log(error.message);
    }
}

//------------------------------------Block Users------------------------------------------------------

const blockUser = async(req,res)=>{
    try {
        const {id} = req.query;
        const user = await User.findById({_id:id});
        if( user.isBlocked === 0 ) {  
            await User.findByIdAndUpdate({_id:id}, {$set: { isBlocked: 1 }})
            res.redirect('/admin/users');
        } else {
            await User.findByIdAndUpdate({_id:id}, {$set: { isBlocked: 0 }});
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    adminLogin,
    adminLoginVerify,
    adminLogout,
    userManagement,
    blockUser
}