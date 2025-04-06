import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

const eventService = {
  // Create a new event
  async createEvent(eventData) {
    try {
      const eventRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: new Date(),
        status: 'upcoming',
        volunteers: []
      });
      
      return { id: eventRef.id, ...eventData };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Get a single event by ID
  async getEvent(eventId) {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (!eventSnap.exists()) {
        throw new Error('Event not found');
      }
      
      return { id: eventSnap.id, ...eventSnap.data() };
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  },

  // Update an event
  async updateEvent(eventId, updateData) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        ...updateData,
        updatedAt: new Date()
      });
      
      return { id: eventId, ...updateData };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete an event
  async deleteEvent(eventId) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await deleteDoc(eventRef);
      
      return { id: eventId };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Get all events
  async getAllEvents() {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('date', 'asc')
      );
      const eventsSnap = await getDocs(eventsQuery);
      
      return eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all events:', error);
      throw error;
    }
  },

  // Get NGO events
  async getNGOEvents(ngoId) {
    try {
      console.log('Fetching events for NGO:', ngoId);
      // First, get all events for this NGO
      const eventsQuery = query(
        collection(db, 'events'),
        where('ngoId', '==', ngoId)
      );
      const eventsSnap = await getDocs(eventsQuery);
      
      // Then sort them in memory
      const events = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by date
      events.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      console.log('Fetched events:', events);
      return events;
    } catch (error) {
      console.error('Error getting NGO events:', error);
      throw new Error('Failed to fetch events: ' + error.message);
    }
  },

  // Get upcoming events
  async getUpcomingEvents() {
    try {
      const now = new Date();
      const eventsQuery = query(
        collection(db, 'events'),
        where('date', '>=', now),
        orderBy('date', 'asc')
      );
      const eventsSnap = await getDocs(eventsQuery);
      
      return eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  },

  // Register volunteer for event
  async registerVolunteer(eventId, volunteerId) {
    try {
      const event = await this.getEvent(eventId);
      
      if (event.volunteers.includes(volunteerId)) {
        throw new Error('Volunteer already registered for this event');
      }
      
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        volunteers: [...event.volunteers, volunteerId],
        updatedAt: new Date()
      });
      
      return { id: eventId, volunteerId };
    } catch (error) {
      console.error('Error registering volunteer:', error);
      throw error;
    }
  },

  // Unregister volunteer from event
  async unregisterVolunteer(eventId, volunteerId) {
    try {
      const event = await this.getEvent(eventId);
      
      if (!event.volunteers.includes(volunteerId)) {
        throw new Error('Volunteer not registered for this event');
      }
      
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        volunteers: event.volunteers.filter(id => id !== volunteerId),
        updatedAt: new Date()
      });
      
      return { id: eventId, volunteerId };
    } catch (error) {
      console.error('Error unregistering volunteer:', error);
      throw error;
    }
  },

  // Get event statistics
  async getEventStats(ngoId) {
    try {
      console.log('Fetching stats for NGO:', ngoId);
      const eventsQuery = query(
        collection(db, 'events'),
        where('ngoId', '==', ngoId)
      );
      const eventsSnap = await getDocs(eventsQuery);
      
      const events = eventsSnap.docs.map(doc => doc.data());
      const now = new Date();
      
      const stats = {
        total: events.length,
        upcoming: events.filter(e => new Date(e.date) >= now).length,
        completed: events.filter(e => new Date(e.date) < now).length,
        totalVolunteers: events.reduce((acc, e) => acc + (e.volunteers?.length || 0), 0)
      };
      console.log('Calculated stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting event stats:', error);
      throw new Error('Failed to fetch event statistics: ' + error.message);
    }
  }
};

export default eventService; 