import React, { useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';

const ImageUpload = ({ onUpload, existingImages = [], maxImages = 3, onImageClick }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (existingImages.length >= maxImages) {
            alert(`Maximum of ${maxImages} images allowed.`);
            return;
        }

        setUploading(true);
        try {
            await onUpload(file);
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center">
                Attachments <span className="ml-2 text-indigo-400">({existingImages.length}/{maxImages})</span>
            </h3>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-3 gap-4">
                {existingImages.map((img, idx) => (
                    <div 
                        key={idx} 
                        className={`relative aspect-square rounded-2xl overflow-hidden border border-white/10 group ${onImageClick ? 'cursor-pointer' : ''}`}
                        onClick={() => onImageClick && onImageClick(img.imageUrl || img)}
                    >
                        <img 
                            src={img.imageUrl || img} 
                            alt="Attachment" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon className="text-white w-6 h-6" />
                        </div>
                    </div>
                ))}

                {/* Upload Trigger */}
                {existingImages.length < maxImages && (
                    <label className={`aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all group ${uploading ? 'pointer-events-none' : ''}`}>
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Upload className="text-indigo-400 w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Add Image</span>
                            </>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                    </label>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
