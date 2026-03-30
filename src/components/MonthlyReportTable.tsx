import type { MonthlyReport } from "../types";

type MonthlyReportTableProps = {
  reports: MonthlyReport[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value ?? 0);
}

export function MonthlyReportTable({ reports }: MonthlyReportTableProps) {
  if (reports.length === 0) {
    return <p className="empty-state">No monthly data available yet.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Month</th>
          <th>Revenue</th>
          <th>Expense</th>
          <th>Profit</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.month}>
            <td>{report.month}</td>
            <td>{formatCurrency(report.revenue)}</td>
            <td>{formatCurrency(report.expense)}</td>
            <td>{formatCurrency(report.profit)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
