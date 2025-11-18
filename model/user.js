const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s]*$/, 'Full name can only contain letters and spaces']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email'
    },
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(phone) {
        return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  // Security
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
    validate: {
      validator: function(password) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator', 'support'],
    default: 'user'
  },
  
  // Financial Information
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative'],
    get: v => Math.round(v * 100) / 100
  },
  total_earnings: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  referral_earnings: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  total_invested: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  total_withdrawn: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100
  },
  
  // Referral System
  referral_code: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  referred_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  referral_count: {
    type: Number,
    default: 0
  },
  
  // KYC & Verification
  kyc_verified: {
    type: Boolean,
    default: false
  },
  kyc_level: {
    type: String,
    enum: ['none', 'basic', 'enhanced', 'full'],
    default: 'none'
  },
  kyc_data: {
    id_type: {
      type: String,
      enum: ['national_id', 'passport', 'driver_license', 'voter_id']
    },
    id_number: String,
    id_front: String,
    id_back: String,
    selfie_with_id: String,
    verified_at: Date,
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejection_reason: String
  },
  
  // Investment Preferences
  risk_tolerance: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    default: 'medium'
  },
  investment_strategy: {
    type: String,
    enum: ['conservative', 'balanced', 'growth', 'aggressive'],
    default: 'balanced'
  },
  preferred_materials: [{
    type: String,
    enum: [
      'gold', 'silver', 'platinum', 'palladium',
      'crude_oil', 'natural_gas', 'brent_oil',
      'copper', 'aluminum', 'zinc', 'nickel',
      'cocoa', 'coffee', 'sugar', 'wheat',
      'corn', 'soybeans', 'rice', 'cotton',
      'crypto', 'real_estate', 'technology'
    ]
  }],
  
  // Account Status
  is_active: {
    type: Boolean,
    default: true
  },
  is_suspended: {
    type: Boolean,
    default: false
  },
  suspension_reason: String,
  suspension_until: Date,
  
  // Security & Login
  last_login: Date,
  last_login_ip: String,
  login_attempts: {
    type: Number,
    default: 0
  },
  lock_until: Date,
  password_changed_at: Date,
  password_reset_token: String,
  password_reset_expires: Date,
  
  // Enhanced Security Features
  two_factor_enabled: {
    type: Boolean,
    default: false
  },
  two_factor_secret: {
    type: String,
    select: false
  },
  two_factor_backup_codes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    },
    used_at: Date
  }],
  security_questions: [{
    question: String,
    answer: {
      type: String,
      select: false
    }
  }],
  
  // Notification Preferences
  notification_preferences: {
    email: {
      investments: { type: Boolean, default: true },
      earnings: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    sms: {
      investments: { type: Boolean, default: false },
      withdrawals: { type: Boolean, default: true },
      security: { type: Boolean, default: true }
    },
    push: {
      all: { type: Boolean, default: true }
    }
  },
  
  // Banking & Payment
  bank_details: {
    bank_name: String,
    account_name: String,
    account_number: String,
    bank_code: String,
    verified: {
      type: Boolean,
      default: false
    },
    verified_at: Date
  },
  payment_methods: [{
    type: {
      type: String,
      enum: ['bank', 'crypto', 'card', 'mobile_money']
    },
    details: mongoose.Schema.Types.Mixed,
    is_default: Boolean,
    added_at: Date
  }],
  
  // Profile & Settings
  profile_completion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  avatar: String,
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'fr', 'es', 'pt', 'ar']
  },
  timezone: {
    type: String,
    default: 'Africa/Lagos'
  },
  country: {
    type: String,
    default: 'NG'
  },
  
  // Analytics
  device_info: [{
    device_id: String,
    user_agent: String,
    ip_address: String,
    location: {
      country: String,
      city: String,
      timezone: String
    },
    last_used: Date,
    is_current: Boolean
  }],
  
  // Membership & Tiers
  membership_tier: {
    type: String,
    enum: ['standard', 'premium', 'vip', 'elite'],
    default: 'standard'
  },
  loyalty_points: {
    type: Number,
    default: 0
  },
  
  // Audit Fields
  created_by: {
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
      delete ret.password;
      delete ret.two_factor_secret;
      delete ret.security_questions;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Virtual for is_locked
userSchema.virtual('is_locked').get(function() {
  return !!(this.lock_until && this.lock_until > Date.now());
});

// Virtual for account_age
userSchema.virtual('account_age_days').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Indexes for Performance
userSchema.index({ email: 1 });
userSchema.index({ referral_code: 1 });
userSchema.index({ referred_by: 1 });
userSchema.index({ created_at: -1 });
userSchema.index({ balance: -1 });
userSchema.index({ 'device_info.device_id': 1 });
userSchema.index({ is_active: 1, is_suspended: 1 });
userSchema.index({ membership_tier: 1 });
userSchema.index({ country: 1 });

// Pre-save Middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost factor of 12
    this.password = await bcrypt.hash(this.password, 12);
    this.password_changed_at = Date.now() - 1000; // Set 1 second ago
    next();
  } catch (error) {
    next(error);
  }
});

// Generate referral code before saving if new user
userSchema.pre('save', function(next) {
  if (this.isNew && !this.referral_code) {
    this.referral_code = this._id.toString().slice(-8).toUpperCase();
  }
  
  // Calculate profile completion percentage
  let completion = 0;
  const fields = [
    { field: 'full_name', weight: 15 },
    { field: 'email', weight: 15 },
    { field: 'phone', weight: 15 },
    { field: 'kyc_verified', weight: 25, check: () => this.kyc_verified },
    { field: 'bank_details.bank_name', weight: 15, check: () => this.bank_details?.bank_name },
    { field: 'avatar', weight: 5, check: () => this.avatar },
    { field: 'country', weight: 5, check: () => this.country && this.country !== 'NG' },
    { field: 'two_factor_enabled', weight: 5, check: () => this.two_factor_enabled }
  ];
  
  fields.forEach(({ field, weight, check }) => {
    if (check ? check() : this[field]) {
      completion += weight;
    }
  });
  
  this.profile_completion = Math.min(100, completion);
  next();
});

// Instance Methods
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isAccountLocked = function() {
  return this.lock_until && this.lock_until > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lock_until && this.lock_until < Date.now()) {
    return this.updateOne({
      $set: { login_attempts: 1 },
      $unset: { lock_until: 1 }
    });
  }
  
  // Otherwise we're incrementing
  const updates = { $inc: { login_attempts: 1 } };
  
  // Lock the account if we've reached max attempts and it's not locked already
  if (this.login_attempts + 1 >= 10 && !this.is_locked) {
    updates.$set = { 
      lock_until: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };
  } else if (this.login_attempts + 1 >= 5 && !this.is_locked) {
    updates.$set = { 
      lock_until: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.password_changed_at) {
    const changedTimestamp = parseInt(this.password_changed_at.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.password_reset_token = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.password_reset_expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

userSchema.methods.addDevice = function(deviceInfo) {
  const existingDeviceIndex = this.device_info.findIndex(
    device => device.device_id === deviceInfo.device_id
  );
  
  if (existingDeviceIndex > -1) {
    this.device_info[existingDeviceIndex].last_used = new Date();
    this.device_info[existingDeviceIndex].user_agent = deviceInfo.user_agent;
    this.device_info[existingDeviceIndex].ip_address = deviceInfo.ip_address;
    this.device_info[existingDeviceIndex].location = deviceInfo.location;
  } else {
    this.device_info.push({
      ...deviceInfo,
      last_used: new Date(),
      is_current: true
    });
  }
  
  // Mark other devices as not current
  this.device_info.forEach(device => {
    if (device.device_id !== deviceInfo.device_id) {
      device.is_current = false;
    }
  });
};

// Static Methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: new RegExp(`^${email}$`, 'i') });
};

userSchema.statics.getTopInvestors = function(limit = 10) {
  return this.aggregate([
    { $match: { is_active: true, is_suspended: false } },
    { $sort: { total_invested: -1 } },
    { $limit: limit },
    { $project: { 
        full_name: 1, 
        email: 1, 
        total_invested: 1, 
        total_earnings: 1,
        membership_tier: 1,
        avatar: 1 
      } 
    }
  ]);
};

userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: [{ $and: ['$is_active', { $not: '$is_suspended' }] }, 1, 0] } },
        verifiedUsers: { $sum: { $cond: ['$kyc_verified', 1, 0] } },
        totalBalance: { $sum: '$balance' },
        totalInvested: { $sum: '$total_invested' },
        avgBalance: { $avg: '$balance' }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);
