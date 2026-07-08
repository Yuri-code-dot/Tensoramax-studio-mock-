import { useEffect, useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { apiGet } from '../lib/api';
import type { Employee, PayrollRun } from '../lib/types';
import { inr, num } from '../lib/format';
import { Card, CardHeader, Loading, ErrorState, EmptyState, StatusBadge } from '../components/ui';

export default function Payroll() {
  const { company } = useCompany();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    apiGet<{ employees: Employee[]; runs: PayrollRun[] }>(`/payroll?company_id=${company.id}`)
      .then((d) => { setEmployees(d.employees); setRuns(d.runs); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [company]);

  if (loading) return <Loading label="Loading payroll…" />;
  if (error) return <ErrorState message={error} />;

  const monthlyCost = employees.filter((e) => e.status === 'Active').reduce((s, e) => s + num(e.net_salary), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Employees</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{employees.length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Active</p><p className="mt-1.5 font-display text-xl font-semibold text-success">{employees.filter((e) => e.status === 'Active').length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Monthly Net Cost</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{inr(monthlyCost)}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Payroll Runs</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{runs.length}</p></Card>
      </div>

      <Card>
        <CardHeader title="Employees" subtitle="Salary structure per month" />
        {employees.length === 0 ? (
          <EmptyState message="No employees on record." />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Designation</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3 text-right">Basic</th>
                  <th className="px-5 py-3 text-right">HRA</th>
                  <th className="px-5 py-3 text-right">Allowances</th>
                  <th className="px-5 py-3 text-right">Deductions</th>
                  <th className="px-5 py-3 text-right">Net Pay</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3 font-medium text-ink">{e.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{e.designation}</td>
                    <td className="px-5 py-3 text-ink-soft">{e.department}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{inr(e.basic)}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{inr(e.hra)}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{inr(e.allowances)}</td>
                    <td className="px-5 py-3 text-right text-danger">−{inr(e.deductions)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">{inr(e.net_salary)}</td>
                    <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Payroll Runs" subtitle="Monthly processing history" />
        {runs.length === 0 ? (
          <EmptyState message="No payroll runs yet." />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3 text-right">Employees</th>
                  <th className="px-5 py-3 text-right">Gross</th>
                  <th className="px-5 py-3 text-right">Deductions</th>
                  <th className="px-5 py-3 text-right">Net Paid</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                    <td className="px-5 py-3 font-medium text-ink">{r.month}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{r.employees_count}</td>
                    <td className="px-5 py-3 text-right text-ink-soft">{inr(r.gross_total)}</td>
                    <td className="px-5 py-3 text-right text-danger">−{inr(r.deductions_total)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">{inr(r.net_total)}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
