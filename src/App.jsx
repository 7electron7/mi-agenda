import { useState } from 'react'
import './App.css'

function App() {
  const [title, setTitle] = useState('')
  const [events, setEvents] = useState([])

  const handleSave = (event) => {
    event.preventDefault()

    const eventTitle = title.trim()

    if (!eventTitle) {
      return
    }

    const scheduledAt = new Date()

    setEvents((currentEvents) => [
      {
        id: scheduledAt.getTime(),
        title: eventTitle,
        day: scheduledAt.toLocaleDateString('es-CL'),
        hour: scheduledAt.toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        completed: false,
      },
      ...currentEvents,
    ])
    setTitle('')
  }

  const toggleCompleted = (eventId) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === eventId
          ? { ...event, completed: !event.completed }
          : event,
      ),
    )
  }

  return (
    <main className="agenda">
      <section className="agenda-panel">
        <header className="agenda-header">
          <h1>MI AGENDA ELECRONICA</h1>
          <p>Registra eventos y marca si fueron realizados.</p>
        </header>

        <form className="agenda-form" onSubmit={handleSave}>
          <label htmlFor="event-title">Titulo</label>
          <div className="form-row">
            <input
              id="event-title"
              type="text"
              value={title}
              placeholder="Escribe el titulo del evento"
              onChange={(event) => setTitle(event.target.value)}
            />
            <button type="submit">Guardar</button>
          </div>
        </form>

        <section className="events-list" aria-labelledby="events-title">
          <h2 id="events-title">Lista de eventos</h2>

          {events.length === 0 ? (
            <p className="empty-state">No hay eventos guardados.</p>
          ) : (
            <ul>
              {events.map((event) => (
                <li key={event.id} className={event.completed ? 'done' : ''}>
                  <label className="event-check">
                    <input
                      type="checkbox"
                      checked={event.completed}
                      onChange={() => toggleCompleted(event.id)}
                    />
                    <span>{event.completed ? 'Realizado' : 'Pendiente'}</span>
                  </label>
                  <div className="event-info">
                    <strong>{event.title}</strong>
                    <span>
                      Dia: {event.day} | Hora: {event.hour}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
