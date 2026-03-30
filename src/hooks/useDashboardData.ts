import { useEffect, useState } from "react";
import { dashboardApi } from "../lib/api";
import type {
  AdminNotification,
  AdminNotificationSummary,
  DashboardSummary,
  ExpenseCategoryReport,
  MonthlyReport
} from "../types";

type DashboardDataState = {
  summary: DashboardSummary | null;
  revenue: MonthlyReport[];
  expense: MonthlyReport[];
  profit: MonthlyReport[];
  expenseCategories: ExpenseCategoryReport[];
  notifications: AdminNotification[];
  notificationSummary: AdminNotificationSummary | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: DashboardDataState = {
  summary: null,
  revenue: [],
  expense: [],
  profit: [],
  expenseCategories: [],
  notifications: [],
  notificationSummary: null,
  isLoading: true,
  error: null
};

export function useDashboardData() {
  const [state, setState] = useState<DashboardDataState>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const [
          summary,
          revenue,
          expense,
          profit,
          expenseCategories,
          notifications,
          notificationSummary
        ] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getMonthlyRevenue(),
          dashboardApi.getMonthlyExpense(),
          dashboardApi.getMonthlyProfit(),
          dashboardApi.getExpenseCategories(),
          dashboardApi.getNotifications(),
          dashboardApi.getNotificationSummary()
        ]);

        if (!cancelled) {
          setState({
            summary,
            revenue,
            expense,
            profit,
            expenseCategories,
            notifications,
            notificationSummary,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            isLoading: false,
            error: error instanceof Error ? error.message : "Unable to load dashboard data"
          }));
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
