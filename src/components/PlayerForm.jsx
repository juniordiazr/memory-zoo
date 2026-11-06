import { useState } from 'react';
import { validatePlayer } from '../utils/playerValidation';

export default function PlayerForm({ onPlay }) {
  const [player, setPlayer] = useState({ name: '', phone: '', email: '' });
  const [touched, setTouched] = useState({});
  const errors = validatePlayer(player);
  const fields = [
    { key: 'name', label: 'Nombre', type: 'text', autoComplete: 'name', placeholder: 'Tu nombre', maxLength: 80 },
    { key: 'phone', label: 'Teléfono (opcional)', type: 'tel', autoComplete: 'tel', placeholder: '+56 9 1234 5678', maxLength: 30 },
    { key: 'email', label: 'Correo', type: 'email', autoComplete: 'email', placeholder: 'nombre@dominio.cl', maxLength: 254 },
  ];
  const submit = event => {
    event.preventDefault();
    if (Object.keys(errors).length) { setTouched({ name: true, email: true, phone: true }); return; }
    onPlay({ name: player.name.trim(), email: player.email.trim().toLowerCase(), phone: player.phone.trim() });
  };
  return (
    <section className="zoo-panel" aria-labelledby="welcome-title">
      <h2 id="welcome-title">¡Vamos a jugar!</h2>
      <p>Completa tus datos para comenzar. Nombre y correo son obligatorios.</p>
      <form onSubmit={submit} noValidate>
        {fields.map(({ key, label, ...attributes }) => (
          <div className="player-field" key={key}>
            <label htmlFor={`player-${key}`}>{label}{key !== 'phone' && <span aria-hidden="true"> *</span>}</label>
            <input {...attributes} id={`player-${key}`} name={key} value={player[key]} required={key !== 'phone'}
              onChange={event => setPlayer(current => ({ ...current, [key]: event.target.value }))}
              onBlur={() => setTouched(current => ({ ...current, [key]: true }))}
              aria-invalid={Boolean(touched[key] && errors[key])}
              aria-describedby={touched[key] && errors[key] ? `${key}-error` : undefined} />
            {touched[key] && errors[key] && <p className="field-error" id={`${key}-error`} role="alert">{errors[key]}</p>}
          </div>
        ))}
        <p className="player-note">Tu correo y teléfono no aparecerán en el ranking. Los datos no se envían a un servidor.</p>
        <button className="pink-btn play-btn" type="submit" disabled={Object.keys(errors).length > 0}>Jugar</button>
      </form>
    </section>
  );
}
