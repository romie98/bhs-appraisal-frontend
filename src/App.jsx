import { Routes, Route } from 'react-router-dom'
import GlobalLayout from './components/GlobalLayout'
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
import MarkBook from './pages/MarkBook'
import Register from './pages/Register'
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
      {/* Login page without GlobalLayout */}
      <Route path="/login" element={<LoginPage />} />
      
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
            <Route path="/upload" element={<Upload />} />
            <Route path="/upload-evidence" element={<UploadEvidence />} />
            <Route path="/markbook" element={<MarkBook />} />
            <Route path="/register" element={<Register />} />
            <Route path="/markbook-analytics" element={<MarkBookAnalytics />} />
            <Route path="/register-analytics" element={<RegisterAnalytics />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/logbook" element={<LogBook />} />
            <Route path="/logbook/:entryId" element={<LogBookDetail />} />
            <Route path="/lesson-plans" element={<LessonPlans />} />
            <Route path="/lesson-plans/upload" element={<LessonPlanUpload />} />
            <Route path="/lesson-plans/:id" element={<LessonPlanDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </GlobalLayout>
      } />
    </Routes>
  )
}
console.log("API URL =", import.meta.env.VITE_API_BASE_URL);

export default App

