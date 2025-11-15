const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Don't include password in queries by default
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  userType: {
    type: String,
    required: true,
    enum: ['startup_founder', 'marketer', 'funder', 'developer'],
  },
  interests: [{
    type: String,
    trim: true,
  }],
  bio: {
    type: String,
    maxlength: 500,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  photoURL: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

// Index for searching by interests
userSchema.index({ interests: 1 });
userSchema.index({ userType: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
