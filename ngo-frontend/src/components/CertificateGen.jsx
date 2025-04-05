import React, { useState, useRef } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { format } from 'date-fns';

const CertificateGen = ({ user, event, attendance, onCertificateGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  
  // Function to generate certificate
  const generateCertificate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add a page to the document
      const page = pdfDoc.addPage([842, 595]); // A4 landscape
      
      // Get font for the certificate
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Background color
      page.drawRectangle({
        x: 0,
        y: 0,
        width: 842,
        height: 595,
        color: rgb(0.97, 0.97, 0.97)
      });
      
      // Border
      page.drawRectangle({
        x: 20,
        y: 20,
        width: 802,
        height: 555,
        borderColor: rgb(0, 0.72, 0.58), // Primary color
        borderWidth: 2,
        color: rgb(1, 1, 1, 0)
      });
      
      // Certificate title
      page.drawText('CERTIFICATE OF PARTICIPATION', {
        x: 220,
        y: 500,
        size: 30,
        font: helveticaBold,
        color: rgb(0.42, 0.36, 0.90) // Secondary color
      });
      
      // Certificate content
      page.drawText('This is to certify that', {
        x: 320,
        y: 440,
        size: 16,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      // Volunteer name
      page.drawText(user.name, {
        x: 421 - (helveticaBold.widthOfTextAtSize(user.name, 24) / 2),
        y: 400,
        size: 24,
        font: helveticaBold,
        color: rgb(0, 0.72, 0.58) // Primary color
      });
      
      // Participation text
      page.drawText('has successfully participated in', {
        x: 300,
        y: 360,
        size: 16,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      // Event name
      page.drawText(event.title, {
        x: 421 - (helveticaBold.widthOfTextAtSize(event.title, 20) / 2),
        y: 320,
        size: 20,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      // Event date
      const eventDate = format(new Date(event.date), 'MMMM dd, yyyy');
      page.drawText(`held on ${eventDate}`, {
        x: 340,
        y: 280,
        size: 16,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      // Hours contributed
      if (attendance.hoursContributed) {
        page.drawText(`contributing ${attendance.hoursContributed} volunteer hours`, {
          x: 320,
          y: 240,
          size: 16,
          font: helveticaFont,
          color: rgb(0.2, 0.2, 0.2)
        });
      }
      
      // Certificate issue date
      const issueDate = format(new Date(), 'MMMM dd, yyyy');
      page.drawText(`Issued on: ${issueDate}`, {
        x: 360,
        y: 180,
        size: 12,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4)
      });
      
      // NGO name
      page.drawText(`${event.ngoName || 'NGO Name'}`, {
        x: 200,
        y: 120,
        size: 16,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      // Serial number
      const serialNumber = `CERT-${event._id.substring(0, 6)}-${user.uid.substring(0, 6)}`;
      page.drawText(`Certificate ID: ${serialNumber}`, {
        x: 650,
        y: 40,
        size: 10,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4)
      });
      
      // Create a binary PDF and convert to a data URL
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setCertificateUrl(url);
      
      // Render preview if canvas exists
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Create an image from the PDF
        const pdfImage = new Image();
        
        // Convert the first page to an image (would use PDF.js in a real app)
        // For this demo, we'll use a placeholder
        pdfImage.onload = () => {
          context.drawImage(pdfImage, 0, 0, canvas.width, canvas.height);
        };
        
        // In a real application, you would use PDF.js to render the PDF
        // For now, we'll just show the certificate UI
      }
      
      // Call API to mark certificate as issued
      await saveCertificateToServer(url, attendance._id);
      
      // Callback if provided
      if (onCertificateGenerated) {
        onCertificateGenerated(url, serialNumber);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      setError('Error generating certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save certificate URL to server
  const saveCertificateToServer = async (url, attendanceId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance/${attendanceId}/certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ certificateUrl: url })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save certificate');
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
      // Continue anyway since the user already has the certificate
    }
  };
  
  // Download the certificate
  const downloadCertificate = () => {
    if (certificateUrl) {
      const link = document.createElement('a');
      link.href = certificateUrl;
      link.download = `Certificate_${user.name}_${event.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="bg-surface rounded-lg shadow-md p-5">
      <h2 className="text-xl font-header font-semibold mb-4">Certificate Generator</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {certificateUrl ? (
        <>
          <div className="border rounded-lg p-2 mb-4 bg-gray-50">
            <div className="aspect-video relative">
              <iframe
                src={certificateUrl}
                className="w-full h-full rounded"
                title="Certificate Preview"
              ></iframe>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={downloadCertificate}
              className="btn-primary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Certificate
            </button>
            
            <button
              onClick={() => {
                setCertificateUrl(null);
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Generate New
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-gray-50 border rounded-lg p-6 mb-4">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-medium">Volunteer:</h3>
                <p>{user.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Event:</h3>
                <p>{event.title}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">Date Attended:</h3>
                <p>{attendance.checkInTime ? format(new Date(attendance.checkInTime), 'MMM dd, yyyy') : 'Not recorded'}</p>
              </div>
              <div>
                <h3 className="font-medium">Hours Contributed:</h3>
                <p>{attendance.hoursContributed || 'Not recorded'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={generateCertificate}
              disabled={isGenerating}
              className="btn-primary flex items-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generate Certificate
                </>
              )}
            </button>
          </div>
        </>
      )}
      
      <canvas ref={canvasRef} className="hidden" width="842" height="595"></canvas>
    </div>
  );
};

export default CertificateGen;
