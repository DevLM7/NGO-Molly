import { db, storage } from '../config/firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const resourceService = {
  // Create a new resource
  async createResource(resourceData, file = null) {
    try {
      let fileUrl = null;
      
      if (file) {
        const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }
      
      const resourceRef = await addDoc(collection(db, 'resources'), {
        ...resourceData,
        fileUrl,
        createdAt: new Date(),
        status: 'active'
      });
      
      return { id: resourceRef.id, ...resourceData, fileUrl };
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  // Get a single resource by ID
  async getResource(resourceId) {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceSnap = await getDoc(resourceRef);
      
      if (!resourceSnap.exists()) {
        throw new Error('Resource not found');
      }
      
      return { id: resourceSnap.id, ...resourceSnap.data() };
    } catch (error) {
      console.error('Error getting resource:', error);
      throw error;
    }
  },

  // Update a resource
  async updateResource(resourceId, updateData, file = null) {
    try {
      let fileUrl = updateData.fileUrl;
      
      if (file) {
        // Delete old file if exists
        if (updateData.fileUrl) {
          const oldFileRef = ref(storage, updateData.fileUrl);
          await deleteObject(oldFileRef);
        }
        
        // Upload new file
        const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }
      
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        ...updateData,
        fileUrl,
        updatedAt: new Date()
      });
      
      return { id: resourceId, ...updateData, fileUrl };
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  // Delete a resource
  async deleteResource(resourceId) {
    try {
      const resource = await this.getResource(resourceId);
      
      if (resource.fileUrl) {
        const fileRef = ref(storage, resource.fileUrl);
        await deleteObject(fileRef);
      }
      
      const resourceRef = doc(db, 'resources', resourceId);
      await deleteDoc(resourceRef);
      
      return { id: resourceId };
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },

  // Get all resources for an NGO
  async getNGOResources(ngoId) {
    try {
      const resourcesQuery = query(
        collection(db, 'resources'),
        where('ngoId', '==', ngoId),
        orderBy('createdAt', 'desc')
      );
      const resourcesSnap = await getDocs(resourcesQuery);
      
      return resourcesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting NGO resources:', error);
      throw error;
    }
  },

  // Get resources by event
  async getEventResources(eventId) {
    try {
      const resourcesQuery = query(
        collection(db, 'resources'),
        where('eventId', '==', eventId),
        orderBy('createdAt', 'desc')
      );
      const resourcesSnap = await getDocs(resourcesQuery);
      
      return resourcesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting event resources:', error);
      throw error;
    }
  },

  // Update resource status
  async updateResourceStatus(resourceId, status) {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        status,
        updatedAt: new Date()
      });
      return { id: resourceId, status };
    } catch (error) {
      console.error('Error updating resource status:', error);
      throw error;
    }
  },

  // Get resource statistics
  async getResourceStats(ngoId) {
    try {
      const resourcesQuery = query(
        collection(db, 'resources'),
        where('ngoId', '==', ngoId)
      );
      const resourcesSnap = await getDocs(resourcesQuery);
      
      const resources = resourcesSnap.docs.map(doc => doc.data());
      
      return {
        total: resources.length,
        active: resources.filter(r => r.status === 'active').length,
        archived: resources.filter(r => r.status === 'archived').length,
        byType: resources.reduce((acc, r) => {
          acc[r.type] = (acc[r.type] || 0) + 1;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error getting resource stats:', error);
      throw error;
    }
  }
};

export default resourceService; 