import { db, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc } from './firebase-config.js';

// db.js - Fitwave Firebase Database Service
class FitwaveDB {
  constructor() {
    this.userId = null;
  }

  setUserId(uid) {
    this.userId = uid;
    if (uid) {
      this.initializeData();
    }
  }

  // Set default mockup data in Firestore if none exists
  async initializeData() {
    if (!this.userId || !db) return;
    try {
      const userRef = doc(db, 'users', this.userId);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) {
        const initialData = {
          today: {
            date: new Date().toISOString().split('T')[0],
            water: 0,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            meals: {
              breakfast: [],
              lunch: [],
              dinner: [],
              snacks: []
            }
          },
          goals: {
            water: 3.0,
            calories: 2500,
            protein: 150,
            carbs: 250,
            fats: 70
          }
        };
        await setDoc(userRef, initialData);
      }
    } catch (e) {
      console.error("Error initializing user data:", e);
    }
  }

  async getData() {
    if (!this.userId || !db) return null;
    try {
      const userRef = doc(db, 'users', this.userId);
      const snap = await getDoc(userRef);
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.error("Error getting data:", e);
      return null;
    }
  }

  async saveData(data) {
    if (!this.userId || !db) return;
    try {
      const userRef = doc(db, 'users', this.userId);
      await updateDoc(userRef, data);
    } catch (e) {
      console.error("Error saving data:", e);
    }
  }

  async addWater(amount) {
    const data = await this.getData();
    if (data) {
      data.today.water += amount;
      await this.saveData({ 'today.water': data.today.water });
      return data.today.water;
    }
    return 0;
  }

  async addFood(mealType, food) {
    const data = await this.getData();
    if (data && data.today.meals[mealType]) {
      data.today.meals[mealType].push(food);
      data.today.calories += food.calories;
      data.today.protein += food.protein;
      data.today.carbs += food.carbs;
      data.today.fats += food.fats;
      await this.saveData({
        'today.meals': data.today.meals,
        'today.calories': data.today.calories,
        'today.protein': data.today.protein,
        'today.carbs': data.today.carbs,
        'today.fats': data.today.fats
      });
    }
  }

  async getHistory() {
    if (!this.userId || !db) return [];
    try {
      const historyRef = collection(db, 'users', this.userId, 'history');
      const q = query(historyRef);
      const snap = await getDocs(q);
      const history = [];
      snap.forEach(doc => history.push(doc.data()));
      
      // Return mock historical data if none exists
      return history.length > 0 ? history : [
        { date: '2023-10-01', calories: 2500, weight: 80.5 },
        { date: '2023-10-02', calories: 2700, weight: 80.2 },
        { date: '2023-10-03', calories: 2400, weight: 80.0 },
        { date: '2023-10-04', calories: 2800, weight: 79.8 },
        { date: '2023-10-05', calories: 2600, weight: 79.5 }
      ];
    } catch (e) {
      console.error("Error getting history:", e);
      return [];
    }
  }
}

// Instantiate globally on window to make it accessible to non-module scripts
window.dbService = new FitwaveDB();
