export type LearningMode = "ONLINE" | "OFFLINE";
export type EnquiryStatus = "NEW" | "FOLLOW_UP" | "CONVERTED" | "CLOSED";
export type DerivedPaymentStatus = "PENDING" | "PARTIAL" | "PAID";
export type BatchStatus = "UPCOMING" | "ACTIVE" | "COMPLETED";
export type PaymentMode = "UPI" | "CASH" | "BANK";
export type ExpenseCategory = "SALARY" | "RENT" | "STATIONARY" | "MARKETING" | "OTHER";
export type AdminNotificationPriority = "HIGH" | "MEDIUM" | "LOW";

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type DashboardSummary = {
  activeStudents: number;
  unpaidStudents: number;
  activeBatches: number;
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
};

export type MonthlyReport = {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
};

export type ExpenseCategoryReport = {
  category: ExpenseCategory;
  totalAmount: number;
};

export type AdminNotification = {
  type: string;
  title: string;
  message: string;
  priority: AdminNotificationPriority;
  referenceType: string;
  referenceId: number | null;
  createdAt: string;
};

export type AdminNotificationSummary = {
  totalNotifications: number;
  newEnquiries: number;
  followUpPending: number;
};

export type Enquiry = {
  id: number;
  studentName: string;
  parentName: string;
  mobile: string;
  email: string | null;
  childAge: number | null;
  preferredLevel: string | null;
  preferredMode: LearningMode | null;
  message: string | null;
  followUpNotes: string | null;
  source: string | null;
  status: EnquiryStatus;
  convertedStudentId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type StudentSummary = {
  studentId: number;
  studentName: string;
  level: string;
  batchName: string | null;
  totalFee: number;
  totalPaid: number;
  pendingAmount: number;
  paymentStatus: DerivedPaymentStatus;
};

export type StudentDetail = {
  id: number;
  studentName: string;
  modeOfLearning: LearningMode;
  level: string;
  age: number;
  gender: string | null;
  schoolName: string | null;
  grade: string | null;
  parentName: string;
  mobile: string;
  email: string | null;
  portalLoginEmail: string;
  address: string | null;
  notes: string | null;
  source: string | null;
  customFee: number | null;
  active: boolean;
  currentBatchName: string | null;
  createdAt: string;
};

export type StudentResponse = {
  student: StudentDetail;
  summary: StudentSummary;
};

export type StudentRequest = {
  studentName: string;
  modeOfLearning: LearningMode;
  level: string;
  age: number;
  gender: string | null;
  schoolName: string | null;
  grade: string | null;
  parentName: string;
  mobile: string;
  email: string | null;
  portalLoginEmail: string;
  portalPassword: string;
  address: string | null;
  notes: string | null;
  source: string | null;
  customFee: number | null;
};

export type StudentUpdateRequest = StudentRequest;

export type Batch = {
  id: number;
  batchName: string;
  level: string;
  batchCode: string;
  startDate: string;
  endDate: string | null;
  timeSlot: string;
  days: string;
  sessions: string;
  mode: LearningMode;
  location: string;
  status: BatchStatus;
  totalStudents: number;
};

export type BatchRequest = {
  batchName: string;
  level: string;
  batchCode: string;
  startDate: string;
  endDate: string | null;
  timeSlot: string;
  days: string;
  sessions: string;
  mode: LearningMode;
  location: string;
  status: BatchStatus;
};

export type StudentBatchAssignment = {
  id: number;
  studentId: number;
  studentName: string;
  batchId: number;
  batchName: string;
  assignedDate: string;
};

export type Teacher = {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
};

export type TeacherRequest = {
  name: string;
  mobile: string;
  email: string | null;
};

export type TeacherBatchAssignment = {
  teacherId: number;
  teacherName: string;
  batchId: number;
  batchName: string;
  level: string;
  assignedDate: string;
};

export type Payment = {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string;
  transactionId: string | null;
  totalFee: number;
  totalPaid: number;
  pendingAmount: number;
  paymentStatus: DerivedPaymentStatus;
};

export type PaymentRequest = {
  studentId: number;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string;
  transactionId: string | null;
};

export type Expense = {
  id: number;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  expenseDate: string;
  paymentMode: PaymentMode;
};

export type ExpenseRequest = {
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  expenseDate: string;
  paymentMode: PaymentMode;
};

export type ApiErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
};



