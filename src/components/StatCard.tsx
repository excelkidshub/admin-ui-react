type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  tone?: "neutral" | "good" | "warn";
};

export function StatCard({ label, value, helper, tone = "neutral" }: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <p className="stat-card__label">{label}</p>
      <h3 className="stat-card__value">{value}</h3>
      <p className="stat-card__helper">{helper}</p>
    </article>
  );
}
