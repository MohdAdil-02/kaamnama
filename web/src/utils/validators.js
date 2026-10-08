export const isPhone = (v) => /^[6-9]\d{9}$/.test(v || '');
export const isPincode = (v) => /^[1-9]\d{5}$/.test(v || '');
export const isOtp = (v, len = 6) => new RegExp(`^\\d{${len}}$`).test(v || '');
export const required = (v) => (v === undefined || v === null || String(v).trim() === '' ? 'This field is required' : '');
export const validate = (values, rules) => {
  const errors = {};
  Object.keys(rules).forEach((k) => { const e = rules[k](values[k], values); if (e) errors[k] = e; });
  return errors;
};
