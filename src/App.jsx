import { Routes, Route } from 'react-router-dom'
import GlobalLayout from './components/GlobalLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import GP1 from './pages/GP1'
import GP2 from './pages/GP2'
import GP3 from './pages/GP3'
import GP4 from './pages/GP4'
import GP5 from './pages/GP5'
import GP6 from './pages/GP6'
import About from './pages/About'
import Contact from './pages/Contact'
import Upload from './pages/Upload'
import UploadEvidence from './pages/UploadEvidence'
import LoginPage from './pages/LoginPage'
import Login from './pages/Login'
import Register from './pages/Register'
import MarkBook from './pages/MarkBook'
import AttendanceRegister from './pages/AttendanceRegister'
import MarkBookAnalytics from './pages/MarkBookAnalytics'
import RegisterAnalytics from './pages/RegisterAnalytics'
import Classes from './pages/Classes'
import LogBook from './pages/LogBook'
import LogBookDetail from './pages/LogBookDetail'
import Portfolio from './pages/Portfolio'
import LessonPlans from './pages/LessonPlans'
import LessonPlanUpload from './pages/LessonPlanUpload'
import LessonPlanDetail from './pages/LessonPlanDetail'

function App() {
  return (
    <Routes>
      {/* Public pages without GlobalLayout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* All other pages with GlobalLayout */}
      <Route path="/*" element={
        <GlobalLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gp1" element={<GP1 />} />
            <Route path="/gp2" element={<GP2 />} />
            <Route path="/gp3" element={<GP3 />} />
            <Route path="/gp4" element={<GP4 />} />
            <Route path="/gp5" element={<GP5 />} />
            <Route path="/gp6" element={<GP6 />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/upload-evidence" element={<ProtectedRoute><UploadEvidence /></ProtectedRoute>} />
            <Route path="/markbook" element={<ProtectedRoute><MarkBook /></ProtectedRoute>} />
            <Route path="/attendance-register" element={<ProtectedRoute><AttendanceRegister /></ProtectedRoute>} />
            <Route path="/markbook-analytics" element={<ProtectedRoute><MarkBookAnalytics /></ProtectedRoute>} />
            <Route path="/register-analytics" element={<ProtectedRoute><RegisterAnalytics /></ProtectedRoute>} />
            <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
            <Route path="/logbook" element={<ProtectedRoute><LogBook /></ProtectedRoute>} />
            <Route path="/logbook/:entryId" element={<ProtectedRoute><LogBookDetail /></ProtectedRoute>} />
            <Route path="/lesson-plans" element={<ProtectedRoute><LessonPlans /></ProtectedRoute>} />
            <Route path="/lesson-plans/upload" element={<ProtectedRoute><LessonPlanUpload /></ProtectedRoute>} />
            <Route path="/lesson-plans/:id" element={<ProtectedRoute><LessonPlanDetail /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          </Routes>
        </GlobalLayout>
      } />
    </Routes>
  )
}
console.log("API URL =", import.meta.env.VITE_API_BASE_URL);

export default App

