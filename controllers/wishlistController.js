const User = require('../models/userModel')
const Product = require('../models/productModel')


const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findOne({ _id: userId }).populate('wishlist')
        res.render('users/wishlist', { userId, User: user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;
        console.log('product.......Id....:',productId);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteWishlistProduct = async(req,res)=>{
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;

        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { wishlist: productId } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    loadWishlist,
    addToWishlist,
    deleteWishlistProduct
}