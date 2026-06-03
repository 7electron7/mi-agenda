import { useState, useEffect } from 'react'

import './App.css'
import { supabase } from './supabase'

function App() {
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [events, setEvents] = useState([])
  const [editingEventId, setEditingEventId] = useState(null)

  const cargarEventos = async () => {

  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  const eventosFormateados = data.map((item) => {
    const fechaCreacion = new Date(item.fecha_creacion)
    const fechaEvento = item.fecha_evento || fechaCreacion.toISOString().slice(0, 10)
    const horaEvento = item.hora_evento
      ? item.hora_evento.slice(0, 5)
      : fechaCreacion.toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
        })

    return {
      id: item.id,
      title: item.titulo,
      date: fechaEvento,
      time: horaEvento,
      day: new Date(`${fechaEvento}T00:00:00`).toLocaleDateString('es-CL'),
      hour: horaEvento,
      completed: item.estado === 'realizado',
    }
  })

  setEvents(eventosFormateados)
}

useEffect(() => {
  cargarEventos()
}, [])




const eliminarEvento = async (id) => {

  const confirmar = window.confirm(
    '¿Está seguro de eliminar este evento?'
  )

  if (!confirmar) {
    return
  }

  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)
    alert('Error al eliminar el evento')
    return
  }

  await cargarEventos()
}





  const handleSave = async (event) => {

    event.preventDefault()

    const eventTitle = title.trim()

    if (!eventTitle || !eventDate || !eventTime) {
      return
    }

    if (editingEventId) {
      const { error } = await supabase
        .from('eventos')
        .update({
          titulo: eventTitle,
          fecha_evento: eventDate,
          hora_evento: eventTime,
        })
        .eq('id', editingEventId)

      if (error) {
        console.error(error)
        alert('Error al editar el evento')
        return
      }

      setTitle('')
      setEventDate('')
      setEventTime('')
      setEditingEventId(null)
      await cargarEventos()
      return
    }

    const { error } = await supabase
  .from('eventos')
  .insert([
    {
      titulo: eventTitle,
      fecha_evento: eventDate,
      hora_evento: eventTime,
      estado: 'pendiente',
    },
  ])

if (error) {
  console.error(error)
  return
}
    

    const scheduledAt = new Date()

    setEvents((currentEvents) => [
      {
        id: scheduledAt.getTime(),
        title: eventTitle,
        date: eventDate,
        time: eventTime,
        day: new Date(`${eventDate}T00:00:00`).toLocaleDateString('es-CL'),
        hour: eventTime,
        completed: false,
      },
      ...currentEvents,
    ])
    setTitle('')
    setEventDate('')
    setEventTime('')
    await cargarEventos()
  }

  const editarEvento = (event) => {
    setTitle(event.title)
    setEventDate(event.date)
    setEventTime(event.time)
    setEditingEventId(event.id)
  }

  const cancelarEdicion = () => {
    setTitle('')
    setEventDate('')
    setEventTime('')
    setEditingEventId(null)
  }

  const toggleCompleted = async (eventToUpdate) => {
    const nextCompleted = !eventToUpdate.completed
    const nextStatus = nextCompleted ? 'realizado' : 'pendiente'

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === eventToUpdate.id
          ? { ...event, completed: nextCompleted }
          : event,
      ),
    )

    const { error } = await supabase
      .from('eventos')
      .update({ estado: nextStatus })
      .eq('id', eventToUpdate.id)

    if (error) {
      console.error(error)
      alert('Error al actualizar el estado del evento')
      await cargarEventos()
    }
  }

  return (
    <main className="agenda">
      <section className="agenda-panel">
        <header className="agenda-header">
          <h2>MI AGENDA ELECRONICA_ 2026</h2>
          <p>Registra eventos y marca si fueron realizados.</p>
        </header>

        <form className="agenda-form" onSubmit={handleSave}>
          <div className="form-row">
            <label className="form-field" htmlFor="event-title">
              Titulo
              <input
                id="event-title"
                type="text"
                value={title}
                placeholder="Escribe el titulo del evento"
                required
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="form-field" htmlFor="event-date">
              Fecha
              <input
                id="event-date"
                type="date"
                value={eventDate}
                required
                onChange={(event) => setEventDate(event.target.value)}
              />
            </label>
            <label className="form-field" htmlFor="event-time">
              Hora
              <input
                id="event-time"
                type="time"
                value={eventTime}
                required
                onChange={(event) => setEventTime(event.target.value)}
              />
            </label>
            <button type="submit">Guardar</button>
            {editingEventId && (
              <button type="button" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
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
                      onChange={() => toggleCompleted(event)}
                    />
                    <span>{event.completed ? 'Realizado' : 'Pendiente'}</span>
                  </label>
                  <div className="event-info">
                    <strong>{event.title}</strong>
                    <span>
                      Dia: {event.day} | Hora: {event.hour}
                    </span>
                  </div>
                  <div className="event-actions">
                    <button
                      type="button"
                      onClick={() => editarEvento(event)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarEvento(event.id)}
                    >
                       Eliminar
                    </button>
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
