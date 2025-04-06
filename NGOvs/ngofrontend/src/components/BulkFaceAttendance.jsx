import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { uploadImage } from '../services/eventService';

const BulkFaceAttendance = ({ eventId }) => {
  const { currentUser } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [threshold, setThreshold] = useState(0.6);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const processAttendance = async () => {
    if (!photo || !eventId) return;

    try {
      setProcessing(true);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('eventId', eventId);
      formData.append('threshold', threshold);
      
      // Call bulk processing API
      const response = await fetch('/api/face-recognition/bulk-process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(data);
        toast.success(`Matched ${data.matches_found} out of ${data.total_faces} faces`);
      } else {
        toast.error(data.error || 'Failed to process attendance');
      }
    } catch (error) {
      console.error('Error processing attendance:', error);
      toast.error('Failed to process attendance');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">Bulk Face Recognition Attendance</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Event Photo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {preview && (
        <div className="mt-2">
          <img 
            src={preview} 
            alt="Event preview" 
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Match Threshold: {threshold.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.4"
          max="0.9"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>More Strict</span>
          <span>More Lenient</span>
        </div>
      </div>

      <button
        onClick={processAttendance}
        disabled={!photo || processing}
        className={`w-full mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
          !photo || processing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {processing ? 'Processing...' : 'Process Attendance'}
      </button>

      {results && (
        <div className="mt-4 space-y-2">
          <h3 className="font-medium">Results:</h3>
          <p>Total faces detected: {results.total_faces}</p>
          <p>Successful matches: {results.matches_found}</p>
          <p>Attendance records created: {results.attendance_marked?.length || 0}</p>
        </div>
      )}
    </div>
  );
};

export default BulkFaceAttendance;
