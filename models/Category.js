const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema({
  // Core properties
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Image properties
  image: {
    url: {
      type: String,
      trim: true
    },
    altText: {
      type: String,
      trim: true,
      maxlength: [125, 'Alt text cannot exceed 125 characters']
    },
    dimensions: {
      width: Number,
      height: Number
    },
    fileSize: {
      type: Number,
      max: [5242880, 'File size cannot exceed 5MB']
    }
  },
  

  // Display settings
  displaySettings: {
    showInNavigation: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  
  // SEO properties
  seo: {
    title: {
      type: String,
      trim: true,
      maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      maxlength: [50, 'Keywords cannot exceed 50 characters each']
    }],
    canonicalUrl: {
      type: String,
      trim: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status and audit properties
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata for extensibility
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: false, // We're handling timestamps manually
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for child categories
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Middleware to handle slug generation
CategorySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Update timestamps
  if (this.isNew) {
    this.createdAt = this.updatedAt = new Date();
  } else {
    this.updatedAt = new Date();
  }
  
  next();
});

// Middleware to handle ancestor paths when parent changes
CategorySchema.pre('save', async function(next) {
  if (this.isModified('parentId')) {
    if (this.parentId) {
      const parent = await mongoose.model('Category').findById(this.parentId);
      this.ancestors = [...parent.ancestors, parent._id];
    } else {
      this.ancestors = [];
    }
    
    // Update all descendants if parent changes
    if (!this.isNew) {
      const descendants = await mongoose.model('Category').find({ ancestors: this._id });
      for (const descendant of descendants) {
        descendant.ancestors = [...this.ancestors, this._id];
        await descendant.save();
      }
    }
  }
  next();
});

// Indexes for better performance
// CategorySchema.index({ name: 1 });
// CategorySchema.index({ slug: 1 });
// CategorySchema.index({ parentId: 1 });
// CategorySchema.index({ ancestors: 1 });
// CategorySchema.index({ 'displaySettings.isFeatured': 1 });
// CategorySchema.index({ 'displaySettings.showInNavigation': 1 });

module.exports = mongoose.model('Category', CategorySchema);