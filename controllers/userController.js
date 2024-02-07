const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const UserOTPVerification = require('../models/userOTPVerification');
const nodemailer = require('nodemailer')
require("dotenv").config()
const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel')
const session = require('express-session');
const moment = require('moment')
const mongoose = require('mongoose')
const randomString = require('randomstring')


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
        const code = req.query.code;
        res.render('users/signup',{ code })
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
        const { name, email, mobileNumber,code } = req.body;
        console.log('cooooooooooodeeeeee:',code);
        if(code){
            req.session.referralCode = code;
        }
        const existUser = await User.findOne({ email: req.body.email })
        if (existUser && existUser.is_Verified) {

            const message = 'Email already registered'
            res.render('users/signup', { message: message, name, email, mobileNumber })



        }
        else {
            if (existUser) {
                // Delete the existing user with is_Verified: 0
                await existUser.deleteOne({ is_Verified: 0 });
            }
            const bodyPassword = req.body.password
            const sPassword = await securePassword(bodyPassword);
            const referralCode = generateReferralCode();
            console.log("Referral code:", referralCode);
            console.log(referralCode);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobileNumber,
                password: sPassword,
                confirmPassword: req.body.confirmPassword,
                is_Admin: 0,
                referralCode:referralCode
            })
            // console.log(req.body);


            // OTP VerificationEmail

            const userData = await user.save().then((result) => {
                sendOTPVerificationEmail(result, res);

            });
            console.log('userdata', userData);

            if (userData) {
                await sendOTPVerificationEmail({ email: userData.email, referralCode: req.session.referralCode }, res);
            }

        }
    } catch (error) {
        console.log(error.message);
    }
}

//______________generate referral code________

function generateReferralCode() {
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log("Generated referral code:", referralCode);
    return referralCode;
}


// send OTP Verification Email -------------------------------------------------------

const sendOTPVerificationEmail = async ({ email,referralCode }, res) => {
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

        const expiresIn = 1 * 60 * 1000;

        const expiresAt = Date.now() + expiresIn;

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



        res.redirect(`/verifyOTP?email=${email}&referralCode=${referralCode}`);

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
            const referralCode = req.session.referralCode;

            console.log('reeeeeeeeeeeeeeeeeeeeeeef',referralCode);
            const userId = req.session.userId;
            console.log('useeeeeeeeeeeeeerrrrrrrrrIIIIIIId',userId);


            if(referralCode){
                await User.findOneAndUpdate(
                    {referralCode:referralCode},
                    {
                        $inc:{wallet:200},
                        $push:{
                            wallet_history:{
                                date:new Date(),
                                amount:200,
                                description:`Referral Bonus for refferring ${User.user_name}`
                            }
                        }
                    }
                );
                await User.findOneAndUpdate(
                    {_id:userId},
                    {
                        $inc:{wallet:100},
                        $push:{
                            wallet_history:{
                                date:new Date(),
                                amount:100,
                                description:`Welcome Bonus for Using Referral link`
                            }
                        }
                    }
                )
            }

            res.redirect('/home')

        } else {
            res.render('users/verifyOTP', { message: 'OTP is incorrect', email })
        }


    } catch (error) {
        console.log(error.message);
    }
}

//---------------------------RESEND OTP-----------------------------------------

const resendOtp = async (req, res) => {
    try {
        const email = req.body.email
        console.log('resendemail:', email);
        await UserOTPVerification.deleteOne({ email: email })
        await sendOTPVerificationEmail({ email }, res)

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}




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
        const page = parseInt(req.query.page) || 1; 
        const limit = 8;
        const skip = (page - 1) * limit; 

        const allCategories = await Category.find({ is_listed: 1 }).populate('offer');
        const selectedCategoryId = req.query.category;

        let user;
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }

        let products;
        if (selectedCategoryId) {
            // Handle products by category
            const category = await Category.findById(selectedCategoryId);
            if (category && category.is_listed) {
                products = await Product.find({
                    category: selectedCategoryId,
                    is_listed: 1
                }).populate('category').populate('offer').skip(skip).limit(limit);
            } else {
                products = [];
            }
        } else {
            
            const listedCategoryIds = allCategories.map(category => category._id);
            products = await Product.find({
                'category': { $in: listedCategoryIds },
                is_listed: 1
            }).populate({ path: 'category', populate: { path: 'offer' } }).populate('offer').skip(skip).limit(limit);
        }

        const categories = await Category.find({ is_listed: 1 });

        
        const totalProductsCount = await Product.countDocuments({});
        const totalPages = Math.ceil(totalProductsCount / limit);

        res.render('users/shop', { products, allCategories, selectedCategoryId, User: user, categories, currentPage: page, totalPages });
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


        const product = await Product.findOne({ _id: productId }).populate({ path: 'category', populate: { path: 'offer' } }).populate('offer');
        
        if (product.offer) {
            // Calculate discounted price based on product's offer percentage
            let discount = Math.round(product.price * (product.offer.percentage / 100));
            product.offerPrice = product.price - discount;
            console.log('product offer price.........', product.offerPrice);
        } else if (product.category && product.category.offer) {
            // Calculate discounted price based on category's offer percentage
            let discount = Math.round(product.price * (product.category.offer.percentage / 100));
            product.offerPrice = product.price - discount;
            console.log('category offer price.........', product.offerPrice);
        } else {
            product.offerPrice = product.price;
            console.log('normal price', product.offerPrice);
        }

        res.render('users/shopSingleProduct', { product, User: user })
    } catch (error) {
        console.log(error.message);
    }
}


//----------------------------------------------------------------------------USER PROFILE-------------------------------------------------------


const loadUserProfile = async (req, res) => {
    try {
        let user;
        console.log('shop single', req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }

        res.render('users/userProfile', { User: user })
    } catch (error) {
        console.log(error.message);
    }
}

//------------------------------------------------EDIT USER PROFILE--------------------------------------------------------

const loadEditUserProfile = async (req, res) => {
    try {
        let user;

        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }



        res.render('users/editUserProfile', { User: user })
    } catch (error) {
        console.log(error.message);
    }
}

const postEditUserProfile = async (req, res) => {
    try {
        let user;

        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }
        const { name, mobile } = req.body
        console.log('bbbbbbbbbbbbb:', req.body);
        const editUser = await User.findByIdAndUpdate(
            user,
            {
                $set: {
                    name,
                    mobile,
                },
            },
            { new: true }
        )
        if (!editUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.redirect('/editUserProfile')
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

//--------------------------------------------------CHANGE PASSWORD----------------------------------------------------------------------------

const changePassword = async (req, res) => {
    try {
        const userId = req.session.userId;

        const user = await User.findById(userId);


        const { oldPassword, newPassword, confirmPassword } = req.body;



        const passwordMatch = await bcrypt.compare(oldPassword, user.password);

        if (!passwordMatch) {

            return res.render('users/userProfile', { User: user, message: 'Old password is incorrect.' });
        }


        if (newPassword !== confirmPassword) {
            return res.render('users/userProfile', { User: user, message: 'New password and confirm password do not match.' });
        }


        const hashedPassword = await bcrypt.hash(newPassword, 10);


        user.password = hashedPassword;
        await user.save();


        req.session.destroy();


        return res.redirect('/userProfile');
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

//--------------------------------------------ADDRESS MANAGEMENT(ADD ADDRESS/EDIT ADDRESS/DELETE ADDRESS/)----------------------------

const loadManageAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const userData = await User.findOne({ _id: userId });

        let user;

        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }


        res.render('users/addressManage', { user: userData, User: user })
    } catch (error) {
        console.log(error.message);
    }
}

//__________________________________________________________ADD ADDRESS__________________________________________

const addAddress = async (req, res) => {
    try {
        const { name, mobile, pincode, address, city, state, landmark, alternateMobile } = req.body

        console.log('bodyyyy:', req.body);


        console.log('User ID from session:', req.session.userId);
        const user = await User.findOne({ _id: req.session.userId })
        console.log('userrr:', user);

        if (user) {
            await User.updateOne(
                { _id: req.session.userId },
                {
                    $push: {
                        Address: {
                            name: name,
                            mobile: mobile,
                            pincode: pincode,
                            address: address,
                            city: city,
                            state: state,
                            landmark: landmark,
                            alternateMobile: alternateMobile
                        }
                    }
                }
            );
            // res.json({ success: true, message: "Address added successfully" });
            res.redirect('/addressManage')

        } else {
            res.status(400).json({ success: false, message: "User not found" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

//______________________________________EDIT ADDRESS____________________________________________________________

const editAddress = async (req, res) => {
    try {
        let user;

        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }

        if (!req.session.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }


        const { id, name, mobile, pincode, address, city, state, landmark, alternateMobile } = req.body
        console.log('bbbbbbbbbbbbb:', req.body);
        console.log('hahahha:', address)


        const updatedUser = await User.updateOne(
            { _id: user, "Address._id": id },

            {
                $set: {
                    'Address.$.name': name,
                    'Address.$.mobile': mobile,
                    'Address.$.pincode': pincode,
                    'Address.$.address': address,
                    'Address.$.city': city,
                    'Address.$.state': state,
                    'Address.$.landmark': landmark,
                    'Address.$.alternateMobile': alternateMobile,
                },
            },

        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address updated successfully', redirectUrl: '/addressManage' });

    } catch (error) {
        console.log(error.message);
    }
}

//_____________________________________DELETE ADDRESS________________________________________

const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addressId = req.body.id;

        const updatedUser = await User.updateOne(
            { _id: userId },
            { $pull: { Address: { _id: addressId } } }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address deleted successfully', redirectUrl: '/addressManage' });
    } catch (error) {
        console.log(error.message);
    }
}
//_______________________________________________________________________________________________________________________________________________


//_____________________________________FORGOT PASSWORD___________________________________________________

const forgotPassword = async (req, res) => {
    try {
        res.render('users/forgotPassword')
    } catch (error) {
        console.log(error.message);
    }
}

const sendResetPasswordEmail = async ({ email, token }, res) => {
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




        // mail options
        const mailOptions = {
            from: process.env.AUTH_MAIL,
            to: email,
            subject: "RESET PASSWORD - ZENDEN SOFA",
            html: `<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

            <h1 style="color: #3498db; text-align: center; font-size: 24px;"> ZENDEN SOFA</h1>
        
            <p style="text-align: center; font-size: 18px; color: #555;">Dear User,</p>
        
            <p style="text-align: center; font-size: 16px; color: #555;">Thank you for signing up with Zenden Sofa. To Reset your Password, please go through the Provided Link :</p>
        
            <p style="color: #2ecc71; text-align: center; font-size: 36px; margin: 20px 0;"><a href="http://localhost:4000/resetPassword?token=${token}" style="text-decoration: none; color: #2ecc71;">Reset Your Password Here</a></p>
        
            <p style="text-align: center; font-size: 16px; color: #555;"> If you did not initiate this action, please ignore this email.</p>
        
            <p style="text-align: center; font-size: 16px; color: #555; margin-bottom: 20px;"></p>
        
            <p style="text-align: center; font-size: 16px; color: #555;">If you have any questions or concerns, please contact our team.</p>
        
            <p style="text-align: center; font-size: 16px; margin: 20px 0; color: #555;">Best regards,<br>Zenden Sofa</p>
        
        </div>
        `
        }




        await transporter.sendMail(mailOptions);
        console.log('Reset otp mail', email);
        console.log(token);



    } catch (error) {
        console.log(error.message);
    }
}

const forgotVerify = async (req, res) => {
    try {
        const email = req.body.email
        const userData = await User.findOne({ email: email })
        if (userData) {

            if (userData.is_Verified === 0) {
                res.render('users/forgotPassword', { message: "Please Complete Your registration Process." })
            }
            else {
                const randomstring = randomString.generate()
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomstring } })
                sendResetPasswordEmail({ email: userData.email, token: randomstring });
                res.render('users/forgotPassword', { message: "Please Check Your Mail to reset Your Password." })
            }
        }
        else {
            res.render('users/forgotPassword', { message: "User email is incorrect." })
        }
    } catch (error) {
        console.log(error.message)
    }
}


const resetPassword = async (req, res) => {
    try {
        const token = req.query.token
        const tokenData = await User.findOne({ token: token })
        if (tokenData) {
            res.render('users/resetPassword', { _id: tokenData._id, token: token })
        }
        else {
            res.render('404', { message: 'Token is invalid.' })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const resetPasswordVerify = async (req, res) => {
    try {
        const { _id, newPassword, confirmNewPassword } = req.body
        console.log('req.body', req.body);
        if (newPassword !== confirmNewPassword) {
            return res.render('users/resetPassword', { _id, message: 'Passwords do not match' });
        }
        const newPasswordHash = await securePassword(newPassword)
        await User.updateOne({ _id }, { $set: { password: newPasswordHash } });
        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
    }
}


//____________________________________________________________________WALLET________________________________________________________

const loadWallet = async(req,res) => {
    try {
        const userId = req.session.userId
        console.log('wallet session:',userId);
        const user = await User.findOne({_id: userId})
        res.render('users/wallet',{user,moment})
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
    resendOtp,
    verifyLogin,
    logoutUser,
    loadShop,
    loadProductDetails,
    loadBlockedUser,
    loadUserProfile,
    loadEditUserProfile,
    postEditUserProfile,
    loadManageAddress,
    editAddress,
    deleteAddress,
    addAddress,
    changePassword,
    forgotPassword,
    forgotVerify,
    resetPassword,
    resetPasswordVerify,
    loadWallet


}