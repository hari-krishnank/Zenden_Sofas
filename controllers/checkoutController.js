
const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Product = require('../models/productModel')

const loadCheckout = async (req, res) => {
    try {
        let user;
        
        console.log('check', req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }

        const cart = await Cart.findOne({ user_id: req.session.userId }).populate({
            path: "items.product_id"
        })
        
        let subTotal =0 
        if(cart){
            cart.items.forEach((cartItem)=>{
                let itemPrice = cartItem.product_id.price;
                let itemQuantity = cartItem.quantity

                let itemTotal = itemPrice * itemQuantity;

                subTotal += itemTotal;

            });
        }
        console.log(subTotal);
        const userAddresses = user ? user.Address : [];
        res.render('users/checkout', { User: user, cart, userAddresses,subTotal })
    } catch (error) {
        console.log(error.message);
    }
}

const addNewAddress = async (req, res) => {
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
            res.json({ success: true, message: "Address added successfully" });

        } else {
            res.status(400).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.log(error.message);
    }
}


const loadOrderSuccess = async(req,res)=>{
    try {
        res.render('users/orderSuccess')
    } catch (error) {
        console.log(error.message);
    }
}

const placeOrder = async(req,res) => {

    const {userId,selectedAddressId} = req.body;

    const cart = await Cart.findOne({user_id:userId});

    if(!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'No items in the cart' });
    }

    
}

module.exports = {
    loadCheckout,
    addNewAddress,
    loadOrderSuccess
}