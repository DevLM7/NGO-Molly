import React, { useState, useRef } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const GalleryUpload = ({ eventId, eventName, eventDate, onPhotoUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState(null);
  const [visibility, setVisibility] = useState('private');
  
  const fileInputRef = useRef(null);
  
  // Event name and date automatically added as tags
  const defaultTags = [
    eventName ? eventName.split(' ')[0] : '',
    new Date(eventDate).getFullYear().toString()
  ].filter(Boolean);
  
  // Handle file selection
  const handleFileChange = (e) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc).');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB.');
        return;
      }
      
      setSelectedFile(file);
      
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle tag addition
  const handleAddTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };
  
  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle visibility change
  const handleVisibilityChange = (e) => {
    setVisibility(e.target.value);
  };
  
  // Handle upload to Firebase Storage and API
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Upload to Firebase Storage
      const storage = getStorage();
      const fileExtension = selectedFile.name.split('.').pop();
      const fileName = `event_photos/${eventId}/${uuidv4()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);
      
      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Error uploading image. Please try again.');
          setIsUploading(false);
        },
        async () => {
          // Get download URL after upload completes
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save photo info to backend API
          const allTags = [...new Set([...defaultTags, ...tags])];
          
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gallery/upload`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                eventId,
                imageUrl: downloadURL,
                tags: allTags,
                description,
                visibility
              })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              // Reset form
              setSelectedFile(null);
              setPreview(null);
              setDescription('');
              setTags([]);
              setUploadProgress(0);
              setIsUploading(false);
              
              // Call callback function if provided
              if (onPhotoUploaded) {
                onPhotoUploaded(data.eventPhoto);
              }
            } else {
              throw new Error(data.message || 'Failed to save photo information');
            }
          } catch (error) {
            console.error('API error:', error);
            setError('Error saving photo information. Please try again.');
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error uploading image. Please try again.');
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-surface rounded-lg shadow-md p-5">
      <h2 className="text-xl font-header font-semibold mb-4">Upload Event Photo</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <div 
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${preview ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-primary/5'}`}
        >
          {preview ? (
            <div className="relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-64 mx-auto rounded"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">Click to select an image</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
            </>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for your photo..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows="3"
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Default tags */}
          {defaultTags.map((tag, index) => (
            <span 
              key={`default-${index}`}
              className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center"
            >
              # {tag}
            </span>
          ))}
          
          {/* User-added tags */}
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-sm flex items-center"
            >
              # {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-secondary/70 hover:text-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAddTag}
            className="px-3 py-2 bg-secondary text-white rounded-r-md hover:bg-secondary/90"
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Visibility
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === 'private'}
              onChange={handleVisibilityChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Private (Only you and the NGO)</span>
          </label>
          
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={handleVisibilityChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Public (Everyone can see)</span>
          </label>
        </div>
      </div>
      
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Uploading...</span>
            <span className="text-xs text-gray-500">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          className={`btn-primary ${(isUploading || !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </div>
    </div>
  );
};

export default GalleryUpload;
