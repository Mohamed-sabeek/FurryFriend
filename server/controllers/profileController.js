const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile basic info
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, location, emergencyContact, dob, gender } = req.body;

    const fieldsToUpdate = {
      fullName,
      phone,
      location,
      emergencyContact,
      dob,
      gender
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or add address
// @route   PUT /api/profile/address
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const { 
      addressId,
      label, 
      houseNumber, 
      street, 
      area, 
      city, 
      district, 
      state, 
      country, 
      pincode, 
      landmark, 
      isDefault 
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (isDefault) {
      // Set all other addresses to not default
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    let isNew = false;
    
    if (addressId) {
      // Update existing address
      const address = user.addresses.id(addressId);
      if (address) {
        if (label !== undefined) address.label = label;
        if (houseNumber !== undefined) address.houseNumber = houseNumber;
        if (street !== undefined) address.street = street;
        if (area !== undefined) address.area = area;
        if (city !== undefined) address.city = city;
        if (district !== undefined) address.district = district;
        if (state !== undefined) address.state = state;
        if (country !== undefined) address.country = country;
        if (pincode !== undefined) address.pincode = pincode;
        if (landmark !== undefined) address.landmark = landmark;
        if (isDefault !== undefined) address.isDefault = isDefault;
      }
    } else {
      // Add new address
      const newAddress = {
        label: label || 'Home',
        houseNumber,
        street,
        area,
        city,
        district,
        state,
        country: country || 'India',
        pincode,
        landmark,
        isDefault: isDefault !== undefined ? isDefault : (user.addresses.length === 0)
      };
      user.addresses.push(newAddress);
      isNew = true;
    }

    await user.save();
    
    let savedAddress;
    if (isNew) {
      savedAddress = user.addresses[user.addresses.length - 1];
    } else {
      savedAddress = user.addresses.id(addressId);
    }

    res.status(200).json({ success: true, data: user, savedAddress });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile image
// @route   PATCH /api/profile/image
// @access  Private
const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const profileImage = req.file.path; // Cloudinary URL provided by multer-storage-cloudinary

    const user = await User.findByIdAndUpdate(req.user.id, { profileImage }, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAddress,
  updateProfileImage
};
