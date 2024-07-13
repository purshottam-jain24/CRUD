import { Routes, Route } from 'react-router-dom';
import Homepage from './comps/home';
import CreateRec from './comps/create';
import ViewRecords from './comps/view';
import Edit from './comps/Edit';
import './App.css';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/create" element={<CreateRec />} />
        <Route path="/view" element={<ViewRecords />} />
        <Route path="/view/:id/Edit" element={<Edit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
