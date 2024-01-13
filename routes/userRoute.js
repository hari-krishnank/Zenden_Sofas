var express = require('express');
var userRouter = express.Router();
const userController = require('../controllers/userController')
const userauth = require('../middlewares/userAuth')
const cartController = require('../controllers/cartController')
const checkoutController = require('../controllers/checkoutController')

userRouter.get('/home', userauth.checkBlocked, userauth.isLogin, userController.userHome)
userRouter.get('/', userauth.isLogout, userController.userHome)

userRouter.get('/signup', userauth.isLogout, userController.loadRegister)
userRouter.post('/signup', userController.verifyRegister)

userRouter.get('/verifyOTP', userauth.isLogout, userController.loadOtpPage)
userRouter.post('/verifyOTP', userController.verifyOtp)
// userRouter.post('/resendOtp',userController.resendOtp)

// userRouter.post('/admin/resendOtp',userController.resendOtp)
userRouter.get('/login', userauth.isLogout, userController.userLogin)
userRouter.post('/login', userController.verifyLogin)

userRouter.get('/blockedUser', userauth.isLogin, userController.loadBlockedUser)

userRouter.get('/logout', userauth.isLogin, userController.logoutUser)

userRouter.get('/shop', userauth.checkBlocked, userController.loadShop)


userRouter.get('/singleProduct', userController.loadProductDetails)

userRouter.get('/cart',userauth.checkBlocked,userauth.isLogin,cartController.loadCart)

userRouter.post('/addToCart',cartController.addToCart)

userRouter.post('/quantityUpdate',cartController.quantityUpdate)

userRouter.post('/deleteItems',cartController.deleteItems)


userRouter.get('/checkout',checkoutController.loadCheckout)

userRouter.post('/checkout',checkoutController.addNewAddress)

userRouter.get('/orderSuccess',checkoutController.loadOrderSuccess)

module.exports = userRouter;      