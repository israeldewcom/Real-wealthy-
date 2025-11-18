const mongoose = require('mongoose');

const investmentPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Plan name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  material_type: {
    type: String,
    required: [true, 'Material type is required'],
    enum: [
      // Precious Metals
      'gold', 'silver', 'platinum', 'palladium', 'rhodium',
      // Energy
      'crude_oil', 'brent_oil', 'natural_gas', 'heating_oil', 'gasoline',
      // Industrial Metals
      'copper', 'aluminum', 'zinc', 'nickel', 'lead', 'tin', 'iron_ore',
      // Agriculture
      'cocoa', 'coffee', 'sugar', 'wheat', 'corn', 'soybeans', 'rice', 
      'cotton', 'palm_oil', 'rubber', 'orange_juice',
      // Livestock
      'live_cattle', 'lean_hogs', 'feeder_cattle',
      // Technology & Crypto
      'cryptocurrency', 'blockchain', 'tech_metals', 'battery_metals',
      // Real Estate & Infrastructure
      'real_estate', 'timber', 'water_rights'
    ]
  },
  material_subtype: {
    type: String,
    required: false
  },
  
  // Investment Parameters
  min_amount: {
    type: Number,
    required: [true, 'Minimum investment amount is required'],
    min: [1000, 'Minimum investment must be at least ₦1,000']
  },
  max_amount: {
    type: Number,
    required: [true, 'Maximum investment amount is required'],
    validate: {
      validator: function(max) {
        return max > this.min_amount;
      },
      message: 'Maximum amount must be greater than minimum amount'
    }
  },
  
  // Returns Structure
  daily_interest: {
    type: Number,
    required: [true, 'Daily interest rate is required'],
    min: [0.1, 'Daily interest must be at least 0.1%'],
    max: [20, 'Daily interest cannot exceed 20%']
  },
  total_interest: {
    type: Number,
    required: [true, 'Total interest rate is required'],
    min: [5, 'Total interest must be at least 5%'],
    max: [500, 'Total interest cannot exceed 500%']
  },
  
  // Duration
  duration: {
    type: Number,
    required: [true, 'Investment duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [3650, 'Duration cannot exceed 10 years']
  },
  duration_unit: {
    type: String,
    enum: ['days', 'months', 'years'],
    default: 'days'
  },
  
  // Risk & Category
  risk_level: {
    type: String,
    required: [true, 'Risk level is required'],
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['precious_metals', 'energy', 'industrial_metals', 'agriculture', 
           'livestock', 'technology', 'real_estate', 'crypto', 'specialty'],
    index: true
  },
  
  // Market Data
  current_price: {
    type: Number,
    required: [true, 'Current price is required']
  },
  price_unit: {
    type: String,
    default: 'USD'
  },
  price_change_24h: {
    type: Number,
    default: 0
  },
  market_cap: Number,
  daily_volume: Number,
  
  // Features & Restrictions
  features: [{
    title: String,
    description: String,
    icon: String
  }],
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  is_popular: {
    type: Boolean,
    default: false
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  requires_kyc: {
    type: Boolean,
    default: false
  },
  kyc_level_required: {
    type: String,
    enum: ['none', 'basic', 'enhanced', 'full'],
    default: 'basic'
  },
  available_countries: [{
    type: String,
    default: ['NG', 'US', 'UK', 'CA', 'AU', 'ZA']
  }],
  
  // Advanced Settings
  compounding_enabled: {
    type: Boolean,
    default: false
  },
  compounding_frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  early_termination_fee: {
    type: Number,
    default: 10, // Percentage
    min: 0,
    max: 50
  },
  auto_renew_enabled: {
    type: Boolean,
    default: true
  },
  
  // Performance Metrics
  total_investors: {
    type: Number,
    default: 0
  },
  total_invested: {
    type: Number,
    default: 0
  },
  success_rate: {
    type: Number,
    default: 95, // Percentage
    min: 0,
    max: 100
  },
  historical_returns: [{
    year: Number,
    return_percentage: Number
  }],
  
  // Legal & Compliance
  terms_conditions: String,
  risk_disclaimer: String,
  regulatory_status: {
    type: String,
    enum: ['approved', 'pending', 'restricted', 'unregulated'],
    default: 'approved'
  },
  license_number: String,
  
  // Images & Media
  images: {
    main: String,
    gallery: [String],
    chart: String
  },
  color_scheme: {
    primary: { type: String, default: '#fbbf24' },
    secondary: { type: String, default: '#10b981' }
  },
  
  // Audit Fields
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  last_updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual for actual duration in days
investmentPlanSchema.virtual('duration_days').get(function() {
  if (this.duration_unit === 'days') return this.duration;
  if (this.duration_unit === 'months') return this.duration * 30;
  if (this.duration_unit === 'years') return this.duration * 365;
  return this.duration;
});

// Virtual for expected return
investmentPlanSchema.virtual('expected_return').get(function() {
  const principal = this.min_amount;
  const dailyRate = this.daily_interest / 100;
  const totalDays = this.duration_days;
  
  if (this.compounding_enabled) {
    // Compound interest calculation
    const periodsPerYear = this.compounding_frequency === 'daily' ? 365 : 
                          this.compounding_frequency === 'weekly' ? 52 : 12;
    
    const rate = this.total_interest / 100;
    return principal * Math.pow(1 + rate / periodsPerYear, periodsPerYear * (totalDays / 365));
  } else {
    // Simple interest calculation
    return principal + (principal * dailyRate * totalDays);
  }
});

// Indexes for Performance
investmentPlanSchema.index({ category: 1, risk_level: 1 });
investmentPlanSchema.index({ material_type: 1, is_active: 1 });
investmentPlanSchema.index({ is_active: 1, is_popular: 1, is_featured: 1 });
investmentPlanSchema.index({ min_amount: 1, max_amount: 1 });
investmentPlanSchema.index({ 'historical_returns.year': -1 });

// Static Methods
investmentPlanSchema.statics.getActivePlans = function() {
  return this.find({ is_active: true })
    .sort({ is_featured: -1, is_popular: -1, created_at: -1 });
};

investmentPlanSchema.statics.getPlansByRisk = function(riskLevel) {
  return this.find({ 
    risk_level: riskLevel, 
    is_active: true 
  }).sort({ daily_interest: -1 });
};

investmentPlanSchema.statics.getFeaturedPlans = function() {
  return this.find({ 
    is_featured: true, 
    is_active: true 
  }).limit(6);
};

investmentPlanSchema.statics.updatePlanPerformance = async function(planId, investmentAmount) {
  return this.findByIdAndUpdate(planId, {
    $inc: {
      total_investors: 1,
      total_invested: investmentAmount
    }
  });
};

// Pre-save middleware
investmentPlanSchema.pre('save', function(next) {
  // Ensure total interest is consistent with daily interest and duration
  if (this.isModified('daily_interest') || this.isModified('duration')) {
    const totalInterest = this.daily_interest * this.duration_days;
    if (Math.abs(totalInterest - this.total_interest) > 1) {
      this.total_interest = parseFloat(totalInterest.toFixed(2));
    }
  }
  
  // Update last_updated_by if modified
  if (this.isModified() && !this.isNew) {
    this.last_updated_by = this.constructor.currentUser;
  }
  
  next();
});

module.exports = mongoose.model('InvestmentPlan', investmentPlanSchema);
