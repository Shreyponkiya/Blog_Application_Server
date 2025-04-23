const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Load environment variables

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

async function uploadImage(url) {
    try {
        // Upload an image
        const uploadResult = await cloudinary.uploader.upload(url, {
            public_id: 'blog-image',
        });

        // Optimize delivery by resizing and applying auto-format and auto-quality
        const optimizeUrl = cloudinary.url('blog-image', {
            fetch_format: 'auto',
            quality: 'auto'
        });

        // Transform the image: auto-crop to square aspect ratio
        const autoCropUrl = cloudinary.url('blog-image', {
            crop: 'auto',
            gravity: 'auto',
            width: 500,
            height: 500,
        });
        
        return { uploadResult, optimizeUrl, autoCropUrl };
    } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
    }
}

module.exports = uploadImage;
