import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';

const FaceAttendance = ({ eventId, onAttendanceMarked }) => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        toast.error('Failed to load face recognition models');
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setShowCamera(true);
      setCameraError(null);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const verifyAttendance = async () => {
    if (!videoRef.current) return;

    try {
      setProcessing(true);
      const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error('No face detected. Please position your face in the camera view.');
        setProcessing(false);
        return;
      }

      const response = await fetch('/api/face-recognition/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          faceDescriptor: Array.from(detection.descriptor)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Attendance marked successfully');
        onAttendanceMarked && onAttendanceMarked();
      } else {
        toast.error(data.message || 'Failed to verify attendance');
      }
    } catch (error) {
      console.error('Error verifying attendance:', error);
      toast.error('Failed to verify attendance');
    } finally {
      setProcessing(false);
      stopCamera();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showCamera ? (
        <button
          onClick={startCamera}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Start Face Recognition
        </button>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full rounded-lg"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
            width="640"
            height="480"
          />
          <div className="absolute bottom-4 right-4 space-x-2">
            <button
              onClick={verifyAttendance}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {processing ? 'Verifying...' : 'Verify Attendance'}
            </button>
            <button
              onClick={stopCamera}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <p className="text-red-500 text-sm">{cameraError}</p>
      )}
    </div>
  );
};

export default FaceAttendance;
