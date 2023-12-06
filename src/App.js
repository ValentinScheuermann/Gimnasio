// App.js
import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import { useState } from 'react';

function App() {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const session = useSession(); // tokens, when session exists we have a user
  const supabase = useSupabaseClient(); // talk to supabase!
  const { isLoading } = useSessionContext();

  if (isLoading) {
    return <></>
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createCalendarEvent() {
    console.log("Creating calendar event");
    const event = {
      'summary': eventName,
      'description': eventDescription,
      'start': {
        'dateTime': start.toISOString(), // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      },
      'end': {
        'dateTime': end.toISOString(), // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      }
    }
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + session.provider_token // Access token for google
      },
      body: JSON.stringify(event)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      alert("Fecha reservada, chequear Calendario");
    });
  }

  return (
    <div className="App">
      <div className="cajon" style={{ width: "400px", margin: "30px auto" }}>
        {session ? (
          <>
            <h2>Hola Bestias del Mal</h2>
            <p>Agenda inicio de entrenamiento</p>
            <DateTimePicker onChange={setStart} value={start} />
            <p>Finalizacion</p>
            <DateTimePicker onChange={setEnd} value={end} />
            <p>Nombre</p>
            <input type="text" onChange={(e) => setEventName(e.target.value)} />
            <p>Descripcion</p>
            <input type="text" onChange={(e) => setEventDescription(e.target.value)} />
            <hr />
            <button onClick={() => createCalendarEvent()}>Reservar Fecha</button>
            <p></p>
            <button onClick={() => signOut()}>Sign Out</button>
            {/* Agrega el nuevo botón "Ir al Calendario" debajo del botón "Sign Out" */}
            <button onClick={() => window.open('https://calendar.google.com/calendar/u/0/r?pli=1', '_blank')}>
              Ir al Calendario
            </button>
          </>
        ) : (
          <>
            <div className='cajon2'>
              <p> Datos de la cuenta </p>
              Gmail: gimnasioscheuermann@gmail.com <br />
              Contraseña: GimnasioSch16
            <button className='iniciosesion' onClick={() => googleSignIn()}>Sign In With Google</button>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
