var express = require('express');
var userRouter = express.Router();
const userController = require('../controllers/userController')
const userauth = require('../middlewares/userAuth')
const cartController = require('../controllers/cartController')
const checkoutController = require('../controllers/checkoutController')
const orderController = require('../controllers/orderController')
const wishlistController = require('../controllers/wishlistController')
const couponController = require('../controllers/couponController')

userRouter.get('/home', userauth.checkBlocked, userauth.isLogin, userController.userHome)
userRouter.get('/', userauth.isLogout, userController.userHome)

userRouter.get('/signup', userauth.isLogout, userController.loadRegister)
userRouter.post('/signup', userController.verifyRegister)

userRouter.get('/verifyOTP', userauth.isLogout, userController.loadOtpPage)
userRouter.post('/verifyOTP', userController.verifyOtp)  
userRouter.post('/resendOtp',userController.resendOtp)


userRouter.get('/login', userauth.isLogout, userController.userLogin)
userRouter.post('/login', userController.verifyLogin)

userRouter.get('/forgotPassword',userauth.isLogout,userController.forgotPassword)
userRouter.post('/forgotPassword',userauth.isLogout,userController.forgotVerify)
userRouter.get('/resetPassword',userauth.isLogout,userController.resetPassword)
userRouter.post('/resetPassword',userauth.isLogout,userController.resetPasswordVerify)

userRouter.get('/blockedUser', userauth.isLogin, userController.loadBlockedUser)

userRouter.get('/logout', userauth.isLogin, userController.logoutUser)

userRouter.get('/shop', userauth.checkBlocked, userController.loadShop)

userRouter.get('/about',userauth.checkBlocked,userController.loadAbout)

userRouter.get('/contact',userauth.checkBlocked,userController.loadContact)


userRouter.get('/singleProduct',userauth.checkBlocked, userController.loadProductDetails)

userRouter.get('/cart',userauth.checkBlocked,userauth.isLogin,cartController.loadCart)

userRouter.post('/addToCart',userauth.checkBlocked,cartController.addToCart)

userRouter.post('/quantityUpdate',userauth.checkBlocked,cartController.quantityUpdate)

userRouter.post('/deleteItems',userauth.checkBlocked,cartController.deleteItems)


userRouter.get('/checkout',userauth.checkBlocked, userauth.isLogin,checkoutController.loadCheckout)

userRouter.post('/checkout',userauth.checkBlocked,checkoutController.addNewAddress)

userRouter.post('/applyCoupon',couponController.applyCoupon)

userRouter.get('/orderSuccess/:id',userauth.checkBlocked, userauth.isLogin,checkoutController.loadOrderSuccess)



userRouter.post('/placeOrder',userauth.checkBlocked,checkoutController.placeOrder)
userRouter.post('/verify-payment',userauth.checkBlocked,checkoutController.verifyPayment)

userRouter.get('/userProfile', userauth.isLogin,userauth.checkBlocked,userController.loadUserProfile)

userRouter.get('/editUserProfile', userauth.isLogin,userauth.checkBlocked,userController.loadEditUserProfile)
userRouter.post('/editUserProfile',userauth.checkBlocked,userController.postEditUserProfile)
 


userRouter.post('/changePassword',userauth.checkBlocked,userController.changePassword)

userRouter.get('/userOrders', userauth.isLogin,userauth.checkBlocked,orderController.loadOrderDetails)

userRouter.get('/orderSingle', userauth.isLogin,userauth.checkBlocked,orderController.loadOrderSingle)

userRouter.get('/addressManage', userauth.isLogin,userauth.checkBlocked,userController.loadManageAddress)

userRouter.post('/addressManage',userauth.checkBlocked,userController.loadManageAddress)

userRouter.post('/addAddress',userauth.checkBlocked,userController.addAddress)

userRouter.post('/editAddress',userauth.checkBlocked,userController.editAddress)

userRouter.post('/deleteAddress', userauth.isLogin,userauth.checkBlocked,userController.deleteAddress)



userRouter.post('/cancelOrder', userauth.isLogin,userauth.checkBlocked,orderController.cancelOrder)

userRouter.post('/returnOrder',userauth.checkBlocked,orderController.returnOrder)


userRouter.get('/wishlist',userauth.checkBlocked,userauth.isLogin,wishlistController.loadWishlist)

userRouter.post('/wishlist',userauth.isLogin,userauth.checkBlocked,wishlistController.addToWishlist)

userRouter.post('/deleteWishlistProduct',userauth.isLogin,userauth.checkBlocked,wishlistController.deleteWishlistProduct)


userRouter.get('/wallet',userauth.isLogin,userController.loadWallet)

module.exports = userRouter;      