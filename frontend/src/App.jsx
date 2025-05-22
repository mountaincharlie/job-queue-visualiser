import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Login from './pages/Login/Login';
import JobQueue from './pages/JobQueue/JobQueue';
import ProtectedRoute from './utils/ProtectedRoute';

function App() {

  return (
    <BrowserRouter>
      <AppProvider>
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/job-queue" element={
              <ProtectedRoute>
                <JobQueue />
              </ProtectedRoute>
            }/>
          </Routes>
        </div>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
