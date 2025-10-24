// src/utils/imgurUploader.js
const axios = require('axios');
const FormData = require('form-data');

/**
 * Uploads an image buffer to Imgur
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @returns {Promise<string>} - The Imgur URL of the uploaded image
 */
async function uploadToImgur(imageBuffer) {
  try {
    // Create form data for Imgur API
    const formData = new FormData();
    formData.append('image', imageBuffer.toString('base64'));
    
    const response = await axios.post('https://api.imgur.com/3/image', formData, {
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
        ...formData.getHeaders()
      }
    });
    
    if (response.data.success) {
      return response.data.data.link;
    } else {
      throw new Error('Failed to upload image to Imgur');
    }
  } catch (error) {
    console.error('Imgur upload error:', error?.response?.data || error.message);
    throw new Error('Failed to upload image to Imgur');
  }
}

/**
 * Downloads an image from a URL and uploads it to Imgur
 * @param {string} imageUrl - The URL of the image to download and re-upload
 * @returns {Promise<string>} - The Imgur URL of the uploaded image
 */
async function downloadAndUploadToImgur(imageUrl) {
  try {
    // Download the image from the URL
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000 // 10 second timeout
    });
    
    const imageBuffer = Buffer.from(response.data);
    
    // Upload to Imgur
    return await uploadToImgur(imageBuffer);
  } catch (error) {
    console.error('Error downloading and uploading image:', error.message);
    throw new Error('Failed to process profile picture');
  }
}

module.exports = {
  uploadToImgur,
  downloadAndUploadToImgur
};
