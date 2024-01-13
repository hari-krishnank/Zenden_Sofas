const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const UserOTPVerification = require('../models/userOTPVerification');
const nodemailer = require('nodemailer')
require("dotenv").config()
const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const session = require('express-session');


const userHome = async (req, res) => {
    try {
        const id = req.session.userId;
        const userData = await User.findOne({ _id: id })

        res.render('users/home', { User: userData, currentRoute: '/' })
    } catch (error) {
        console.log(error.message);
    }
}



const loadRegister = async (req, res) => {
    try {
        res.render('users/signup')
    } catch (error) {
        console.log(error.message);
    }
}


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const verifyRegister = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, mobileNumber, password } = req.body;
        const existUser = await User.findOne({ email: req.body.email })
        if (existUser && existUser.is_Verified) {

            const message = 'Email already registered'
            res.render('users/signup', { message: message, name, email, mobileNumber })

        } else if (existUser && !existUser.is_Verified) {
            await existUser.deleteOne({ is_Verified: 0 });
            const message = 'Email already registered but not verified. Please Complete your registration Process Properly.';
            res.render('users/signup', { message: message, name, email, mobileNumber });

        } else {
            const bodyPassword = req.body.password
            const sPassword = await securePassword(bodyPassword);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobileNumber,
                password: sPassword,
                confirmPassword: req.body.confirmPassword,
                is_Admin: 0,
            })
            // console.log(req.body);


            // OTP VerificationEmail

            const userData = await user.save().then((result) => {
                sendOTPVerificationEmail(result, res);

            });

            if (userData) {
                await sendOTPVerificationEmail(userData.email)
            }

        }
    } catch (error) {
        console.log(error.message);
    }
}


// send OTP Verification Email -------------------------------------------------------

const sendOTPVerificationEmail = async ({ email }, res) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            auth: {
                user: process.env.AUTH_MAIL,
                pass: 'fcla dstr shiu uboi'
            }
        })


        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        console.log('email:', email);
        console.log('from:', process.env.AUTH_MAIL);

        const expiresIn = 2*60*1000;

        const expiresAt = Date.now()+expiresIn;

        // mail options
        const mailOptions = {
            from: process.env.AUTH_MAIL,
            to: email,
            subject: "OTP VERIFICATION - ZENDEN SOFA",
            html: `<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

            <h1 style="color: #3498db; text-align: center; font-size: 24px;"> ZENDEN SOFA</h1>
        
            <p style="text-align: center; font-size: 18px; color: #555;">Dear User,</p>
        
            <p style="text-align: center; font-size: 16px; color: #555;">Thank you for signing up with Zenden Sofa. To verify your account, please enter the following OTP (One-Time Password):</p>
        
            <h2 style="color: #2ecc71; text-align: center; font-size: 36px; margin: 20px 0;">${otp}</h2>
        
            <p style="text-align: center; font-size: 16px; color: #555;">This OTP is valid for 2 minutes. If you did not initiate this action, please ignore this email.</p>
        
            <p style="text-align: center; font-size: 16px; color: #555; margin-bottom: 20px;">For security reasons, do not share your OTP with anyone.</p>
        
            <p style="text-align: center; font-size: 16px; color: #555;">If you have any questions or concerns, please contact our team.</p>
        
            <p style="text-align: center; font-size: 16px; margin: 20px 0; color: #555;">Best regards,<br>Zenden Sofa</p>
        
        </div>
        `
        }

        //hash otp
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = await new UserOTPVerification({
            email: email,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: expiresAt,
        })

        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);



        res.redirect(`/verifyOTP?email=${email}`);

    } catch (error) {
        console.log(error.message);
    }
}

//----------------------------------------------------------------------------------------

const loadOtpPage = async (req, res) => {
    try {
        const email = req.query.email

        res.render('users/verifyOTP', { email: email })
    } catch (error) {
        console.log(error.message);
    }
}


//--------------VERIFY OTP---------------------------------------------------------------------

const verifyOtp = async (req, res) => {
    try {
        const email = req.body.email;
        console.log('email:', email);
        const otp = req.body.one + req.body.two + req.body.three + req.body.four

        console.log('otp:', otp);
        const user = await UserOTPVerification.findOne({ email: email })
        console.log('user:', user);

        if (!user || user.expiresAt < Date.now()) {
            res.render('users/verifyOTP', { message: 'OTP expired', email });
            return;
        }
        const { otp: hashedOTP } = user;
        const validOtp = await bcrypt.compare(otp, hashedOTP)
        console.log(validOtp);

        if (validOtp === true) {
            const userData = await User.findOne({ email: email })


            await User.findByIdAndUpdate({ _id: userData._id }, { $set: { is_Verified: 1 } })
            await UserOTPVerification.deleteOne({ email: email })

            req.session.userId = userData._id



            res.redirect('/home')

        } else {
            res.render('users/verifyOTP', { message: 'OTP is incorrect', email })
        }


    } catch (error) {
        console.log(error.message);
    }
}

//---------------------------RESEND OTP-----------------------------------------

// const resendOtp = async(req,res) => {
//     try {
//         const email = req.body.email
//         await sendOTPVerificationEmail({email},res)
//     } catch (error) {
//         console.log(error.message);
//     }
// }


//------------------------------------LOGIN-----------------------------------------------------------------------

const userLogin = async (req, res) => {
    try {
        res.render('users/login')
    } catch (error) {
        console.log(error.message);
    }
}

//-----------------------------VERIFYLOGIN--------------------------------------------------------------
const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        const user = await User.findOne({ email: email });
        console.log(user);
        let message = '';

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                if (user.is_Verified === 1) {
                    req.session.userId = user._id;
                    return res.redirect('/home');
                } else {
                    await user.deleteOne({ is_Verified: 0 });
                    message = 'User not found. Please Register.';
                    return res.render('users/login', { message, email });
                }
            } else {
                message = 'Email or password is incorrect';
                return res.render('users/login', { message, email, password });
            }
        } else {
            message = 'You are not registered';
            return res.render('users/login', { message, email, password });
        }
    } catch (error) {
        console.log(error.message);
    }
};
//--------------------------------LOGOUT--------------------------------------------------------

const logoutUser = async (req, res) => {
    try {

        req.session.userId = null;
        res.redirect('/')

    } catch (error) {
        console.log(error.message);
    }
}

//-----------------------------BLOCK USER----------------------------------------------------

const loadBlockedUser = async (req, res) => {
    try {
        res.render('users/blockedUser');

    } catch (error) {
        console.log(error.message);
    }
}


//-------------------------------------------SHOP-----------------------------------------------------



const loadShop = async (req, res) => {
    try {
        const allCategories = await Category.find({ is_listed: 1 });
        const selectedCategoryId = req.query.category;

        let user;
        console.log(req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }

        let products;
        if (selectedCategoryId) {
            const category = await Category.findById(selectedCategoryId);
            if (category && category.is_listed) {
                products = await Product.find({
                    category: selectedCategoryId,
                    is_listed: 1
                }).populate('category');
            } else {
                products = [];
            }
        } else {
            const listedCategoryIds = allCategories.map(category => category._id);
            products = await Product.find({
                'category': { $in: listedCategoryIds },
                is_listed: 1
            }).populate('category');
        }
        const categories = await Category.find({ is_listed: 1 });
        res.render('users/shop', { products, allCategories, selectedCategoryId, User: user, categories });
    } catch (error) {
        console.log(error.message);
    }
};


const loadProductDetails = async (req, res) => {
    try {
        let user;
        console.log('shop single', req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }


        const productId = req.query.productId;
        console.log('ProductId:', productId);


        const product = await Product.findOne({ _id: productId }).populate('category')

        res.render('users/shopSingleProduct', { product, User: user })
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    userHome,
    userLogin,
    loadRegister,
    verifyRegister,
    loadOtpPage,
    verifyOtp,
    verifyLogin,
    logoutUser,
    loadShop,
    loadProductDetails,
    loadBlockedUser
}