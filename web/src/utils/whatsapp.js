export const whatsappLink = (phone, text = '') => {
  const digits = String(phone || '').replace(/\D/g, '');
  const num = digits.length === 10 ? `91${digits}` : digits.length > 10 ? digits : '';
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};
