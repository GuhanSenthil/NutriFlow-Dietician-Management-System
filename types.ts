export enum Role {
  PATIENT = 'PATIENT',
  DIETICIAN = 'DIETICIAN',
  ADMIN = 'ADMIN',
}

export enum ApplicationStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum MealType {
    BREAKFAST = 'Breakfast',
    LUNCH = 'Lunch',
    DINNER = 'Dinner',
    SNACK = 'Snack'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'deactivated';
}

export interface DietPlan {
  [date: string]: { // e.g., '2023-10-27'
    [meal in MealType]?: string; // e.g., 'Oatmeal with berries'
  };
}

export interface ProgressLogEntry {
  id: string;
  date: string; // ISO string
  weight: number;
}

export interface FoodDiaryEntry {
    id: string;
    date: string; // 'YYYY-MM-DD'
    meals: {
        [MealType.BREAKFAST]?: string;
        [MealType.LUNCH]?: string;
        [MealType.DINNER]?: string;
        [MealType.SNACK]?: string;
    };
}

export interface SymptomLogEntry {
  id: string;
  date: string; // ISO string
  symptom: string;
  severity: number; // 1-5
  notes: string;
}

export interface Goal {
  id: string;
  description: string;
  completed: boolean;
}

export interface Patient extends User {
  role: Role.PATIENT;
  profile: {
    age?: number;
    height?: number; // in cm
    weight?: number; // in kg
  };
  applicationStatus: ApplicationStatus;
  assignedDieticianId?: string;
  dietPlan?: DietPlan;
  progressLog?: ProgressLogEntry[];
  foodDiary?: FoodDiaryEntry[];
  shoppingList?: string[];
  achievements?: string[]; // e.g., ['5-day-streak']
  goals?: Goal[];
  symptomLog?: SymptomLogEntry[];
  resourceIds?: string[];
}

export interface Dietician extends User {
  role: Role.DIETICIAN;
  specialization: string;
  bio: string;
  pendingPatientIds: string[];
  acceptedPatientsLog: { patientId: string; date: string; }[];
  availableSlots?: string[]; // e.g., ['2023-11-01T10:00:00Z']
  resourceIds?: string[];
  templateIds?: string[];
}

export type AppUser = Patient | Dietician | User;

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  dieticianId: string;
  dateTime: string; // ISO string
  status: 'confirmed' | 'cancelled';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'article' | 'recipe';
  content: string;
  authorId: string; // Dietician ID
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
}

export interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  timestamp: number;
}

export interface Broadcast {
  id: string;
  targetRole: Role.PATIENT | Role.DIETICIAN;
  message: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  timestamp: number;
  type: 'application' | 'broadcast' | 'system' | 'appointment';
}

export interface DietPlanTemplate {
  id: string;
  name: string;
  dietPlan: DietPlan;
  authorId: string; // Dietician ID
}

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  date: string; // ISO string
  status: 'completed' | 'pending' | 'failed';
}

export interface DieticianPayment {
  id: string;
  dieticianId: string;
  amount: number;
  date: string; // ISO string
  forMonth: string; // e.g., "YYYY-MM"
}