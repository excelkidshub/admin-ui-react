import type {
  AdminNotification,
  AdminNotificationSummary,
  Batch,
  BatchRequest,
  DashboardSummary,
  Enquiry,
  EnquiryStatus,
  Expense,
  ExpenseCategory,
  ExpenseCategoryReport,
  ExpenseRequest,
  MonthlyReport,
  PageResponse,
  Payment,
  PaymentRequest,
  StudentBatchAssignment,
  StudentRequest,
  StudentResponse,
  StudentSummary,
  StudentUpdateRequest,
  Teacher,
  TeacherBatchAssignment,
  TeacherRequest
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

function toQuery(params: Record<string, string | number | undefined | null>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (errorPayload.message) {
        message = errorPayload.message;
      }
    } catch {
      // ignore parse errors and keep fallback message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDashboardSummary: () => request<DashboardSummary>("/dashboard/summary"),
  getMonthlyProfit: () => request<MonthlyReport[]>("/analytics/profit/monthly"),
  getExpenseCategories: () => request<ExpenseCategoryReport[]>("/analytics/expense/category"),
  getNotifications: () => request<AdminNotification[]>("/admin/notifications"),
  getNotificationSummary: () => request<AdminNotificationSummary>("/admin/notifications/summary"),

  getEnquiries: (status?: EnquiryStatus) => request<Enquiry[]>(`/enquiries${toQuery({ status })}`),
  updateEnquiryStatus: (id: number, payload: { status: EnquiryStatus; followUpNotes: string }) =>
    request<Enquiry>(`/enquiries/${id}/status`, { method: "PUT", body: payload }),
  convertEnquiry: (id: number, payload: { student: StudentRequest; followUpNotes: string }) =>
    request<StudentResponse>(`/enquiries/${id}/convert`, { method: "POST", body: payload }),

  getStudents: (params: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    level?: string;
    batchId?: number | null;
    paymentStatus?: string;
  }) => request<PageResponse<StudentSummary>>(`/students${toQuery(params)}`),
  getStudentById: (id: number) => request<StudentResponse>(`/students/${id}`),
  createStudent: (payload: StudentRequest) => request<StudentResponse>("/students", { method: "POST", body: payload }),
  updateStudent: (id: number, payload: StudentUpdateRequest) => request<StudentResponse>(`/students/${id}`, { method: "PUT", body: payload }),
  archiveStudent: (id: number) => request<StudentResponse>(`/students/${id}/archive`, { method: "PUT" }),
  activateStudent: (id: number) => request<StudentResponse>(`/students/${id}/activate`, { method: "PUT" }),

  getBatches: () => request<Batch[]>("/batches"),
  createBatch: (payload: BatchRequest) => request<Batch>("/batches", { method: "POST", body: payload }),
  assignStudentToBatch: (payload: { studentId: number; batchId: number; assignedDate: string }) =>
    request<StudentBatchAssignment>("/batches/assign", { method: "POST", body: payload }),

  getTeachers: () => request<Teacher[]>("/teachers"),
  createTeacher: (payload: TeacherRequest) => request<Teacher>("/teachers", { method: "POST", body: payload }),
  updateTeacher: (id: number, payload: TeacherRequest) => request<Teacher>(`/teachers/${id}`, { method: "PUT", body: payload }),
  deleteTeacher: (id: number) => request<void>(`/teachers/${id}`, { method: "DELETE" }),
  assignTeacherToBatch: (payload: { teacherId: number; batchId: number; assignedDate: string }) =>
    request<TeacherBatchAssignment>("/teachers/assign-batch", { method: "POST", body: payload }),
  getTeacherBatches: (id: number) => request<TeacherBatchAssignment[]>(`/teachers/${id}/batches`),

  addPayment: (payload: PaymentRequest) => request<Payment>("/payments", { method: "POST", body: payload }),
  getPaymentsByStudent: (studentId: number) => request<Payment[]>(`/payments/student/${studentId}`),

  addExpense: (payload: ExpenseRequest) => request<Expense>("/expenses", { method: "POST", body: payload }),
  getExpenses: (params: { month?: string; category?: ExpenseCategory | "" }) =>
    request<Expense[]>(`/expenses${toQuery(params)}`)
};


export const dashboardApi = {
  getSummary: api.getDashboardSummary,
  getMonthlyRevenue: api.getMonthlyProfit,
  getMonthlyExpense: api.getMonthlyProfit,
  getMonthlyProfit: api.getMonthlyProfit,
  getExpenseCategories: api.getExpenseCategories,
  getNotifications: api.getNotifications,
  getNotificationSummary: api.getNotificationSummary
};

