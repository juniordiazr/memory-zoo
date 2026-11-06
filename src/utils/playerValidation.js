export function validatePlayer(player) {
  const errors = {};
  const name = player.name.trim();
  if (name.length < 2 || name.length > 80 || !/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name)) {
    errors.name = 'Ingresa un nombre de 2 a 80 caracteres, usando letras, espacios, apóstrofes o guiones.';
  }
  if (player.email.trim().length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(player.email.trim())) {
    errors.email = 'Ingresa un correo válido, por ejemplo nombre@dominio.cl.';
  }
  const phone = player.phone.trim();
  if (phone && (!/^\+?[\d\s()-]+$/.test(phone) || !/^\d{8,15}$/.test(phone.replace(/\D/g, '')))) {
    errors.phone = 'Ingresa un teléfono de 8 a 15 dígitos. Puedes incluir +, espacios, guiones y paréntesis.';
  }
  return errors;
}
