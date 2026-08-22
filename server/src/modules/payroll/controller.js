const { runQuery, getOne } = require('../../database/db');

function computeSalary(salary) {
  const wage = salary.monthly_wage;
  const basic = (wage * salary.basic_salary_pct) / 100;
  const hra = (basic * salary.hra_pct) / 100;
  const standardAllowance = (basic * salary.standard_allowance_pct) / 100;
  const performanceBonus = (basic * salary.performance_bonus_pct) / 100;
  const lta = (basic * salary.lta_pct) / 100;
  const fixedAllowance = wage - (basic + hra + standardAllowance + performanceBonus + lta);
  const pfEmployee = (basic * salary.pf_employee_pct) / 100;
  const pfEmployer = (basic * salary.pf_employer_pct) / 100;

  return {
    monthly_wage: wage,
    yearly_wage: wage * 12,
    components: {
      basic_salary: Math.round(basic * 100) / 100,
      hra: Math.round(hra * 100) / 100,
      standard_allowance: Math.round(standardAllowance * 100) / 100,
      performance_bonus: Math.round(performanceBonus * 100) / 100,
      lta: Math.round(lta * 100) / 100,
      fixed_allowance: Math.round(fixedAllowance * 100) / 100
    },
    deductions: {
      pf_employee: Math.round(pfEmployee * 100) / 100,
      pf_employer: Math.round(pfEmployer * 100) / 100,
      professional_tax: salary.professional_tax
    },
    percentages: {
      basic_salary_pct: salary.basic_salary_pct,
      hra_pct: salary.hra_pct,
      standard_allowance_pct: salary.standard_allowance_pct,
      performance_bonus_pct: salary.performance_bonus_pct,
      lta_pct: salary.lta_pct,
      pf_employee_pct: salary.pf_employee_pct,
      pf_employer_pct: salary.pf_employer_pct
    },
    working_days_per_week: salary.working_days_per_week,
    break_time_hours: salary.break_time_hours
  };
}

function get(req, res) {
  const { employee_id } = req.params;

  if (req.user.role !== 'admin') {
    const emp = getOne('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
    if (!emp || emp.id !== parseInt(employee_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  const salary = getOne('SELECT * FROM salary_structures WHERE employee_id = ?', [parseInt(employee_id)]);
  if (!salary) return res.status(404).json({ error: 'Salary structure not found' });

  res.json(computeSalary(salary));
}

function update(req, res) {
  const { employee_id } = req.params;
  const fields = [
    'monthly_wage', 'basic_salary_pct', 'hra_pct', 'standard_allowance_pct',
    'performance_bonus_pct', 'lta_pct', 'pf_employee_pct', 'pf_employer_pct',
    'professional_tax', 'working_days_per_week', 'break_time_hours'
  ];

  const updates = [];
  const values = [];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(parseInt(employee_id));
  runQuery(`UPDATE salary_structures SET ${updates.join(', ')} WHERE employee_id = ?`, values);

  const salary = getOne('SELECT * FROM salary_structures WHERE employee_id = ?', [parseInt(employee_id)]);
  res.json(computeSalary(salary));
}

function compute(req, res) {
  const { employee_id } = req.params;
  const salary = getOne('SELECT * FROM salary_structures WHERE employee_id = ?', [parseInt(employee_id)]);
  if (!salary) return res.status(404).json({ error: 'Salary structure not found' });

  res.json(computeSalary(salary));
}

module.exports = { get, update, compute };
