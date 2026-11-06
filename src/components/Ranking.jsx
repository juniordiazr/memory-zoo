import { formatTime } from '../utils/ranking';

export default function Ranking({ entries, result, storageError, onPlayAgain, onNewPlayer }) {
  return (
    <section className="zoo-panel ranking-panel" aria-labelledby="ranking-title">
      <h2 id="ranking-title" tabIndex={-1} ref={node => node?.focus()}>Ranking · Top 3</h2>
      <p role="status">{result.completed
        ? `¡Felicitaciones, ${result.name}! Completaste el reto en ${formatTime(result.time)} con ${result.moves} movimientos.`
        : result.timedOut
          ? '¡Se acabó el minuto! Las partidas incompletas no se incluyen en el ranking.'
          : 'Has terminado la partida. Las partidas incompletas no se incluyen en el ranking.'}</p>
      <p className="player-note">Mejor tiempo de cada persona; en caso de empate, menos movimientos. Ranking de este navegador.</p>
      {storageError && <p className="field-error" role="alert">No fue posible guardar el ranking en este navegador. El resultado se conservará mientras mantengas esta página abierta.</p>}
      {entries.length ? (
        <div className="ranking-scroll">
          <table className="ranking-table">
            <caption>Las 3 mejores posiciones</caption>
            <thead><tr><th scope="col">Posición</th><th scope="col">Nombre</th><th scope="col">Tiempo</th><th scope="col">Movimientos</th></tr></thead>
            <tbody>{entries.slice(0, 3).map((entry, index) => (
              <tr key={entry.playerId} className={result.completed && entry.playerId === result.playerId ? 'current-player' : undefined}>
                <td>{index + 1}</td><th scope="row">{entry.name}</th><td>{formatTime(entry.time)}</td><td>{entry.moves}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="ranking-empty">Aún no hay resultados. ¡Completa el tablero para inaugurar el ranking!</p>}
      <div className="game-actions ranking-actions">
        <button className="pink-btn" onClick={onPlayAgain}>Volver a jugar</button>
        <button className="outline-btn" onClick={onNewPlayer}>Otra persona</button>
      </div>
    </section>
  );
}
