const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a single file to Cloudinary or falls back to local URL.
 * Removes the local file after Cloudinary upload if successful.
 * @param {Express.Multer.File} file 
 * @returns {Promise<string>} File URL
 */
const uploadImage = async (file) => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'tony_original_morocco',
      });
      // Delete temporary file from local storage
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting temp local file:', err);
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local file path:', error);
      // Fallback to local URL path
      return `/uploads/${file.filename}`;
    }
  }

  // Fallback: Local URL
  return `/uploads/${file.filename}`;
};

/**
 * Uploads multiple files.
 * @param {Array<Express.Multer.File>} files 
 * @returns {Promise<Array<string>>} Array of file URLs
 */
const uploadMultipleImages = async (files) => {
  if (!files || !files.length) return [];
  const uploadPromises = files.map(file => uploadImage(file));
  return Promise.all(uploadPromises);
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  isCloudinaryConfigured
};
