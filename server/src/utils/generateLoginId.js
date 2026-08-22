const { getOne } = require('../database/db');

function generateLoginId(firstName, lastName, companyName, dateOfJoining) {
  const companyPrefix = (companyName || 'OI').substring(0, 2).toUpperCase();
  const nameCode = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
  const year = new Date(dateOfJoining || Date.now()).getFullYear().toString();

  const pattern = `${companyPrefix}${nameCode}${year}%`;
  const result = getOne('SELECT COUNT(*) as count FROM users WHERE login_id LIKE ?', [pattern]);

  const serial = String((result?.count || 0) + 1).padStart(4, '0');
  return `${companyPrefix}${nameCode}${year}${serial}`;
}

module.exports = { generateLoginId };
