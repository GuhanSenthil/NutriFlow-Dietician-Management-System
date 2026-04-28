// In-memory database simulation
let db = {
  users: [
    {
      id: "patient-alice-01",
      name: "Alice Johnson",
      email: "alice@nutriflow.com",
      password: "password", // In a real app, hash this!
      role: "PATIENT",
      status: "active",
      applicationStatus: "ACCEPTED",
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
    },
    {
      id: "dietician-emily-01",
      name: "Dr. Emily Carter",
      email: "emily@nutriflow.com",
      password: "password",
      role: "DIETICIAN",
      status: "active",
      specialization: "Clinical Nutrition",
      bio: "Experienced dietician passionate about helping clients achieve their health goals through personalized nutrition plans.",
      pendingPatientIds: [],
      acceptedPatientIds: ["patient-alice-01"],
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
    },
    {
      id: "admin-user-01",
      name: "Admin User",
      email: "admin@nutriflow.com",
      password: "password",
      role: "ADMIN",
      status: "active",
    },
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
};

module.exports = db;