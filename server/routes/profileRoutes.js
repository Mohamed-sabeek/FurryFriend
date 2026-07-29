const express = require('express');
const {
  getProfile,
  updateProfile,
  updateAddress,
  updateProfileImage
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProfile)
  .put(updateProfile);

router.put('/address', updateAddress);
router.patch('/image', upload.single('image'), updateProfileImage);

module.exports = router;
