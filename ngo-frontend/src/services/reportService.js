import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const reportService = {
  // Create a new report
  async createReport(reportData) {
    try {
      const reportRef = await addDoc(collection(db, 'reports'), {
        ...reportData,
        createdAt: new Date(),
        status: 'open',
        assignedTo: null
      });
      return { id: reportRef.id, ...reportData };
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  // Get a single report by ID
  async getReport(reportId) {
    try {
      const reportRef = doc(db, 'reports', reportId);
      const reportSnap = await getDoc(reportRef);
      
      if (!reportSnap.exists()) {
        throw new Error('Report not found');
      }
      
      return { id: reportSnap.id, ...reportSnap.data() };
    } catch (error) {
      console.error('Error getting report:', error);
      throw error;
    }
  },

  // Update a report
  async updateReport(reportId, updateData) {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        ...updateData,
        updatedAt: new Date()
      });
      return { id: reportId, ...updateData };
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },

  // Delete a report
  async deleteReport(reportId) {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await deleteDoc(reportRef);
      return { id: reportId };
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  // Get reports for an event
  async getEventReports(eventId) {
    try {
      const reportsQuery = query(
        collection(db, 'reports'),
        where('eventId', '==', eventId)
      );
      const reportsSnap = await getDocs(reportsQuery);
      
      return reportsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting event reports:', error);
      throw error;
    }
  },

  // Get reports by user
  async getUserReports(userId) {
    try {
      const reportsQuery = query(
        collection(db, 'reports'),
        where('userId', '==', userId)
      );
      const reportsSnap = await getDocs(reportsQuery);
      
      return reportsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user reports:', error);
      throw error;
    }
  },

  // Get reports assigned to user
  async getAssignedReports(userId) {
    try {
      const reportsQuery = query(
        collection(db, 'reports'),
        where('assignedTo', '==', userId)
      );
      const reportsSnap = await getDocs(reportsQuery);
      
      return reportsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting assigned reports:', error);
      throw error;
    }
  },

  // Update report status
  async updateReportStatus(reportId, status) {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status,
        updatedAt: new Date()
      });
      return { id: reportId, status };
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  },

  // Assign report to user
  async assignReport(reportId, assigneeId) {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        assignedTo: assigneeId,
        updatedAt: new Date()
      });
      return { id: reportId, assignedTo: assigneeId };
    } catch (error) {
      console.error('Error assigning report:', error);
      throw error;
    }
  },

  // Get report statistics
  async getReportStats(ngoId) {
    try {
      const reportsQuery = query(
        collection(db, 'reports'),
        where('ngoId', '==', ngoId)
      );
      const reportsSnap = await getDocs(reportsQuery);
      
      const reports = reportsSnap.docs.map(doc => doc.data());
      
      return {
        total: reports.length,
        open: reports.filter(r => r.status === 'open').length,
        inProgress: reports.filter(r => r.status === 'in_progress').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        closed: reports.filter(r => r.status === 'closed').length
      };
    } catch (error) {
      console.error('Error getting report stats:', error);
      throw error;
    }
  }
};

export default reportService; 