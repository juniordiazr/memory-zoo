import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';
import { addResult, readRanking } from '../utils/ranking';
import { validatePlayer } from '../utils/playerValidation';

beforeEach(() => {
  const data = new Map();
  vi.stubGlobal('localStorage', {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key),
    clear: () => data.clear(),
  });
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

function register() {
  fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'María Pérez' } });
  fireEvent.change(screen.getByLabelText(/Correo/), { target: { value: 'maria@example.cl' } });
  fireEvent.click(screen.getByRole('button', { name: 'Jugar', exact: true }));
}

describe('validaciones y ranking', () => {
  it('acepta nombre y correo válidos sin teléfono, y valida los campos opcionales si se completan', () => {
    expect(validatePlayer({ name: "María O'Neill", email: 'maria@example.cl', phone: '' })).toEqual({});
    expect(validatePlayer({ name: 'A', email: 'invalido', phone: '123' })).toHaveProperty('phone');
    expect(validatePlayer({ name: '123', email: 'invalido', phone: '' })).toHaveProperty('name');
    expect(validatePlayer({ name: 'María', email: 'a@b', phone: '' })).toHaveProperty('email');
    expect(validatePlayer({ name: 'María', email: 'a@b.cl', phone: '+56 9 1234 5678' })).toEqual({});
  });

  it('conserva diez personas, ordena por tiempo y movimientos y mejora una posición sin duplicar personas', () => {
    let ranking = [];
    for (let i = 0; i < 12; i++) ranking = addResult(ranking, { playerId: String(i), name: String(i), time: 100 - i, moves: 20 });
    expect(ranking).toHaveLength(10);
    expect(ranking[0].time).toBe(89);
    ranking = addResult(ranking, { playerId: '11', name: 'Once', time: 80, moves: 15 });
    ranking = addResult(ranking, { playerId: '10', name: 'Diez', time: 80, moves: 12 });
    expect(ranking[0].name).toBe('Diez');
    expect(ranking.filter(entry => entry.playerId === '11')).toHaveLength(1);
    expect(addResult(ranking, { playerId: '11', name: 'Once', time: 120, moves: 10 })).toEqual(ranking);
    localStorage.setItem('memory-zoo-ranking', 'broken');
    expect(readRanking()).toEqual([]);
  });
});

describe('flujo del juego', () => {
  it('bloquea Jugar hasta validar los datos y permite abandonar sin registrar una victoria', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Jugar', exact: true })).toBeDisabled();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'María' } });
    fireEvent.change(screen.getByLabelText(/Correo/), { target: { value: 'maria@example.cl' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: 'abc' } });
    fireEvent.blur(screen.getByLabelText(/Teléfono/));
    expect(screen.getByRole('alert')).toHaveTextContent('8 a 15');
    expect(screen.getByRole('button', { name: 'Jugar', exact: true })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Jugar', exact: true }));
    expect(within(screen.getByRole('grid')).getAllByRole('button')).toHaveLength(16);
    fireEvent.click(screen.getByRole('button', { name: 'Game Over' }));
    expect(screen.getByRole('heading', { name: 'Ranking · Top 3' })).toBeInTheDocument();
    expect(readRanking()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Otra persona' }));
    expect(screen.getByLabelText(/Nombre/)).toHaveValue('');
  });

  it('termina exactamente al minuto desde la primera carta y reinicia el límite en otra partida', () => {
    vi.useFakeTimers();
    render(<App />);
    register();
    act(() => vi.advanceTimersByTime(61000));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('grid')).getAllByRole('button')[0]);
    act(() => vi.advanceTimersByTime(59000));
    expect(screen.getByLabelText('Time: 0:59')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restart game' }));
    fireEvent.click(within(screen.getByRole('grid')).getAllByRole('button')[0]);
    act(() => vi.advanceTimersByTime(59000));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Se acabó el minuto');
    expect(readRanking()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a jugar' }));
    expect(screen.getByLabelText('Time: 0:00')).toBeInTheDocument();
  });

  it('mantiene el cronómetro activo, reinicia y registra una victoria una sola vez con persistencia', () => {
    vi.useFakeTimers();
    const view = render(<App />);
    register();
    fireEvent.click(within(screen.getByRole('grid')).getAllByRole('button')[0]);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByLabelText('Time: 0:03')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restart game' }));
    expect(screen.getByLabelText('Time: 0:00')).toBeInTheDocument();
    const pairs = new Map();
    within(screen.getByRole('grid')).getAllByRole('button').forEach(button => {
      const name = button.querySelector('img').alt;
      pairs.set(name, [...(pairs.get(name) || []), button]);
    });
    [...pairs.values()].forEach(([first, second]) => {
      fireEvent.click(first);
      act(() => vi.advanceTimersByTime(1000));
      fireEvent.click(second);
    });
    expect(screen.getByRole('heading', { name: 'Ranking · Top 3' })).toBeInTheDocument();
    expect(readRanking()).toHaveLength(1);
    expect(readRanking()[0]).toMatchObject({ name: 'María Pérez', time: 8, moves: 8 });
    expect(screen.queryByText('maria@example.cl')).not.toBeInTheDocument();
    view.unmount();
    render(<App />);
    register();
    fireEvent.click(screen.getByRole('button', { name: 'Game Over' }));
    expect(screen.getByRole('rowheader', { name: 'María Pérez' })).toBeInTheDocument();
    expect(readRanking()).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a jugar' }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
