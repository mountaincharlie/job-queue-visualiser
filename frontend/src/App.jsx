import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { AppProvider } from './contexts/AppContext';
import Login from './pages/Login/Login';
import JobQueue from './pages/JobQueue/JobQueue';


function App() {

  return (
    <Router>
      {/* <AppProvider> */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/job-queue" element={<JobQueue />} />
          </Routes>
        </div>
      {/* </AppProvider> */}
    </Router>
  )
}

export default App
