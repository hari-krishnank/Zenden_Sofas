
const Coupon = require('../models/couponModel')
const moment = require('moment')

const loadCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.render('admin/coupon', { coupons })
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddCoupon = async (req, res) => {
    try {
        res.render('admin/addCoupon')
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async (req, res) => {
    try {
        const { couponName, couponCode, discountAmount, minAmount, couponDescription, quantity, expiryDate } = req.body;


        const newCoupon = new Coupon({
            couponName,
            couponCode,
            discountAmount,
            minAmount,
            couponDescription,
            quantity,
            expiryDate
        });


        await newCoupon.save();

        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
    }
}


const applyCoupon = async (req, res) => {
    try {
        const { userId } = req.session
        const code = req.body.code;
        const subTotal = Number(req.body.subTotal);


        console.log('applyCoupon......:',code);
        console.log('applyCoupon......:',subTotal);

        const coupon = await Coupon.findOne({ couponCode: code });
        console.log(coupon);

        if (!coupon) {
            return res.status(400).json({ error: "Invalid Coupon" });
        }

        if (!coupon.status || coupon.expiryDate < Date.now() || coupon.quantity <= 0) {
            return res.status(400).json({ error: "Coupon is not valid" });
        }

        if (subTotal < coupon.minAmount) {
            return res.status(400).json({error: `Minimum purchase amount required: ₹${minAmount}` });
        }
        


        const couponId = coupon._id;
        const couponClaimed = await Coupon.findOne({_id:couponId,"userUsed.user_id":userId});
        console.log("coupon claimed",couponClaimed);
        if(couponClaimed){
            return res.json({couponClaimed:true, message:'Coupon has been already used'})
        }
        const discountAmount = coupon.discountAmount

        const discountTotal = subTotal-discountAmount
        console.log(discountTotal);

    
        const updatedSubTotal = discountTotal >= 0 ? discountTotal : 0;

        return res.json({applied:true, updatedSubTotal: updatedSubTotal, discountAmount:discountAmount });

      

        
    } catch (error) {
        console.log(error.message);
    }
}



const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon.findByIdAndDelete(id);
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadCoupons,
    loadAddCoupon,
    addCoupon,
    applyCoupon,
    deleteCoupon
}