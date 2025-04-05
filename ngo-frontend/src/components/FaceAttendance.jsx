import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const FaceAttendance = ({ eventId, userId, storedFaceDescriptor, onAttendanceMarked }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const videoRef = useRef();
  const canvasRef = useRef();
  
  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      try {
        const MODEL_URL = '/models';
        
        // Load face detection, landmarks, and recognition models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setError('Failed to load face recognition models. Please try again later.');
        setIsLoading(false);
      }
    };
    
    loadModels();
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Start camera
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Could not access camera. Please make sure camera permissions are enabled.');
    }
  };
  
  // Process face verification
  const verifyFace = async () => {
    if (!isCameraReady || !videoRef.current || !canvasRef.current || !storedFaceDescriptor) {
      setError('Camera not ready or missing face data. Please try again.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Set up canvas over video element
      const videoEl = videoRef.current;
      const canvas = canvasRef.current;
      
      const displaySize = { width: videoEl.width, height: videoEl.height };
      faceapi.matchDimensions(canvas, displaySize);
      
      // Detect face in current video frame
      const detections = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detections) {
        setError('No face detected. Please position your face in the frame and ensure good lighting.');
        setIsProcessing(false);
        return;
      }
      
      // Draw detection on canvas
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      
      // Convert stored descriptor from array to Float32Array
      const storedDescriptor = new Float32Array(storedFaceDescriptor);
      const liveDescriptor = detections.descriptor;
      
      // Calculate face similarity
      const distance = faceapi.euclideanDistance(storedDescriptor, liveDescriptor);
      
      // Convert distance to similarity score (0-1, where 1 is perfect match)
      const MAX_DISTANCE = 0.6; // Adjust based on your requirements
      const similarity = Math.max(0, 1 - (distance / MAX_DISTANCE));
      
      // Determine match based on threshold
      const MATCH_THRESHOLD = 0.6;
      const isMatch = similarity >= MATCH_THRESHOLD;
      
      // Call API to verify attendance (can be simplified for testing)
      if (isMatch) {
        // Make API call to mark attendance
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance/face-verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              eventId,
              verificationScore: similarity
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            setResult({
              success: true,
              message: 'Attendance marked successfully!',
              similarity: similarity.toFixed(2),
              attendance: data.attendance
            });
            
            // Call the callback function
            if (onAttendanceMarked) {
              onAttendanceMarked(data.attendance);
            }
          } else {
            setResult({
              success: false,
              message: 'Face recognized, but attendance marking failed.',
              similarity: similarity.toFixed(2),
              error: data.message
            });
          }
        } catch (error) {
          console.error('API error:', error);
          setResult({
            success: false,
            message: 'Face recognized, but server error occurred.',
            similarity: similarity.toFixed(2),
            error: 'Network or server error'
          });
        }
      } else {
        setResult({
          success: false,
          message: 'Face verification failed. Please try again.',
          similarity: similarity.toFixed(2)
        });
      }
    } catch (error) {
      console.error('Error during face verification:', error);
      setError('An error occurred during face verification. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsCameraReady(false);
    }
  };
  
  return (
    <div className="bg-surface rounded-lg shadow-md p-5">
      <h2 className="text-xl font-header font-semibold mb-4">Face Recognition Attendance</h2>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading face recognition models...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className={`border-l-4 p-4 mb-4 ${
              result.success 
                ? 'bg-green-100 border-green-500 text-green-700' 
                : 'bg-yellow-100 border-yellow-500 text-yellow-700'
            }`}>
              <p className="font-medium">{result.message}</p>
              <p className="text-sm mt-1">Similarity score: {result.similarity}</p>
              {result.error && <p className="text-sm mt-1 text-red-500">{result.error}</p>}
            </div>
          )}
          
          <div className="relative mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              width="640"
              height="480"
              className={`rounded-lg mx-auto border-2 ${isCameraReady ? 'border-primary' : 'border-gray-300'}`}
              style={{ display: isCameraReady ? 'block' : 'none' }}
            ></video>
            <canvas
              ref={canvasRef}
              width="640"
              height="480"
              className="absolute top-0 left-0 right-0 mx-auto"
              style={{ display: isCameraReady ? 'block' : 'none' }}
            ></canvas>
            
            {!isCameraReady && !isProcessing && (
              <div className="bg-gray-100 rounded-lg flex flex-col items-center justify-center h-60">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-600">Camera not started</p>
                <button
                  onClick={startCamera}
                  className="mt-3 btn-primary text-sm px-4 py-2"
                >
                  Start Camera
                </button>
              </div>
            )}
          </div>
          
          <div className="flex justify-center space-x-4">
            {isCameraReady && (
              <>
                <button
                  onClick={verifyFace}
                  disabled={isProcessing}
                  className="btn-primary flex items-center"
                >
                  {isProcessing && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isProcessing ? 'Processing...' : 'Mark Attendance'}
                </button>
                
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Stop Camera
                </button>
              </>
            )}
          </div>
          
          <div className="mt-6 text-sm text-gray-500 border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-1">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Start Camera" to activate your webcam</li>
              <li>Position your face clearly in the frame</li>
              <li>Ensure you have good lighting</li>
              <li>Click "Mark Attendance" when ready</li>
              <li>Wait for verification to complete</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
};

export default FaceAttendance;
