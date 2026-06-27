const cloudinary = require('cloudinary').v2;
const File = require('../models/File');

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

const saveToMongo = async (file) => {
  const newFile = await File.create({
    filename: file.originalname,
    contentType: file.mimetype,
    data: file.buffer,
  });
  return `/uploads/${newFile._id}`;
};

/**
 * Uploads a single file to Cloudinary or falls back to MongoDB.
 * @param {Express.Multer.File} file 
 * @returns {Promise<string>} File URL
 */
const uploadImage = (file) => {
  return new Promise(async (resolve, reject) => {
    if (!file) return resolve(null);

    if (isCloudinaryConfigured) {
      try {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'tony_original_morocco' },
          (error, result) => {
            if (result) {
              resolve(result.secure_url);
            } else {
              console.error('Cloudinary upload error:', error);
              saveToMongo(file).then(resolve).catch(reject);
            }
          }
        );
        stream.end(file.buffer);
      } catch (error) {
        console.error('Cloudinary upload failed, falling back to MongoDB:', error);
        saveToMongo(file).then(resolve).catch(reject);
      }
    } else {
      // Fallback: MongoDB
      saveToMongo(file).then(resolve).catch(reject);
    }
  });
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
