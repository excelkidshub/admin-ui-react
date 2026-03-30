import type { ExpenseCategoryReport } from "../types";

type ExpenseCategoryListProps = {
  categories: ExpenseCategoryReport[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value ?? 0);
}

export function ExpenseCategoryList({ categories }: ExpenseCategoryListProps) {
  if (categories.length === 0) {
    return <p className="empty-state">No category-wise expenses yet.</p>;
  }

  return (
    <div className="expense-list">
      {categories.map((category) => (
        <div className="expense-list__item" key={category.category}>
          <span>{category.category}</span>
          <strong>{formatCurrency(category.totalAmount)}</strong>
        </div>
      ))}
    </div>
  );
}
