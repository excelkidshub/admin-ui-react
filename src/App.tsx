import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "./lib/api";
import type {
  AdminNotification,
  AdminNotificationSummary,
  Batch,
  BatchRequest,
  BatchStatus,
  DashboardSummary,
  DerivedPaymentStatus,
  Enquiry,
  EnquiryStatus,
  Expense,
  ExpenseCategory,
  ExpenseCategoryReport,
  ExpenseRequest,
  LearningMode,
  MonthlyReport,
  Payment,
  PaymentMode,
  PaymentRequest,
  StudentRequest,
  StudentResponse,
  StudentSummary,
  StudentUpdateRequest,
  Teacher,
  TeacherRequest,
  TeacherBatchAssignment
} from "./types";

type ViewKey =
  | "dashboard"
  | "enquiries"
  | "students"
  | "batches"
  | "teachers"
  | "payments"
  | "expenses"
  | "notifications";

type StudentFormState = {
  id: number | null;
  studentName: string;
  modeOfLearning: LearningMode;
  level: string;
  age: string;
  gender: string;
  schoolName: string;
  grade: string;
  parentName: string;
  mobile: string;
  email: string;
  portalLoginEmail: string;
  portalPassword: string;
  address: string;
  notes: string;
  source: string;
  customFee: string;
};

type BatchFormState = {
  batchName: string;
  level: string;
  batchCode: string;
  startDate: string;
  endDate: string;
  timeSlot: string;
  days: string;
  sessions: string;
  mode: LearningMode;
  location: string;
  status: BatchStatus;
};

type TeacherFormState = {
  id: number | null;
  name: string;
  mobile: string;
  email: string;
};

type PaymentFormState = {
  studentId: string;
  amount: string;
  paymentMode: PaymentMode;
  paymentDate: string;
  transactionId: string;
};

type ExpenseFormState = {
  amount: string;
  category: ExpenseCategory;
  description: string;
  expenseDate: string;
  paymentMode: PaymentMode;
};

const views: { key: ViewKey; label: string; description: string }[] = [
  { key: "dashboard", label: "Dashboard", description: "Snapshot, trends, and alerts" },
  { key: "enquiries", label: "Enquiries", description: "Follow-up and conversion" },
  { key: "students", label: "Students", description: "Admissions and fee view" },
  { key: "batches", label: "Batches", description: "Master data and assignment" },
  { key: "teachers", label: "Teachers", description: "People and batch mapping" },
  { key: "payments", label: "Payments", description: "Installments and status" },
  { key: "expenses", label: "Expenses", description: "Operational cost tracking" },
  { key: "notifications", label: "Notifications", description: "Admin action feed" }
];

const learningModes: LearningMode[] = ["ONLINE", "OFFLINE"];
const enquiryStatuses: EnquiryStatus[] = ["NEW", "FOLLOW_UP", "CONVERTED", "CLOSED"];
const paymentStatuses: DerivedPaymentStatus[] = ["PENDING", "PARTIAL", "PAID"];
const batchStatuses: BatchStatus[] = ["UPCOMING", "ACTIVE", "COMPLETED"];
const paymentModes: PaymentMode[] = ["UPI", "CASH", "BANK"];
const expenseCategories: ExpenseCategory[] = ["SALARY", "RENT", "STATIONARY", "MARKETING", "OTHER"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyStudentForm(): StudentFormState {
  return {
    id: null,
    studentName: "",
    modeOfLearning: "OFFLINE",
    level: "L1",
    age: "",
    gender: "",
    schoolName: "",
    grade: "",
    parentName: "",
    mobile: "",
    email: "",
    portalLoginEmail: "",
    portalPassword: "",
    address: "",
    notes: "",
    source: "ADMIN",
    customFee: ""
  };
}

function emptyBatchForm(): BatchFormState {
  return {
    batchName: "",
    level: "L1",
    batchCode: "B1",
    startDate: today(),
    endDate: "",
    timeSlot: "6-7 PM",
    days: "Mon/Wed/Fri",
    sessions: "20-24",
    mode: "OFFLINE",
    location: "Dhanori Pune",
    status: "ACTIVE"
  };
}

function emptyTeacherForm(): TeacherFormState {
  return { id: null, name: "", mobile: "", email: "" };
}

function emptyPaymentForm(): PaymentFormState {
  return { studentId: "", amount: "", paymentMode: "UPI", paymentDate: today(), transactionId: "" };
}

function emptyExpenseForm(): ExpenseFormState {
  return { amount: "", category: "SALARY", description: "", expenseDate: today(), paymentMode: "BANK" };
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value ?? 0);
}

function formatDate(value: string | null | undefined) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "-";
}

function formatDateTime(value: string | null | undefined) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-";
}

function sanitizeStudentPayload(form: StudentFormState): StudentRequest {
  return {
    studentName: form.studentName.trim(),
    modeOfLearning: form.modeOfLearning,
    level: form.level.trim(),
    age: Number(form.age),
    gender: form.gender.trim() || null,
    schoolName: form.schoolName.trim() || null,
    grade: form.grade.trim() || null,
    parentName: form.parentName.trim(),
    mobile: form.mobile.trim(),
    email: form.email.trim() || null,
    portalLoginEmail: form.portalLoginEmail.trim(),
    portalPassword: form.portalPassword.trim(),
    address: form.address.trim() || null,
    notes: form.notes.trim() || null,
    source: form.source.trim() || null,
    customFee: form.customFee.trim() ? Number(form.customFee) : null
  };
}

function sanitizeBatchPayload(form: BatchFormState): BatchRequest {
  return {
    batchName: form.batchName.trim(),
    level: form.level.trim(),
    batchCode: form.batchCode.trim(),
    startDate: form.startDate,
    endDate: form.endDate || null,
    timeSlot: form.timeSlot.trim(),
    days: form.days.trim(),
    sessions: form.sessions.trim(),
    mode: form.mode,
    location: form.location.trim(),
    status: form.status
  };
}

function studentFormFromResponse(response: StudentResponse): StudentFormState {
  return {
    id: response.student.id,
    studentName: response.student.studentName,
    modeOfLearning: response.student.modeOfLearning,
    level: response.student.level,
    age: String(response.student.age),
    gender: response.student.gender ?? "",
    schoolName: response.student.schoolName ?? "",
    grade: response.student.grade ?? "",
    parentName: response.student.parentName,
    mobile: response.student.mobile,
    email: response.student.email ?? "",
    portalLoginEmail: response.student.portalLoginEmail,
    portalPassword: "",
    address: response.student.address ?? "",
    notes: response.student.notes ?? "",
    source: response.student.source ?? "",
    customFee: response.student.customFee == null ? "" : String(response.student.customFee)
  };
}

function studentFormFromEnquiry(enquiry: Enquiry): StudentFormState {
  return {
    id: null,
    studentName: enquiry.studentName,
    modeOfLearning: enquiry.preferredMode ?? "OFFLINE",
    level: enquiry.preferredLevel ?? "L1",
    age: enquiry.childAge == null ? "" : String(enquiry.childAge),
    gender: "",
    schoolName: "",
    grade: "",
    parentName: enquiry.parentName,
    mobile: enquiry.mobile,
    email: enquiry.email ?? "",
    portalLoginEmail: enquiry.email ?? "",
    portalPassword: "",
    address: "",
    notes: enquiry.message ?? "",
    source: enquiry.source ?? "WEBSITE",
    customFee: ""
  };
}

function App() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [banner, setBanner] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [globalBusy, setGlobalBusy] = useState(false);

  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [profitReports, setProfitReports] = useState<MonthlyReport[]>([]);
  const [expenseReport, setExpenseReport] = useState<ExpenseCategoryReport[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationSummary, setNotificationSummary] = useState<AdminNotificationSummary | null>(null);

  const [enquiryFilter, setEnquiryFilter] = useState<"ALL" | EnquiryStatus>("ALL");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | null>(null);
  const [enquiryStatusForm, setEnquiryStatusForm] = useState({ status: "FOLLOW_UP" as EnquiryStatus, followUpNotes: "" });
  const [enquiryConvertForm, setEnquiryConvertForm] = useState<StudentFormState>(emptyStudentForm());

  const [studentPage, setStudentPage] = useState<{ content: StudentSummary[]; totalElements: number; page: number }>({ content: [], totalElements: 0, page: 0 });
  const [studentFilters, setStudentFilters] = useState({ level: "", paymentStatus: "", page: 0 });
  const [studentForm, setStudentForm] = useState<StudentFormState>(emptyStudentForm());
  const [studentFormMode, setStudentFormMode] = useState<"create" | "edit">("create");
  const [studentDetail, setStudentDetail] = useState<StudentResponse | null>(null);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchForm, setBatchForm] = useState<BatchFormState>(emptyBatchForm());
  const [batchAssignForm, setBatchAssignForm] = useState({ studentId: "", batchId: "", assignedDate: today() });

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherForm, setTeacherForm] = useState<TeacherFormState>(emptyTeacherForm());
  const [teacherAssignForm, setTeacherAssignForm] = useState({ teacherId: "", batchId: "", assignedDate: today() });
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherBatchAssignment[]>([]);

  const [studentOptions, setStudentOptions] = useState<StudentSummary[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(emptyPaymentForm());

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseFilters, setExpenseFilters] = useState({ month: "", category: "" as "" | ExpenseCategory });
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(emptyExpenseForm());

  const selectedEnquiry = useMemo(() => enquiries.find((item) => item.id === selectedEnquiryId) ?? null, [enquiries, selectedEnquiryId]);
  const selectedStudentSummary = useMemo(
    () => studentOptions.find((student) => String(student.studentId) === paymentForm.studentId) ?? null,
    [studentOptions, paymentForm.studentId]
  );

  async function runTask(task: () => Promise<void>, successMessage?: string) {
    setGlobalBusy(true);
    setBanner(null);
    try {
      await task();
      if (successMessage) {
        setBanner({ tone: "success", text: successMessage });
      }
    } catch (error) {
      setBanner({ tone: "error", text: error instanceof Error ? error.message : "Something went wrong" });
    } finally {
      setGlobalBusy(false);
    }
  }

  async function loadDashboard() {
    const [summary, profit, categories, feed, feedSummary] = await Promise.all([
      api.getDashboardSummary(),
      api.getMonthlyProfit(),
      api.getExpenseCategories(),
      api.getNotifications(),
      api.getNotificationSummary()
    ]);
    setDashboardSummary(summary);
    setProfitReports(profit);
    setExpenseReport(categories);
    setNotifications(feed);
    setNotificationSummary(feedSummary);
  }

  async function loadEnquiries() {
    const next = await api.getEnquiries(enquiryFilter === "ALL" ? undefined : enquiryFilter);
    setEnquiries(next);
    if (next.length > 0 && !next.some((item) => item.id === selectedEnquiryId)) {
      setSelectedEnquiryId(next[0].id);
    }
    if (next.length === 0) {
      setSelectedEnquiryId(null);
    }
  }

  async function loadStudents() {
    const page = await api.getStudents({
      page: studentFilters.page,
      size: 20,
      sortBy: "createdAt",
      direction: "desc",
      level: studentFilters.level || undefined,
      paymentStatus: studentFilters.paymentStatus || undefined
    });
    setStudentPage({ content: page.content, totalElements: page.totalElements, page: page.page });
  }

  async function loadStudentOptions() {
    const page = await api.getStudents({ page: 0, size: 200, sortBy: "studentName", direction: "asc" });
    setStudentOptions(page.content);
  }

  async function loadBatches() {
    setBatches(await api.getBatches());
  }

  async function loadTeachers() {
    setTeachers(await api.getTeachers());
  }

  async function loadExpenses() {
    setExpenses(await api.getExpenses(expenseFilters));
  }

  async function loadPayments(studentId: number) {
    setPayments(await api.getPaymentsByStudent(studentId));
  }

  async function loadTeacherAssignments(teacherId: number) {
    setTeacherAssignments(await api.getTeacherBatches(teacherId));
  }

  useEffect(() => {
    void runTask(async () => {
      await Promise.all([loadDashboard(), loadStudents(), loadStudentOptions(), loadBatches(), loadTeachers(), loadExpenses()]);
    });
  }, []);

  useEffect(() => {
    if (activeView === "enquiries") {
      void runTask(loadEnquiries);
    }
  }, [activeView, enquiryFilter]);

  useEffect(() => {
    if (activeView === "students") {
      void runTask(loadStudents);
    }
  }, [activeView, studentFilters.page, studentFilters.level, studentFilters.paymentStatus]);

  useEffect(() => {
    if (activeView === "expenses") {
      void runTask(loadExpenses);
    }
  }, [activeView, expenseFilters.month, expenseFilters.category]);

  useEffect(() => {
    if (selectedEnquiry) {
      setEnquiryStatusForm({ status: selectedEnquiry.status, followUpNotes: selectedEnquiry.followUpNotes ?? "" });
      setEnquiryConvertForm(studentFormFromEnquiry(selectedEnquiry));
    }
  }, [selectedEnquiry]);

  async function handleEnquiryStatusSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEnquiry) {
      return;
    }
    await runTask(async () => {
      await api.updateEnquiryStatus(selectedEnquiry.id, enquiryStatusForm);
      await Promise.all([loadEnquiries(), loadDashboard()]);
    }, "Enquiry status updated.");
  }

  async function handleEnquiryConvertSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEnquiry) {
      return;
    }
    await runTask(async () => {
      await api.convertEnquiry(selectedEnquiry.id, {
        student: sanitizeStudentPayload(enquiryConvertForm),
        followUpNotes: enquiryStatusForm.followUpNotes
      });
      await Promise.all([loadEnquiries(), loadStudents(), loadStudentOptions(), loadDashboard()]);
    }, "Enquiry converted into student registration.");
  }

  async function handleStudentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runTask(async () => {
      if (studentFormMode === "create") {
        await api.createStudent(sanitizeStudentPayload(studentForm));
      } else if (studentForm.id != null) {
        await api.updateStudent(studentForm.id, sanitizeStudentPayload(studentForm) as StudentUpdateRequest);
      }
      setStudentForm(emptyStudentForm());
      setStudentFormMode("create");
      setStudentDetail(null);
      await Promise.all([loadStudents(), loadStudentOptions(), loadDashboard()]);
    }, studentFormMode === "create" ? "Student registered." : "Student updated.");
  }

  async function openStudentForEdit(studentId: number) {
    await runTask(async () => {
      const response = await api.getStudentById(studentId);
      setStudentDetail(response);
      setStudentForm(studentFormFromResponse(response));
      setStudentFormMode("edit");
      setActiveView("students");
    });
  }

  async function handleArchiveToggle(studentId: number, action: "archive" | "activate") {
    await runTask(async () => {
      if (action === "archive") {
        await api.archiveStudent(studentId);
      } else {
        await api.activateStudent(studentId);
      }
      await Promise.all([loadStudents(), loadStudentOptions(), loadDashboard()]);
    }, action === "archive" ? "Student archived." : "Student activated.");
  }

  async function handleBatchCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runTask(async () => {
      await api.createBatch(sanitizeBatchPayload(batchForm));
      setBatchForm(emptyBatchForm());
      await Promise.all([loadBatches(), loadDashboard()]);
    }, "Batch created.");
  }

  async function handleBatchAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runTask(async () => {
      await api.assignStudentToBatch({
        studentId: Number(batchAssignForm.studentId),
        batchId: Number(batchAssignForm.batchId),
        assignedDate: batchAssignForm.assignedDate
      });
      await Promise.all([loadStudents(), loadBatches()]);
    }, "Student assigned to batch.");
  }

  async function handleTeacherSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runTask(async () => {
      const payload: TeacherRequest = {
        name: teacherForm.name.trim(),
        mobile: teacherForm.mobile.trim(),
        email: teacherForm.email.trim() || null
      };
      if (teacherForm.id == null) {
        await api.createTeacher(payload);
      } else {
        await api.updateTeacher(teacherForm.id, payload);
      }
      setTeacherForm(emptyTeacherForm());
      await loadTeachers();
    }, teacherForm.id == null ? "Teacher created." : "Teacher updated.");
  }
  async function handleTeacherDelete(id: number) {
    await runTask(async () => {
      await api.deleteTeacher(id);
      await loadTeachers();
      if (teacherAssignForm.teacherId === String(id)) {
        setTeacherAssignments([]);
        setTeacherAssignForm({ teacherId: "", batchId: "", assignedDate: today() });
      }
    }, "Teacher removed.");
  }

  async function handleTeacherAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runTask(async () => {
      const teacherId = Number(teacherAssignForm.teacherId);
      await api.assignTeacherToBatch({
        teacherId,
        batchId: Number(teacherAssignForm.batchId),
        assignedDate: teacherAssignForm.assignedDate
      });
      await loadTeacherAssignments(teacherId);
    }, "Teacher assigned to batch.");
  }

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runTask(async () => {
      const payload: PaymentRequest = {
        studentId: Number(paymentForm.studentId),
        amount: Number(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
        paymentDate: paymentForm.paymentDate,
        transactionId: paymentForm.transactionId.trim() || null
      };
      await api.addPayment(payload);
      setPaymentForm((current) => ({ ...current, amount: "", transactionId: "" }));
      await Promise.all([loadPayments(payload.studentId), loadStudents(), loadStudentOptions(), loadDashboard()]);
    }, "Payment recorded.");
  }

  async function handleExpenseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runTask(async () => {
      const payload: ExpenseRequest = {
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description.trim() || null,
        expenseDate: expenseForm.expenseDate,
        paymentMode: expenseForm.paymentMode
      };
      await api.addExpense(payload);
      setExpenseForm(emptyExpenseForm());
      await Promise.all([loadExpenses(), loadDashboard()]);
    }, "Expense added.");
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <p>Excel Kids Hub</p>
          <h1>Admin UI</h1>
          <span>Admissions, operations, and finance in one place.</span>
        </div>
        <nav className="sidebar__nav">
          {views.map((view) => (
            <button key={view.key} className={view.key === activeView ? "nav-button nav-button--active" : "nav-button"} onClick={() => setActiveView(view.key)} type="button">
              <strong>{view.label}</strong>
              <span>{view.description}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Phonics Academy Management</p>
            <h2>{views.find((view) => view.key === activeView)?.label}</h2>
          </div>
          <div className="topbar__meta">
            <span className="chip">API: localhost:8080</span>
            <span className={globalBusy ? "chip chip--busy" : "chip"}>{globalBusy ? "Working..." : "Ready"}</span>
          </div>
        </header>

        {banner ? <div className={`banner banner--${banner.tone}`}>{banner.text}</div> : null}

        {activeView === "dashboard" ? (
          <section className="view-grid">
            <div className="panel panel--wide">
              <div className="panel__header"><div><h3>Snapshot</h3><p>Current operations overview from the backend.</p></div></div>
              <div className="stat-grid">
                <StatCard label="Active students" value={String(dashboardSummary?.activeStudents ?? 0)} helper="Admissions currently running" />
                <StatCard label="Unpaid students" value={String(dashboardSummary?.unpaidStudents ?? 0)} helper="Require fee follow-up" tone="warn" />
                <StatCard label="Active batches" value={String(dashboardSummary?.activeBatches ?? 0)} helper="Batches in progress" />
                <StatCard label="Total revenue" value={formatCurrency(dashboardSummary?.totalRevenue)} helper="Payments collected" tone="good" />
                <StatCard label="Total expense" value={formatCurrency(dashboardSummary?.totalExpense)} helper="Operational spend" />
                <StatCard label="Profit" value={formatCurrency(dashboardSummary?.totalProfit)} helper="Revenue minus expense" tone="good" />
              </div>
            </div>

            <div className="panel panel--wide">
              <div className="panel__header"><div><h3>Monthly profit view</h3><p>Monthly revenue, expense, and profit from analytics API.</p></div></div>
              <SimpleMonthlyTable reports={profitReports} />
            </div>

            <div className="panel">
              <div className="panel__header"><div><h3>Expense categories</h3><p>Where the academy is spending now.</p></div></div>
              <div className="list-stack">
                {expenseReport.map((item) => <div className="list-row" key={item.category}><span>{item.category}</span><strong>{formatCurrency(item.totalAmount)}</strong></div>)}
              </div>
            </div>

            <div className="panel">
              <div className="panel__header"><div><h3>Admin alerts</h3><p>Notifications raised from enquiry activity.</p></div></div>
              <div className="alert-summary">
                <div><strong>{notificationSummary?.totalNotifications ?? 0}</strong><span>Total</span></div>
                <div><strong>{notificationSummary?.newEnquiries ?? 0}</strong><span>New enquiries</span></div>
                <div><strong>{notificationSummary?.followUpPending ?? 0}</strong><span>Follow-up</span></div>
              </div>
              <NotificationList notifications={notifications.slice(0, 5)} />
            </div>
          </section>
        ) : null}

        {activeView === "enquiries" ? (
          <section className="two-column-layout">
            <div className="panel">
              <div className="panel__header panel__header--stacked">
                <div><h3>Enquiry pipeline</h3><p>Track website leads and convert them into admissions.</p></div>
                <div className="toolbar"><label><span>Status</span><select value={enquiryFilter} onChange={(event) => setEnquiryFilter(event.target.value as "ALL" | EnquiryStatus)}><option value="ALL">All</option>{enquiryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div>
              </div>
              <div className="table-wrap">
                <table className="data-table"><thead><tr><th>Student</th><th>Parent</th><th>Status</th><th>Created</th></tr></thead><tbody>
                  {enquiries.map((enquiry) => <tr className={selectedEnquiryId === enquiry.id ? "table-row table-row--selected" : "table-row"} key={enquiry.id} onClick={() => setSelectedEnquiryId(enquiry.id)}><td>{enquiry.studentName}</td><td>{enquiry.parentName}</td><td>{enquiry.status}</td><td>{formatDateTime(enquiry.createdAt)}</td></tr>)}
                </tbody></table>
              </div>
            </div>

            <div className="stacked-panels">
              <div className="panel">
                <div className="panel__header"><div><h3>Selected enquiry</h3><p>{selectedEnquiry ? `${selectedEnquiry.parentName} for ${selectedEnquiry.studentName}` : "Choose an enquiry"}</p></div></div>
                {selectedEnquiry ? <div className="detail-grid"><Info label="Mobile" value={selectedEnquiry.mobile} /><Info label="Email" value={selectedEnquiry.email || "-"} /><Info label="Preferred level" value={selectedEnquiry.preferredLevel || "-"} /><Info label="Preferred mode" value={selectedEnquiry.preferredMode || "-"} /><Info label="Message" value={selectedEnquiry.message || "-"} full /></div> : <p className="empty-state">Select an enquiry to update status or convert it.</p>}
              </div>

              <form className="panel" onSubmit={handleEnquiryStatusSubmit}>
                <div className="panel__header"><div><h3>Follow-up update</h3><p>Keep notes and move enquiry through the pipeline.</p></div></div>
                <div className="form-grid">
                  <label><span>Status</span><select value={enquiryStatusForm.status} onChange={(event) => setEnquiryStatusForm((current) => ({ ...current, status: event.target.value as EnquiryStatus }))}>{enquiryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                  <label className="field field--full"><span>Follow-up notes</span><textarea value={enquiryStatusForm.followUpNotes} onChange={(event) => setEnquiryStatusForm((current) => ({ ...current, followUpNotes: event.target.value }))} rows={4} /></label>
                </div>
                <div className="actions"><button className="button button--primary" disabled={!selectedEnquiry || globalBusy} type="submit">Save follow-up</button></div>
              </form>

              <form className="panel" onSubmit={handleEnquiryConvertSubmit}>
                <div className="panel__header"><div><h3>Convert to admission</h3><p>Create a student from the selected enquiry.</p></div></div>
                <StudentFormFields form={enquiryConvertForm} onChange={setEnquiryConvertForm} includePassword />
                <div className="actions"><button className="button button--primary" disabled={!selectedEnquiry || globalBusy} type="submit">Convert enquiry</button></div>
              </form>
            </div>
          </section>
        ) : null}
        {activeView === "students" ? (
          <section className="two-column-layout two-column-layout--students">
            <div className="panel">
              <div className="panel__header panel__header--stacked">
                <div><h3>Student list</h3><p>Admissions, fee visibility, and payment status.</p></div>
                <div className="toolbar toolbar--grid">
                  <label><span>Level</span><input value={studentFilters.level} onChange={(event) => setStudentFilters((current) => ({ ...current, level: event.target.value, page: 0 }))} placeholder="L1 / L2 / Basic" /></label>
                  <label><span>Payment</span><select value={studentFilters.paymentStatus} onChange={(event) => setStudentFilters((current) => ({ ...current, paymentStatus: event.target.value, page: 0 }))}><option value="">All</option>{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                </div>
              </div>
              <div className="table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Level</th><th>Batch</th><th>Total fee</th><th>Paid</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                {studentPage.content.map((student) => <tr key={student.studentId}><td>{student.studentName}</td><td>{student.level}</td><td>{student.batchName || "-"}</td><td>{formatCurrency(student.totalFee)}</td><td>{formatCurrency(student.totalPaid)}</td><td>{student.paymentStatus}</td><td><div className="inline-actions"><button className="button button--ghost" onClick={() => void openStudentForEdit(student.studentId)} type="button">Edit</button><button className="button button--ghost" onClick={() => void handleArchiveToggle(student.studentId, "archive")} type="button">Archive</button><button className="button button--ghost" onClick={() => void handleArchiveToggle(student.studentId, "activate")} type="button">Activate</button></div></td></tr>)}
              </tbody></table></div>
              <div className="pagination-row"><span>Total students: {studentPage.totalElements}</span><div className="inline-actions"><button className="button button--ghost" disabled={studentFilters.page === 0} onClick={() => setStudentFilters((current) => ({ ...current, page: Math.max(current.page - 1, 0) }))} type="button">Previous</button><span>Page {studentPage.page + 1}</span><button className="button button--ghost" disabled={studentPage.content.length < 20} onClick={() => setStudentFilters((current) => ({ ...current, page: current.page + 1 }))} type="button">Next</button></div></div>
            </div>

            <div className="stacked-panels">
              <form className="panel" onSubmit={handleStudentSubmit}>
                <div className="panel__header"><div><h3>{studentFormMode === "create" ? "Register student" : "Edit student"}</h3><p>{studentFormMode === "create" ? "Create a new student admission." : "Update selected student details."}</p></div>{studentFormMode === "edit" ? <button className="button button--ghost" onClick={() => { setStudentForm(emptyStudentForm()); setStudentFormMode("create"); setStudentDetail(null); }} type="button">Reset</button> : null}</div>
                <StudentFormFields form={studentForm} onChange={setStudentForm} includePassword={studentFormMode === "create"} />
                <div className="actions"><button className="button button--primary" disabled={globalBusy} type="submit">{studentFormMode === "create" ? "Register" : "Save changes"}</button></div>
              </form>

              <form className="panel" onSubmit={handleBatchAssign}>
                <div className="panel__header"><div><h3>Assign student to batch</h3><p>Link admission to an existing batch.</p></div></div>
                <div className="form-grid">
                  <label><span>Student</span><select value={batchAssignForm.studentId} onChange={(event) => setBatchAssignForm((current) => ({ ...current, studentId: event.target.value }))}><option value="">Select student</option>{studentOptions.map((student) => <option key={student.studentId} value={student.studentId}>{student.studentName}</option>)}</select></label>
                  <label><span>Batch</span><select value={batchAssignForm.batchId} onChange={(event) => setBatchAssignForm((current) => ({ ...current, batchId: event.target.value }))}><option value="">Select batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batchName}</option>)}</select></label>
                  <label><span>Assigned date</span><input type="date" value={batchAssignForm.assignedDate} onChange={(event) => setBatchAssignForm((current) => ({ ...current, assignedDate: event.target.value }))} /></label>
                </div>
                <div className="actions"><button className="button button--primary" disabled={globalBusy} type="submit">Assign batch</button></div>
              </form>

              {studentDetail ? <div className="panel"><div className="panel__header"><div><h3>Student detail</h3><p>Current admission snapshot.</p></div></div><div className="detail-grid"><Info label="Name" value={studentDetail.student.studentName} /><Info label="Parent" value={studentDetail.student.parentName} /><Info label="Mobile" value={studentDetail.student.mobile} /><Info label="Portal login" value={studentDetail.student.portalLoginEmail} /><Info label="Batch" value={studentDetail.student.currentBatchName || "-"} /><Info label="Payment status" value={studentDetail.summary.paymentStatus} /></div></div> : null}
            </div>
          </section>
        ) : null}

        {activeView === "batches" ? (
          <section className="two-column-layout">
            <div className="panel">
              <div className="panel__header"><div><h3>Batch master data</h3><p>Available batches configured in backend.</p></div></div>
              <div className="table-wrap"><table className="data-table"><thead><tr><th>Batch</th><th>Level</th><th>Schedule</th><th>Mode</th><th>Status</th><th>Students</th></tr></thead><tbody>
                {batches.map((batch) => <tr key={batch.id}><td>{batch.batchName}</td><td>{batch.level}</td><td>{batch.days} | {batch.timeSlot}</td><td>{batch.mode}</td><td>{batch.status}</td><td>{batch.totalStudents}</td></tr>)}
              </tbody></table></div>
            </div>

            <div className="stacked-panels">
              <form className="panel" onSubmit={handleBatchCreate}>
                <div className="panel__header"><div><h3>Create batch</h3><p>Add a new academy batch.</p></div></div>
                <BatchFormFields form={batchForm} onChange={setBatchForm} />
                <div className="actions"><button className="button button--primary" disabled={globalBusy} type="submit">Create batch</button></div>
              </form>

              <form className="panel" onSubmit={handleBatchAssign}>
                <div className="panel__header"><div><h3>Quick assign</h3><p>Map a student into a selected batch.</p></div></div>
                <div className="form-grid">
                  <label><span>Student</span><select value={batchAssignForm.studentId} onChange={(event) => setBatchAssignForm((current) => ({ ...current, studentId: event.target.value }))}><option value="">Select student</option>{studentOptions.map((student) => <option key={student.studentId} value={student.studentId}>{student.studentName}</option>)}</select></label>
                  <label><span>Batch</span><select value={batchAssignForm.batchId} onChange={(event) => setBatchAssignForm((current) => ({ ...current, batchId: event.target.value }))}><option value="">Select batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batchName}</option>)}</select></label>
                  <label><span>Assigned date</span><input type="date" value={batchAssignForm.assignedDate} onChange={(event) => setBatchAssignForm((current) => ({ ...current, assignedDate: event.target.value }))} /></label>
                </div>
                <div className="actions"><button className="button button--primary" disabled={globalBusy} type="submit">Assign student</button></div>
              </form>
            </div>
          </section>
        ) : null}

        {activeView === "teachers" ? (
          <section className="two-column-layout">
            <div className="panel">
              <div className="panel__header"><div><h3>Teachers</h3><p>Manage teachers and view assigned batches.</p></div></div>
              <div className="table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Actions</th></tr></thead><tbody>
                {teachers.map((teacher) => <tr key={teacher.id}><td>{teacher.name}</td><td>{teacher.mobile}</td><td>{teacher.email || "-"}</td><td><div className="inline-actions"><button className="button button--ghost" onClick={() => setTeacherForm({ id: teacher.id, name: teacher.name, mobile: teacher.mobile, email: teacher.email || "" })} type="button">Edit</button><button className="button button--ghost" onClick={() => void loadTeacherAssignments(teacher.id)} type="button">Batches</button><button className="button button--ghost button--danger" onClick={() => void handleTeacherDelete(teacher.id)} type="button">Delete</button></div></td></tr>)}
              </tbody></table></div>
            </div>

            <div className="stacked-panels">
              <form className="panel" onSubmit={handleTeacherSubmit}>
                <div className="panel__header"><div><h3>{teacherForm.id == null ? "Add teacher" : "Edit teacher"}</h3><p>Create or update teacher records.</p></div></div>
                <div className="form-grid">
                  <label><span>Name</span><input value={teacherForm.name} onChange={(event) => setTeacherForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                  <label><span>Mobile</span><input value={teacherForm.mobile} onChange={(event) => setTeacherForm((current) => ({ ...current, mobile: event.target.value }))} required /></label>
                  <label className="field field--full"><span>Email</span><input value={teacherForm.email} onChange={(event) => setTeacherForm((current) => ({ ...current, email: event.target.value }))} /></label>
                </div>
                <div className="actions"><button className="button button--primary" disabled={globalBusy} type="submit">{teacherForm.id == null ? "Save teacher" : "Update teacher"}</button></div>
              </form>

              <form className="panel" onSubmit={handleTeacherAssign}>
                <div className="panel__header"><div><h3>Assign teacher to batch</h3><p>Map teacher workload to active batches.</p></div></div>
                <div className="form-grid">
                  <label><span>Teacher</span><select value={teacherAssignForm.teacherId} onChange={(event) => setTeacherAssignForm((current) => ({ ...current, teacherId: event.target.value }))}><option value="">Select teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></label>
                  <label><span>Batch</span><select value={teacherAssignForm.batchId} onChange={(event) => setTeacherAssignForm((current) => ({ ...current, batchId: event.target.value }))}><option value="">Select batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batchName}</option>)}</select></label>
                  <label><span>Assigned date</span><input type="date" value={teacherAssignForm.assignedDate} onChange={(event) => setTeacherAssignForm((current) => ({ ...current, assignedDate: event.target.value }))} /></label>
                </div>
                <div className="actions"><button className="button button--primary" disabled={globalBusy} type="submit">Assign teacher</button></div>
              </form>

              <div className="panel"><div className="panel__header"><div><h3>Teacher batch assignments</h3><p>Shows assignments for the selected teacher.</p></div></div><div className="list-stack">{teacherAssignments.length === 0 ? <p className="empty-state">Select a teacher and load assignments.</p> : null}{teacherAssignments.map((assignment) => <div className="list-row" key={`${assignment.teacherId}-${assignment.batchId}-${assignment.assignedDate}`}><div><strong>{assignment.batchName}</strong><span>{assignment.level} | {formatDate(assignment.assignedDate)}</span></div></div>)}</div></div>
            </div>
          </section>
        ) : null}
        {activeView === "payments" ? (
          <section className="two-column-layout">
            <div className="panel">
              <div className="panel__header panel__header--stacked"><div><h3>Payment history</h3><p>Installments and derived payment status.</p></div><div className="toolbar"><label><span>Student</span><select value={paymentForm.studentId} onChange={(event) => { const studentId = event.target.value; setPaymentForm((current) => ({ ...current, studentId })); if (studentId) { void runTask(() => loadPayments(Number(studentId))); } else { setPayments([]); } }}><option value="">Select student</option>{studentOptions.map((student) => <option key={student.studentId} value={student.studentId}>{student.studentName}</option>)}</select></label></div></div>
              {selectedStudentSummary ? <div className="summary-strip"><span>Total fee: {formatCurrency(selectedStudentSummary.totalFee)}</span><span>Paid: {formatCurrency(selectedStudentSummary.totalPaid)}</span><span>Pending: {formatCurrency(selectedStudentSummary.pendingAmount)}</span><span>Status: {selectedStudentSummary.paymentStatus}</span></div> : null}
              <div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Transaction</th><th>Status</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td>{formatDate(payment.paymentDate)}</td><td>{formatCurrency(payment.amount)}</td><td>{payment.paymentMode}</td><td>{payment.transactionId || "-"}</td><td>{payment.paymentStatus}</td></tr>)}</tbody></table></div>
            </div>

            <form className="panel" onSubmit={handlePaymentSubmit}>
              <div className="panel__header"><div><h3>Add payment</h3><p>Record a new installment against a student.</p></div></div>
              <div className="form-grid">
                <label><span>Student</span><select value={paymentForm.studentId} onChange={(event) => setPaymentForm((current) => ({ ...current, studentId: event.target.value }))}><option value="">Select student</option>{studentOptions.map((student) => <option key={student.studentId} value={student.studentId}>{student.studentName}</option>)}</select></label>
                <label><span>Amount</span><input type="number" min="1" step="0.01" value={paymentForm.amount} onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} required /></label>
                <label><span>Payment mode</span><select value={paymentForm.paymentMode} onChange={(event) => setPaymentForm((current) => ({ ...current, paymentMode: event.target.value as PaymentMode }))}>{paymentModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</select></label>
                <label><span>Payment date</span><input type="date" value={paymentForm.paymentDate} onChange={(event) => setPaymentForm((current) => ({ ...current, paymentDate: event.target.value }))} /></label>
                <label className="field field--full"><span>Transaction id</span><input value={paymentForm.transactionId} onChange={(event) => setPaymentForm((current) => ({ ...current, transactionId: event.target.value }))} /></label>
              </div>
              <div className="actions"><button className="button button--primary" disabled={globalBusy} type="submit">Record payment</button></div>
            </form>
          </section>
        ) : null}

        {activeView === "expenses" ? (
          <section className="two-column-layout">
            <div className="panel">
              <div className="panel__header panel__header--stacked"><div><h3>Expense register</h3><p>Track expenses by month and category.</p></div><div className="toolbar toolbar--grid"><label><span>Month</span><input type="month" value={expenseFilters.month} onChange={(event) => setExpenseFilters((current) => ({ ...current, month: event.target.value }))} /></label><label><span>Category</span><select value={expenseFilters.category} onChange={(event) => setExpenseFilters((current) => ({ ...current, category: event.target.value as "" | ExpenseCategory }))}><option value="">All</option>{expenseCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label></div></div>
              <div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Mode</th><th>Amount</th></tr></thead><tbody>{expenses.map((expense) => <tr key={expense.id}><td>{formatDate(expense.expenseDate)}</td><td>{expense.category}</td><td>{expense.description || "-"}</td><td>{expense.paymentMode}</td><td>{formatCurrency(expense.amount)}</td></tr>)}</tbody></table></div>
            </div>

            <form className="panel" onSubmit={handleExpenseSubmit}>
              <div className="panel__header"><div><h3>Add expense</h3><p>Capture operational spending.</p></div></div>
              <div className="form-grid">
                <label><span>Amount</span><input type="number" min="1" step="0.01" value={expenseForm.amount} onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))} required /></label>
                <label><span>Category</span><select value={expenseForm.category} onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value as ExpenseCategory }))}>{expenseCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                <label><span>Date</span><input type="date" value={expenseForm.expenseDate} onChange={(event) => setExpenseForm((current) => ({ ...current, expenseDate: event.target.value }))} /></label>
                <label><span>Payment mode</span><select value={expenseForm.paymentMode} onChange={(event) => setExpenseForm((current) => ({ ...current, paymentMode: event.target.value as PaymentMode }))}>{paymentModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</select></label>
                <label className="field field--full"><span>Description</span><textarea rows={4} value={expenseForm.description} onChange={(event) => setExpenseForm((current) => ({ ...current, description: event.target.value }))} /></label>
              </div>
              <div className="actions"><button className="button button--primary" disabled={globalBusy} type="submit">Save expense</button></div>
            </form>
          </section>
        ) : null}

        {activeView === "notifications" ? (
          <section className="two-column-layout">
            <div className="panel panel--wide"><div className="panel__header"><div><h3>Notification feed</h3><p>Admin action feed currently driven by enquiries.</p></div></div><NotificationList notifications={notifications} /></div>
            <div className="panel"><div className="panel__header"><div><h3>Summary</h3><p>Useful counts for follow-up work.</p></div></div><div className="alert-summary alert-summary--vertical"><div><strong>{notificationSummary?.totalNotifications ?? 0}</strong><span>Total notifications</span></div><div><strong>{notificationSummary?.newEnquiries ?? 0}</strong><span>New enquiries</span></div><div><strong>{notificationSummary?.followUpPending ?? 0}</strong><span>Follow-up pending</span></div></div></div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function StatCard({ label, value, helper, tone = "neutral" }: { label: string; value: string; helper: string; tone?: "neutral" | "good" | "warn" }) {
  return <article className={`stat-card stat-card--${tone}`}><span>{label}</span><strong>{value}</strong><small>{helper}</small></article>;
}

function SimpleMonthlyTable({ reports }: { reports: MonthlyReport[] }) {
  if (reports.length === 0) return <p className="empty-state">No monthly reports yet.</p>;
  return <div className="table-wrap"><table className="data-table"><thead><tr><th>Month</th><th>Revenue</th><th>Expense</th><th>Profit</th></tr></thead><tbody>{reports.map((report) => <tr key={report.month}><td>{report.month}</td><td>{formatCurrency(report.revenue)}</td><td>{formatCurrency(report.expense)}</td><td>{formatCurrency(report.profit)}</td></tr>)}</tbody></table></div>;
}

function NotificationList({ notifications }: { notifications: AdminNotification[] }) {
  if (notifications.length === 0) return <p className="empty-state">No notifications right now.</p>;
  return <div className="notification-list">{notifications.map((notification) => <article className={`notification notification--${notification.priority.toLowerCase()}`} key={`${notification.type}-${notification.referenceId}-${notification.createdAt}`}><div className="notification__meta"><span>{notification.priority}</span><time>{formatDateTime(notification.createdAt)}</time></div><strong>{notification.title}</strong><p>{notification.message}</p></article>)}</div>;
}

function Info({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return <div className={full ? "info-block info-block--full" : "info-block"}><span>{label}</span><strong>{value}</strong></div>;
}

function StudentFormFields({ form, onChange, includePassword }: { form: StudentFormState; onChange: React.Dispatch<React.SetStateAction<StudentFormState>>; includePassword: boolean; }) {
  return <div className="form-grid">
    <label><span>Student name</span><input value={form.studentName} onChange={(event) => onChange((current) => ({ ...current, studentName: event.target.value }))} required /></label>
    <label><span>Parent name</span><input value={form.parentName} onChange={(event) => onChange((current) => ({ ...current, parentName: event.target.value }))} required /></label>
    <label><span>Mode</span><select value={form.modeOfLearning} onChange={(event) => onChange((current) => ({ ...current, modeOfLearning: event.target.value as LearningMode }))}>{learningModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</select></label>
    <label><span>Level</span><input value={form.level} onChange={(event) => onChange((current) => ({ ...current, level: event.target.value }))} required /></label>
    <label><span>Age</span><input type="number" min="1" value={form.age} onChange={(event) => onChange((current) => ({ ...current, age: event.target.value }))} required /></label>
    <label><span>Gender</span><input value={form.gender} onChange={(event) => onChange((current) => ({ ...current, gender: event.target.value }))} /></label>
    <label><span>School</span><input value={form.schoolName} onChange={(event) => onChange((current) => ({ ...current, schoolName: event.target.value }))} /></label>
    <label><span>Grade</span><input value={form.grade} onChange={(event) => onChange((current) => ({ ...current, grade: event.target.value }))} /></label>
    <label><span>Mobile</span><input value={form.mobile} onChange={(event) => onChange((current) => ({ ...current, mobile: event.target.value }))} required /></label>
    <label><span>Email</span><input type="email" value={form.email} onChange={(event) => onChange((current) => ({ ...current, email: event.target.value }))} /></label>
    <label><span>Portal login email</span><input type="email" value={form.portalLoginEmail} onChange={(event) => onChange((current) => ({ ...current, portalLoginEmail: event.target.value }))} required /></label>
    <label><span>{includePassword ? "Portal password" : "New portal password"}</span><input type="password" value={form.portalPassword} onChange={(event) => onChange((current) => ({ ...current, portalPassword: event.target.value }))} required={includePassword} /></label>
    <label><span>Custom fee</span><input type="number" min="1" step="0.01" value={form.customFee} onChange={(event) => onChange((current) => ({ ...current, customFee: event.target.value }))} /></label>
    <label><span>Source</span><input value={form.source} onChange={(event) => onChange((current) => ({ ...current, source: event.target.value }))} /></label>
    <label className="field field--full"><span>Address</span><textarea rows={3} value={form.address} onChange={(event) => onChange((current) => ({ ...current, address: event.target.value }))} /></label>
    <label className="field field--full"><span>Notes</span><textarea rows={4} value={form.notes} onChange={(event) => onChange((current) => ({ ...current, notes: event.target.value }))} /></label>
  </div>;
}

function BatchFormFields({ form, onChange }: { form: BatchFormState; onChange: React.Dispatch<React.SetStateAction<BatchFormState>> }) {
  return <div className="form-grid">
    <label><span>Batch name</span><input value={form.batchName} onChange={(event) => onChange((current) => ({ ...current, batchName: event.target.value }))} required /></label>
    <label><span>Level</span><input value={form.level} onChange={(event) => onChange((current) => ({ ...current, level: event.target.value }))} required /></label>
    <label><span>Batch code</span><input value={form.batchCode} onChange={(event) => onChange((current) => ({ ...current, batchCode: event.target.value }))} required /></label>
    <label><span>Start date</span><input type="date" value={form.startDate} onChange={(event) => onChange((current) => ({ ...current, startDate: event.target.value }))} /></label>
    <label><span>End date</span><input type="date" value={form.endDate ?? ""} onChange={(event) => onChange((current) => ({ ...current, endDate: event.target.value }))} /></label>
    <label><span>Mode</span><select value={form.mode} onChange={(event) => onChange((current) => ({ ...current, mode: event.target.value as LearningMode }))}>{learningModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</select></label>
    <label><span>Time slot</span><input value={form.timeSlot} onChange={(event) => onChange((current) => ({ ...current, timeSlot: event.target.value }))} /></label>
    <label><span>Days</span><input value={form.days} onChange={(event) => onChange((current) => ({ ...current, days: event.target.value }))} /></label>
    <label><span>Sessions</span><input value={form.sessions} onChange={(event) => onChange((current) => ({ ...current, sessions: event.target.value }))} /></label>
    <label><span>Location</span><input value={form.location} onChange={(event) => onChange((current) => ({ ...current, location: event.target.value }))} /></label>
    <label><span>Status</span><select value={form.status} onChange={(event) => onChange((current) => ({ ...current, status: event.target.value as BatchStatus }))}>{batchStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
  </div>;
}

export default App;
