const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String,
        price: Number,
        image: String,
        size: String,
        color: String,
        quantity: {type: Number, default: 1}
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);