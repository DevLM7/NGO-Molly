import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

const applicationService = {
  // Create a new application
  async createApplication(applicationData) {
    try {
      const applicationRef = await addDoc(collection(db, 'applications'), {
        ...applicationData,
        createdAt: new Date(),
        status: 'pending'
      });
      return { id: applicationRef.id, ...applicationData };
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  // Get a single application by ID
  async getApplication(applicationId) {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      const applicationSnap = await getDoc(applicationRef);
      
      if (!applicationSnap.exists()) {
        throw new Error('Application not found');
      }
      
      return { id: applicationSnap.id, ...applicationSnap.data() };
    } catch (error) {
      console.error('Error getting application:', error);
      throw error;
    }
  },

  // Update an application
  async updateApplication(applicationId, updateData) {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        ...updateData,
        updatedAt: new Date()
      });
      return { id: applicationId, ...updateData };
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  },

  // Delete an application
  async deleteApplication(applicationId) {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await deleteDoc(applicationRef);
      return { id: applicationId };
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },

  // Get all applications for an NGO
  async getNGOApplications(ngoId) {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('ngoId', '==', ngoId),
        orderBy('createdAt', 'desc')
      );
      const applicationsSnap = await getDocs(applicationsQuery);
      
      return applicationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting NGO applications:', error);
      throw error;
    }
  },

  // Get applications by volunteer
  async getVolunteerApplications(volunteerId) {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('volunteerId', '==', volunteerId),
        orderBy('createdAt', 'desc')
      );
      const applicationsSnap = await getDocs(applicationsQuery);
      
      return applicationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting volunteer applications:', error);
      throw error;
    }
  },

  // Update application status
  async updateApplicationStatus(applicationId, status) {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status,
        updatedAt: new Date()
      });
      return { id: applicationId, status };
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  // Get application statistics
  async getApplicationStats(ngoId) {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('ngoId', '==', ngoId)
      );
      const applicationsSnap = await getDocs(applicationsQuery);
      
      const applications = applicationsSnap.docs.map(doc => doc.data());
      
      return {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length
      };
    } catch (error) {
      console.error('Error getting application stats:', error);
      throw error;
    }
  }
};

export default applicationService; 