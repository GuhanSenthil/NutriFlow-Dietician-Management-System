/**
 * Mock API Service
 * 
 * This file replaces the live API calls with a mock implementation that uses an
 * in-memory database. This allows the application to run as a standalone demo
 * without requiring a running backend, resolving potential "failed to fetch" errors.
 */
import {
  AppUser,
  Dietician,
  Patient,
  Role,
  User,
  ProgressLogEntry,
  DietPlan,
  Resource,
  Message,
  SymptomLogEntry,
  Notification,
  FoodDiaryEntry,
  Goal,
  Appointment,
  Broadcast,
  ApplicationStatus,
  Payment,
  DieticianPayment,
} from '../types';

// Simple UUID generator for mock data
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


// --- IN-MEMORY DATABASE ---
interface UserWithPassword extends User { password?: string; }
interface PatientWithPassword extends Patient { password?: string; }
interface DieticianWithPassword extends Dietician { password?: string; }
type AppUserWithPassword = PatientWithPassword | DieticianWithPassword | UserWithPassword;

interface DB {
  users: AppUserWithPassword[];
  resources: Resource[];
  chats: { [chatId: string]: Message[] };
  notifications: Notification[];
  appointments: Appointment[];
  broadcasts: Broadcast[];
  payments: Payment[];
  dieticianPayments: DieticianPayment[];
}

let db: DB = {
  users: [
    {
      id: "patient-alice-01",
      name: "Alice Johnson",
      email: "alice@nutriflow.com",
      password: "password",
      role: Role.PATIENT,
      status: "active",
      applicationStatus: ApplicationStatus.ACCEPTED,
      assignedDieticianId: "dietician-emily-01",
      profile: { age: 34, height: 165, weight: 70 },
      progressLog: [
        { id: "progress-1", date: "2024-07-01T10:00:00Z", weight: 72 },
        { id: "progress-2", date: "2024-07-08T10:00:00Z", weight: 71 },
        { id: "progress-3", date: "2024-07-15T10:00:00Z", weight: 70 },
      ],
      symptomLog: [],
      foodDiary: [],
      goals: [],
      resourceIds: ["resource-1"],
      dietPlan: {},
    } as PatientWithPassword,
    {
      id: "patient-bob-02",
      name: "Bob Williams",
      email: "bob@nutriflow.com",
      password: "password",
      role: Role.PATIENT,
      status: "active",
      applicationStatus: ApplicationStatus.ACCEPTED,
      assignedDieticianId: "dietician-emily-01",
      profile: { age: 45, height: 180, weight: 95 },
      progressLog: [],
      symptomLog: [],
      foodDiary: [],
      goals: [],
      resourceIds: [],
      dietPlan: {},
    } as PatientWithPassword,
    {
        id: "patient-charlie-03",
        name: "Charlie Brown",
        email: "charlie@nutriflow.com",
        password: "password",
        role: Role.PATIENT,
        status: "active",
        applicationStatus: ApplicationStatus.NONE,
        profile: { age: 28, height: 175, weight: 80 },
        progressLog: [],
        symptomLog: [],
        foodDiary: [],
        goals: [],
        resourceIds: [],
        dietPlan: {},
    } as PatientWithPassword,
    {
      id: "dietician-emily-01",
      name: "Dr. Emily Carter",
      email: "emily@nutriflow.com",
      password: "password",
      role: Role.DIETICIAN,
      status: "active",
      specialization: "Clinical Nutrition",
      bio: "Experienced dietician passionate about helping clients achieve their health goals through personalized nutrition plans.",
      pendingPatientIds: [],
      acceptedPatientsLog: [
        // Simulate 6 new patients last month to trigger bonus
        { patientId: 'patient-alice-01', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 5)).toISOString() },
        { patientId: 'patient-bob-02', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 10)).toISOString() },
        { patientId: 'temp-1', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 12)).toISOString() },
        { patientId: 'temp-2', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 15)).toISOString() },
        { patientId: 'temp-3', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 20)).toISOString() },
        { patientId: 'temp-4', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 25)).toISOString() },
      ],
      resourceIds: ["resource-1", "resource-2"],
      availableSlots: [
          new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
          new Date(Date.now() + 86400000 * 2).toISOString(), // Day after tomorrow
          new Date(Date.now() + 86400000 * 3).toISOString(),
      ].map(d => {
          const date = new Date(d);
          date.setHours(10, 0, 0, 0); // Set to 10:00 AM
          return date.toISOString();
      })
    } as DieticianWithPassword,
    {
      id: "admin-user-01",
      name: "Admin User",
      email: "admin@nutriflow.com",
      password: "password",
      role: Role.ADMIN,
      status: "active",
    } as UserWithPassword,
  ],
  resources: [
    {
      id: "resource-1",
      title: "Healthy Breakfast Ideas",
      type: "article",
      content: "Start your day with these nutritious and delicious breakfast options...",
      authorId: "dietician-emily-01",
    },
    {
      id: "resource-2",
      title: "Quinoa Salad Recipe",
      type: "recipe",
      content: "A refreshing and protein-packed quinoa salad perfect for lunch...",
      authorId: "dietician-emily-01",
    },
  ],
  chats: {
    "dietician-emily-01_patient-alice-01": [
      {
        id: "msg-1",
        senderId: "dietician-emily-01",
        receiverId: "patient-alice-01",
        text: "Hi Alice, how are you feeling this week?",
        timestamp: Date.now() - 200000
      },
      {
        id: "msg-2",
        senderId: "patient-alice-01",
        receiverId: "dietician-emily-01",
        text: "Much better, thank you! The new meal plan is great.",
        timestamp: Date.now() - 100000
      }
    ]
  },
  notifications: [
      { id: 'notif-1', userId: 'dietician-emily-01', message: 'You have a new patient application from John Smith.', read: false, timestamp: Date.now() - 86400000, type: 'application' },
      { id: 'notif-2', userId: 'patient-alice-01', message: 'Your application has been accepted by Dr. Emily Carter.', read: true, timestamp: Date.now() - 172800000, type: 'application' },
      { id: 'notif-3', userId: 'patient-alice-01', message: 'A new recipe "Summer Salad" has been added to your resources.', read: false, timestamp: Date.now() - 3600000, type: 'system' },
  ],
  appointments: [],
  broadcasts: [],
  payments: [
    { id: 'payment-1', patientId: 'patient-alice-01', amount: 75, date: '2024-07-01T10:00:00Z', status: 'completed' },
    { id: 'payment-2', patientId: 'patient-alice-01', amount: 75, date: '2024-06-01T10:00:00Z', status: 'completed' },
    { id: 'payment-3', patientId: 'patient-alice-01', amount: 75, date: '2024-05-01T10:00:00Z', status: 'completed' },
    { id: 'payment-4', patientId: 'patient-bob-02', amount: 75, date: '2024-07-10T10:00:00Z', status: 'completed' },
    { id: 'payment-5', patientId: 'patient-bob-02', amount: 75, date: '2024-06-10T10:00:00Z', status: 'pending' },
    { id: 'payment-6', patientId: 'patient-alice-01', amount: 75, date: '2024-08-01T10:00:00Z', status: 'failed' },
  ],
  dieticianPayments: [],
};


// --- MOCK API HELPERS ---
const MOCK_DELAY = 300;

const mockRequest = <T>(data: T, fail: boolean = false, errorMessage?: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (fail) {
                reject(new Error(errorMessage || 'An API error occurred.'));
            } else {
                if (data === undefined) {
                    resolve(data);
                    return;
                }
                // Deep copy to simulate immutable data from an API
                resolve(JSON.parse(JSON.stringify(data)));
            }
        }, MOCK_DELAY);
    });
};

const createNotification = (userId: string, message: string, type: Notification['type'] = 'system') => {
    const newNotif: Notification = {
        id: `notif-${uuidv4()}`,
        userId,
        message,
        read: false,
        timestamp: Date.now(),
        type,
    };
    db.notifications.push(newNotif);
};

const stripPassword = (user: AppUserWithPassword): AppUser => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as AppUser;
};


// --- MOCK API IMPLEMENTATION ---
export const api = {
  signIn: async (email: string, password: string): Promise<AppUser> => {
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
        return mockRequest(stripPassword(user));
    }
    return mockRequest(null as any, true, 'Invalid email or password.');
  },

  signUp: async (name: string, email: string, password: string, role: Role.PATIENT | Role.DIETICIAN): Promise<AppUser> => {
    if (db.users.some(u => u.email === email)) {
        return mockRequest(null as any, true, 'Email already in use.');
    }
    
    let newUser: AppUserWithPassword = {
        id: uuidv4(), name, email, password, role, status: 'active'
    };
    
    if (role === Role.PATIENT) {
        newUser = { ...newUser, applicationStatus: ApplicationStatus.NONE, profile: {} } as PatientWithPassword;
    } else {
        newUser = { ...newUser, specialization: 'General Nutrition', bio: 'Newly registered dietician.', pendingPatientIds: [], acceptedPatientsLog: [] } as DieticianWithPassword;
    }
    
    db.users.push(newUser);
    return mockRequest(stripPassword(newUser));
  },

  signOut: async (): Promise<void> => mockRequest(undefined),

  getUser: async (id: string): Promise<AppUser | null> => {
    const user = db.users.find(u => u.id === id);
    return user ? mockRequest(stripPassword(user)) : mockRequest(null);
  },

  getUsersByRole: async (role: Role): Promise<AppUser[]> => {
    const users = db.users.filter(u => u.role === role).map(stripPassword);
    return mockRequest(users);
  },

  getUsersByIds: async (ids: string[]): Promise<AppUser[]> => {
    if (!ids || ids.length === 0) return mockRequest([]);
    const users = db.users.filter(u => ids.includes(u.id)).map(stripPassword);
    return mockRequest(users);
  },

  updateUser: async (id: string, data: Partial<User | Patient | Dietician>): Promise<AppUser> => {
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) return mockRequest(null as any, true, 'User not found');
    
    const user = db.users[userIndex];
    Object.assign(user, data);
    db.users[userIndex] = user;

    return mockRequest(stripPassword(user));
  },

  getDieticians: async (): Promise<Dietician[]> => {
    const dieticians = db.users.filter(u => u.role === Role.DIETICIAN).map(stripPassword) as Dietician[];
    return mockRequest(dieticians);
  },

  applyToDietician: async (patientId: string, dieticianId: string): Promise<void> => {
    const dietician = db.users.find(u => u.id === dieticianId) as DieticianWithPassword;
    const patient = db.users.find(u => u.id === patientId) as PatientWithPassword;

    if (dietician && patient) {
        if (!dietician.pendingPatientIds.includes(patientId)) {
            dietician.pendingPatientIds.push(patientId);
        }
        patient.applicationStatus = ApplicationStatus.PENDING;
        createNotification(dieticianId, `You have a new patient application from ${patient.name}.`, 'application');
        return mockRequest(undefined);
    }
    return mockRequest(undefined, true, 'Patient or Dietician not found.');
  },

  handleApplication: async (dieticianId: string, patientId: string, action: 'accept' | 'reject'): Promise<void> => {
    const dietician = db.users.find(u => u.id === dieticianId) as DieticianWithPassword;
    const patient = db.users.find(u => u.id === patientId) as PatientWithPassword;
    
    if (dietician && patient) {
        dietician.pendingPatientIds = dietician.pendingPatientIds.filter(id => id !== patientId);
        if (action === 'accept') {
            if (!dietician.acceptedPatientsLog) dietician.acceptedPatientsLog = [];
            if (!dietician.acceptedPatientsLog.some(log => log.patientId === patientId)) {
                dietician.acceptedPatientsLog.push({ patientId, date: new Date().toISOString() });
            }
            patient.applicationStatus = ApplicationStatus.ACCEPTED;
            patient.assignedDieticianId = dieticianId;
            createNotification(patientId, `Your application has been accepted by ${dietician.name}.`, 'application');
        } else {
            patient.applicationStatus = ApplicationStatus.REJECTED;
            createNotification(patientId, `Your application has been reviewed by ${dietician.name}.`, 'application');
        }
        return mockRequest(undefined);
    }
    return mockRequest(undefined, true, 'Patient or Dietician not found.');
  },
  
  addProgressLog: async (patientId: string, entry: Omit<ProgressLogEntry, 'id'>): Promise<void> => {
    const patient = db.users.find(u => u.id === patientId) as PatientWithPassword;
    if (patient) {
        if (!patient.progressLog) patient.progressLog = [];
        patient.progressLog.push({ id: `progress-${Date.now()}`, ...entry });
        return mockRequest(undefined);
    }
  },

  addSymptomLog: async (patientId: string, entry: Omit<SymptomLogEntry, 'id' | 'date'>): Promise<void> => {
     const patient = db.users.find(u => u.id === patientId) as PatientWithPassword;
     if (patient) {
        if (!patient.symptomLog) patient.symptomLog = [];
        patient.symptomLog.push({ id: `symptom-${Date.now()}`, date: new Date().toISOString(), ...entry });
        return mockRequest(undefined);
     }
  },

  addFoodDiaryEntry: async (patientId: string, entry: Omit<FoodDiaryEntry, 'id'>): Promise<void> => {
     const patient = db.users.find(u => u.id === patientId) as PatientWithPassword;
     if (patient) {
        if (!patient.foodDiary) patient.foodDiary = [];
        const existing = patient.foodDiary.find(e => e.date === entry.date);
        if (existing) {
            Object.assign(existing.meals, entry.meals);
        } else {
            patient.foodDiary.push({ id: `diary-${uuidv4()}`, ...entry });
        }
        return mockRequest(undefined);
     }
  },

  addGoal: async (patientId: string, goal: Omit<Goal, 'id' | 'completed'>): Promise<void> => {
     const patient = db.users.find(u => u.id === patientId) as PatientWithPassword;
     if (patient) {
        if (!patient.goals) patient.goals = [];
        patient.goals.push({ id: `goal-${uuidv4()}`, completed: false, ...goal });
        return mockRequest(undefined);
     }
  },

  updatePatientDietPlan: async (patientId: string, dietPlan: DietPlan): Promise<void> => {
    const patient = db.users.find(u => u.id === patientId) as PatientWithPassword;
    if (patient) {
        patient.dietPlan = dietPlan;
        return mockRequest(undefined);
    }
  },
  
  createResource: async (resourceData: Omit<Resource, 'id'>): Promise<Resource> => {
    const newResource = { id: uuidv4(), ...resourceData };
    db.resources.push(newResource);
    const dietician = db.users.find(u => u.id === newResource.authorId) as DieticianWithPassword;
    if (dietician) {
        if (!dietician.resourceIds) dietician.resourceIds = [];
        dietician.resourceIds.push(newResource.id);
    }
    return mockRequest(newResource);
  },

  getResourcesByIds: async (resourceIds: string[]): Promise<Resource[]> => {
    if (!resourceIds || resourceIds.length === 0) return mockRequest([]);
    const resources = db.resources.filter(r => resourceIds.includes(r.id));
    return mockRequest(resources);
  },

  assignResourceToPatient: async (patientId: string, resourceId: string): Promise<void> => {
    const patient = db.users.find(u => u.id === patientId) as PatientWithPassword;
    if (patient) {
        if (!patient.resourceIds) patient.resourceIds = [];
        if (!patient.resourceIds.includes(resourceId)) {
            patient.resourceIds.push(resourceId);
        }
        return mockRequest(undefined);
    }
  },

  unassignResourceFromPatient: async (patientId: string, resourceId: string): Promise<void> => {
    const patient = db.users.find(u => u.id === patientId) as PatientWithPassword;
    if (patient && patient.resourceIds) {
        patient.resourceIds = patient.resourceIds.filter(id => id !== resourceId);
    }
    return mockRequest(undefined);
  },

  getMessages: (chatId: string, callback: (messages: Message[]) => void): (() => void) => {
    const messages = db.chats[chatId] || [];
    callback(JSON.parse(JSON.stringify(messages)));
    return () => {}; // No-op for mock
  },

  sendMessage: async (chatId: string, message: Omit<Message, 'id'>): Promise<void> => {
    if (!db.chats[chatId]) db.chats[chatId] = [];
    db.chats[chatId].push({ id: uuidv4(), ...message });
    return mockRequest(undefined);
  },

  getNotifications: async (userId: string): Promise<Notification[]> => {
    const notifications = db.notifications.filter(n => n.userId === userId);
    return mockRequest(notifications);
  },

  markNotificationsAsRead: async (userId: string): Promise<void> => {
    db.notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
    });
    return mockRequest(undefined);
  },

  sendBroadcast: async (message: string, role: Role.PATIENT | Role.DIETICIAN): Promise<void> => {
    db.users.forEach(user => {
        if (user.role === role) {
            createNotification(user.id, message, 'broadcast');
        }
    });
    return mockRequest(undefined);
  },

  getAppointments: async(dieticianId: string): Promise<Appointment[]> => {
    const appointments = db.appointments.filter(a => a.dieticianId === dieticianId);
    return mockRequest(appointments);
  },

  bookAppointment: async(patientId: string, dieticianId: string, dateTime: string): Promise<Appointment> => {
    const patient = db.users.find(u => u.id === patientId);
    const dietician = db.users.find(u => u.id === dieticianId) as DieticianWithPassword;

    if (!patient || !dietician) {
      return mockRequest(null as any, true, 'Patient or dietician not found.');
    }
    
    if (!dietician.availableSlots) dietician.availableSlots = [];
    const slotIndex = dietician.availableSlots.findIndex(s => s === dateTime);
    if (slotIndex === -1) {
      return mockRequest(null as any, true, 'This time slot is no longer available.');
    }
    dietician.availableSlots.splice(slotIndex, 1);

    const newAppointment: Appointment = {
        id: `appt-${uuidv4()}`,
        patientId,
        patientName: patient.name,
        dieticianId,
        dateTime,
        status: 'confirmed',
    };
    db.appointments.push(newAppointment);

    createNotification(dieticianId, `New appointment booked by ${patient.name} for ${new Date(dateTime).toLocaleString()}.`, 'appointment');

    return mockRequest(newAppointment);
  },

  addPayment: async (patientId: string, amount: number): Promise<Payment> => {
    const newPayment: Payment = {
        id: `payment-${uuidv4()}`,
        patientId,
        amount,
        date: new Date().toISOString(),
        status: 'completed',
    };
    db.payments.push(newPayment);
    return mockRequest(newPayment);
  },

  getPaymentsByPatientId: async(patientId: string): Promise<Payment[]> => {
    const payments = db.payments.filter(p => p.patientId === patientId);
    return mockRequest(payments);
  },

  getAllPayments: async(): Promise<Payment[]> => {
      return mockRequest(db.payments);
  },

  payDietician: async (dieticianId: string, amount: number, forMonth: string): Promise<DieticianPayment> => {
    const newPayment: DieticianPayment = {
        id: `d-payment-${uuidv4()}`,
        dieticianId,
        amount,
        date: new Date().toISOString(),
        forMonth,
    };
    db.dieticianPayments.push(newPayment);
    createNotification(dieticianId, `Your salary of ₹${amount.toLocaleString()} for ${new Date(forMonth + '-02').toLocaleString('default', { month: 'long' })} has been processed.`, 'system');
    return mockRequest(newPayment);
  },

  getDieticianPayments: async (): Promise<DieticianPayment[]> => {
      return mockRequest(db.dieticianPayments);
  },
};