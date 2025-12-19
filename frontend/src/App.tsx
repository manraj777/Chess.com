import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';

function App() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-10 pb-16'>
      <BrowserRouter>
        <Routes>
          <Route path="/"  element = {<Landing />}/> 
          <Route path="/game"  element = {<Game />}/> 
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
