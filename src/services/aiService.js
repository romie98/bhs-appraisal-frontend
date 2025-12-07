// AI Service for OpenAI integration
import { apiUrl, apiFetch } from '../config/api'

// Helper function for API calls with automatic token injection
async function apiCall(endpoint, options = {}) {
  const response = await apiFetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// AI API
export const aiApi = {
  /**
   * Test the AI service with a simple prompt
   * @param {string} prompt - Optional custom prompt (defaults to "Hello AI")
   * @returns {Promise<{response: string, success: boolean}>}
   */
  test: async (prompt = null) => {
    return apiCall('/ai/test', {
      method: 'POST',
      body: JSON.stringify({ prompt: prompt || null }),
    })
  },

  /**
   * Extract evidence from a lesson plan using AI analysis
   * @param {string} lessonText - The full lesson plan text
   * @param {string} lessonId - Optional lesson ID (will be generated if not provided)
   * @returns {Promise<{
   *   lesson_id: string,
   *   gp1: string[],
   *   gp2: string[],
   *   gp3: string[],
   *   gp4: string[],
   *   gp5: string[],
   *   gp6: string[],
   *   strengths: string[],
   *   weaknesses: string[]
   * }>}
   */
  extractLessonEvidence: async (lessonText, lessonId = null) => {
    return apiCall('/ai/extract-lesson-evidence', {
      method: 'POST',
      body: JSON.stringify({
        lesson_text: lessonText,
        lesson_id: lessonId,
      }),
    })
  },

  /**
   * Get stored evidence for a specific lesson
   * @param {string} lessonId - The lesson ID
   * @returns {Promise<{
   *   lesson_id: string,
   *   gp1: string[],
   *   gp2: string[],
   *   gp3: string[],
   *   gp4: string[],
   *   gp5: string[],
   *   gp6: string[],
   *   strengths: string[],
   *   weaknesses: string[]
   * }>}
   */
  getLessonEvidence: async (lessonId) => {
    return apiCall(`/ai/lesson-evidence/${lessonId}`)
  },

  /**
   * Extract evidence from a log book entry using AI analysis
   * @param {string} entryText - The log book entry text
   * @param {string} logEntryId - Optional log entry ID (will be generated if not provided)
   * @returns {Promise<{
   *   log_entry_id: string,
   *   mappedGP: Array<{gp: number, evidence: string}>,
   *   summary: string
   * }>}
   */
  extractLogEvidence: async (entryText, logEntryId = null) => {
    return apiCall('/ai/extract-log-evidence', {
      method: 'POST',
      body: JSON.stringify({
        entry_text: entryText,
        log_entry_id: logEntryId,
      }),
    })
  },

  /**
   * Get stored evidence for a specific log entry
   * @param {string} logEntryId - The log entry ID
   * @returns {Promise<{
   *   log_entry_id: string,
   *   mappedGP: Array<{gp: number, evidence: string}>,
   *   summary: string
   * }>}
   */
  getLogEvidence: async (logEntryId) => {
    return apiCall(`/ai/log-evidence/${logEntryId}`)
  },

  /**
   * Extract evidence from register/attendance data using AI analysis
   * @param {Object} registerData - Register data object
   * @param {number} registerData.attendance_percentage - Overall attendance percentage
   * @param {number} registerData.punctuality_percentage - Overall punctuality percentage
   * @param {string[]} registerData.notes - List of absence notes
   * @param {string[]} registerData.follow_ups - List of follow-up actions
   * @param {string} registerData.date_range - Optional date range string
   * @param {string} registerData.register_period_id - Optional period ID
   * @returns {Promise<{
   *   register_period_id: string,
   *   gp3: string[],
   *   gp6: string[],
   *   patternsDetected: string[],
   *   recommendedInterventions: string[]
   * }>}
   */
  extractRegisterEvidence: async (registerData) => {
    return apiCall('/ai/extract-register-evidence', {
      method: 'POST',
      body: JSON.stringify(registerData),
    })
  },

  /**
   * Get stored evidence for a specific register period
   * @param {string} registerPeriodId - The register period ID
   * @returns {Promise<{
   *   register_period_id: string,
   *   gp3: string[],
   *   gp6: string[],
   *   patternsDetected: string[],
   *   recommendedInterventions: string[]
   * }>}
   */
  getRegisterEvidence: async (registerPeriodId) => {
    return apiCall(`/ai/register-evidence/${registerPeriodId}`)
  },

  /**
   * Extract evidence from assessment data using AI analysis
   * @param {Object} assessmentData - Assessment data object
   * @param {string} assessmentData.description - Assessment description
   * @param {Object} assessmentData.grade_distribution - Grade distribution (e.g., {A: 5, B: 10, C: 8})
   * @param {string[]} assessmentData.diagnostic_results - Optional diagnostic results
   * @param {string} assessmentData.assessment_id - Optional assessment ID
   * @returns {Promise<{
   *   assessment_id: string,
   *   gp2: string[],
   *   gp3: string[],
   *   performanceBreakdown: Object,
   *   recommendedActions: Array<{action: string, targetGroup: string, priority: string}>
   * }>}
   */
  extractAssessmentEvidence: async (assessmentData) => {
    return apiCall('/ai/extract-assessment-evidence', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    })
  },

  /**
   * Get stored evidence for a specific assessment
   * @param {string} assessmentId - The assessment ID
   * @returns {Promise<{
   *   assessment_id: string,
   *   gp2: string[],
   *   gp3: string[],
   *   performanceBreakdown: Object,
   *   recommendedActions: Array
   * }>}
   */
  getAssessmentEvidence: async (assessmentId) => {
    return apiCall(`/ai/assessment-evidence/${assessmentId}`)
  },

  /**
   * Build a comprehensive portfolio from all evidence sources
   * @param {Object} allEvidence - All evidence from different sources
   * @param {Array} allEvidence.lesson_evidence - Lesson evidence items
   * @param {Array} allEvidence.log_evidence - Log evidence items
   * @param {Array} allEvidence.assessment_evidence - Assessment evidence items
   * @param {Array} allEvidence.register_evidence - Register evidence items
   * @param {Array} allEvidence.external_uploads - External upload evidence items
   * @returns {Promise<{
   *   gp1: {evidence: string[], summary: string},
   *   gp2: {evidence: string[], summary: string},
   *   gp3: {evidence: string[], summary: string},
   *   gp4: {evidence: string[], summary: string},
   *   gp5: {evidence: string[], summary: string},
   *   gp6: {evidence: string[], summary: string},
   *   overall_summary: string
   * }>}
   */
  buildPortfolio: async (allEvidence) => {
    return apiCall('/ai/build-portfolio', {
      method: 'POST',
      body: JSON.stringify(allEvidence),
    })
  },

  /**
   * Get the most recently built portfolio
   * @returns {Promise<PortfolioResponse>}
   */
  getLatestPortfolio: async () => {
    return apiCall('/ai/portfolio/latest')
  },

  /**
   * Generate a comprehensive appraisal report
   * @param {Object} appraisalData - Appraisal data object
   * @param {Object} appraisalData.gp_evidence - GP evidence by GP number
   * @param {Object} appraisalData.attendance_patterns - Attendance data
   * @param {Array} appraisalData.professional_development - PD activities
   * @param {Object} appraisalData.lesson_plan_quality - Lesson plan metrics
   * @param {Object} appraisalData.class_performance_trends - Performance data
   * @returns {Promise<{
   *   report_id: string,
   *   scores: Object,
   *   category: string,
   *   strengths: string[],
   *   weaknesses: string[],
   *   recommendations: string[],
   *   actionPlan: Array<{priority: string, action: string, timeline: string}>,
   *   html_report: string
   * }>}
   */
  generateAppraisalReport: async (appraisalData) => {
    return apiCall('/ai/generate-appraisal-report', {
      method: 'POST',
      body: JSON.stringify(appraisalData),
    })
  },

  /**
   * Get a stored appraisal report
   * @param {string} reportId - The report ID
   * @returns {Promise<AppraisalReportResponse>}
   */
  getAppraisalReport: async (reportId) => {
    return apiCall(`/ai/appraisal-report/${reportId}`)
  },

  /**
   * Get appraisal report HTML URL
   * @param {string} reportId - The report ID
   * @returns {string} URL to HTML report
   */
  getAppraisalReportHtmlUrl: (reportId) => {
    return apiUrl(`/ai/appraisal-report/${reportId}/html`)
  },

  /**
   * Get appraisal report PDF URL
   * @param {string} reportId - The report ID
   * @returns {string} URL to PDF report
   */
  getAppraisalReportPdfUrl: (reportId) => {
    return apiUrl(`/ai/appraisal-report/${reportId}/pdf`)
  },
}

