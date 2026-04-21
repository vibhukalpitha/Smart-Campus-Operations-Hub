/**
 * Utility for handling direct unsigned uploads to Cloudinary.
 */

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/duuzbdecy/image/upload`;
const UPLOAD_PRESET = 'ticket_uploads';

/**
 * Uploads a file to Cloudinary using unsigned upload preset.
 * @param {File} file The file to upload
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};
