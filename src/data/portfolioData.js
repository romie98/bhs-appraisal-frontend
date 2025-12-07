// GP Categories
export const GP_CATEGORIES = ['GP1', 'GP2', 'GP3', 'GP4', 'GP5', 'GP6']

// Portfolio Evidence Items
export const portfolioItems = [
  {
    id: '1',
    title: 'Introduction to Algebra Lesson Plan',
    description: 'A comprehensive lesson plan introducing basic algebraic concepts to 7th grade students.',
    category: 'GP1',
    type: 'lesson plan',
    fileUrl: '/assets/lessons/algebra-intro.pdf',
    date: '2024-01-15',
    tags: ['algebra', '7th grade', 'mathematics', 'beginner']
  },
  {
    id: '2',
    title: 'Teaching Certification',
    description: 'State teaching certification in Mathematics for grades 6-12.',
    category: 'GP1',
    type: 'certificate',
    fileUrl: '/assets/certificates/teaching-cert.pdf',
    date: '2023-08-20',
    tags: ['certification', 'credentials', 'mathematics']
  },
  {
    id: '3',
    title: 'Student Engagement Reflection',
    description: 'Reflection on strategies used to increase student participation in classroom discussions.',
    category: 'GP2',
    type: 'reflection',
    fileUrl: '/assets/reflections/student-engagement.md',
    date: '2024-02-10',
    tags: ['engagement', 'classroom management', 'pedagogy']
  },
  {
    id: '4',
    title: 'Student Project: Geometry Art',
    description: 'Examples of student work demonstrating understanding of geometric principles through art.',
    category: 'GP2',
    type: 'student work',
    fileUrl: '/assets/student-work/geometry-art/',
    date: '2024-03-05',
    tags: ['geometry', 'art', 'project-based learning', 'creativity']
  },
  {
    id: '5',
    title: 'Quarterly Assessment Report',
    description: 'Comprehensive report analyzing student performance and identifying areas for improvement.',
    category: 'GP3',
    type: 'report',
    fileUrl: '/assets/reports/q1-assessment-2024.pdf',
    date: '2024-04-01',
    tags: ['assessment', 'data analysis', 'student progress']
  },
  {
    id: '6',
    title: 'Differentiated Instruction Lesson',
    description: 'Lesson plan incorporating multiple learning styles and ability levels.',
    category: 'GP3',
    type: 'lesson plan',
    fileUrl: '/assets/lessons/differentiated-instruction.pdf',
    date: '2024-02-20',
    tags: ['differentiation', 'inclusive education', 'adaptation']
  },
  {
    id: '7',
    title: 'Professional Development Certificate',
    description: 'Certificate of completion for advanced mathematics teaching strategies workshop.',
    category: 'GP4',
    type: 'certificate',
    fileUrl: '/assets/certificates/pd-advanced-math.pdf',
    date: '2024-01-30',
    tags: ['professional development', 'continuing education', 'mathematics']
  },
  {
    id: '8',
    title: 'Collaborative Planning Reflection',
    description: 'Reflection on working with colleagues to develop cross-curricular projects.',
    category: 'GP4',
    type: 'reflection',
    fileUrl: '/assets/reflections/collaborative-planning.md',
    date: '2024-03-15',
    tags: ['collaboration', 'teamwork', 'cross-curricular']
  },
  {
    id: '9',
    title: 'Parent Communication Log',
    description: 'Documentation of regular communication with parents regarding student progress.',
    category: 'GP5',
    type: 'report',
    fileUrl: '/assets/reports/parent-communication-log.pdf',
    date: '2024-04-10',
    tags: ['parent communication', 'partnership', 'outreach']
  },
  {
    id: '10',
    title: 'Community Math Night Event',
    description: 'Organized and led a community event to promote mathematics education.',
    category: 'GP5',
    type: 'report',
    fileUrl: '/assets/reports/community-math-night.pdf',
    date: '2024-03-25',
    tags: ['community engagement', 'event planning', 'outreach']
  },
  {
    id: '11',
    title: 'Technology Integration Reflection',
    description: 'Reflection on incorporating digital tools and resources into mathematics instruction.',
    category: 'GP6',
    type: 'reflection',
    fileUrl: '/assets/reflections/technology-integration.md',
    date: '2024-02-28',
    tags: ['technology', 'digital tools', 'innovation']
  },
  {
    id: '12',
    title: 'Online Learning Platform Certificate',
    description: 'Certification in using educational technology platforms for remote and hybrid learning.',
    category: 'GP6',
    type: 'certificate',
    fileUrl: '/assets/certificates/edtech-cert.pdf',
    date: '2024-01-10',
    tags: ['technology', 'online learning', 'certification']
  }
]

/**
 * Filter portfolio items by GP category
 * @param {string} gpCategory - The GP category to filter by (e.g., 'GP1', 'GP2', etc.)
 * @returns {Array} - Filtered array of portfolio items
 */
export function filterItemsByGP(gpCategory) {
  if (!GP_CATEGORIES.includes(gpCategory)) {
    console.warn(`Invalid GP category: ${gpCategory}. Valid categories are: ${GP_CATEGORIES.join(', ')}`)
    return []
  }
  return portfolioItems.filter(item => item.category === gpCategory)
}

/**
 * Get all unique types from portfolio items
 * @returns {Array} - Array of unique item types
 */
export function getAllTypes() {
  return [...new Set(portfolioItems.map(item => item.type))]
}

/**
 * Get portfolio item by ID
 * @param {string} id - The ID of the portfolio item
 * @returns {Object|null} - The portfolio item or null if not found
 */
export function getItemById(id) {
  return portfolioItems.find(item => item.id === id) || null
}


