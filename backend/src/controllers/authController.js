const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      userType,
      interests,
      bio,
      phoneNumber,
      photoURL,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, firstName, lastName, userType',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Validate userType
    const validUserTypes = ['startup_founder', 'marketer', 'funder', 'developer'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid userType. Must be one of: ${validUserTypes.join(', ')}`,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const displayName = `${firstName} ${lastName}`;
    const user = new User({
      email,
      password,
      displayName,
      firstName,
      lastName,
      userType,
      interests: interests || [],
      bio,
      phoneNumber,
      photoURL,
      metadata: {
        createdAt: new Date(),
        lastLogin: new Date(),
        profileCompleted: !!(interests && interests.length > 0 && bio),
      },
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        interests: user.interests,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        metadata: user.metadata,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message,
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.metadata.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        interests: user.interests,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        metadata: user.metadata,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
};

/**
 * Get user profile
 * GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update last login
    user.metadata.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        interests: user.interests,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        isEmailVerified: user.isEmailVerified,
        metadata: user.metadata,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message,
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      userType,
      interests,
      bio,
      phoneNumber,
      photoURL,
    } = req.body;

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (firstName || lastName) {
      user.displayName = `${user.firstName} ${user.lastName}`;
    }
    if (userType) {
      const validUserTypes = ['startup_founder', 'marketer', 'funder', 'developer'];
      if (!validUserTypes.includes(userType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid userType. Must be one of: ${validUserTypes.join(', ')}`,
        });
      }
      user.userType = userType;
    }
    if (interests) user.interests = interests;
    if (bio !== undefined) user.bio = bio;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (photoURL !== undefined) user.photoURL = photoURL;

    // Update profile completion status
    user.metadata.profileCompleted = !!(
      user.interests && 
      user.interests.length > 0 && 
      user.bio
    );

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        interests: user.interests,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        metadata: user.metadata,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

/**
 * Delete user account
 * DELETE /api/auth/account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete from database
    await User.deleteOne({ _id: req.userId });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message,
    });
  }
};

/**
 * Logout user (client-side will remove token)
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message,
    });
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};
