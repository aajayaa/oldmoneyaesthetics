const mongoose = require('mongoose');
const Category = require('./Category');
const User = require('./User');

const sizeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Size name is required'],
        trim: true,
        maxlength: [50, 'Size name cannot exceed 50 characters']
    },
    description: {
        type: String,  // Fixed: Changed 'tpype' to 'type'
        trim: true,
        maxlength: [50, 'Description cannot exceed 50 characters']
    },
    richDescription: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    enabled: {
        type: Boolean,
        default: true
    }
}, { _id: true });
const colorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Size name is required'],
        trim: true,
        maxlength: [50, 'Size name cannot exceed 50 characters']
    },
    hexCode: {
        type: String,
        required: [true, 'Hex code is required'],
        uppercase: true,
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code'],
        default: '#FFFFFF'
    },
    enabled: {
        type: Boolean,
        default: true
    },
}, { _id: true });

const productSchema = new mongoose.Schema({
    // Core Product Info
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    sizes: [sizeSchema],
    colors: [colorSchema],
    prductCollection: {  // Note: There's a typo in 'productCollection'
        type: String,
        required: false,
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },

    originalPrice: Number, // For showing discounts
    costPrice: Number, // For profit calculations
    currency: {
        type: String,
        default: 'NPR',
        enum: ['USD', 'EUR', 'GBP', 'NPR', 'INR', 'CAD', 'AUD', 'JPY', 'AED'] // Luxury currencies
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    // e.g., "HM-24-1001" (Brand-Year-ProductID)
    chargeTaxes: {
        type: Boolean,
        default: false,
    },
    trackQuantity: {
        type: Boolean,
        default: true,
    },

    // Categorization
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },


    // Media
    image: {
        type: String,
        default: "",
    },
    images: [
        {
            type: String,
        },
    ],



    isFeatured: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    // Timestamps
    releaseDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);