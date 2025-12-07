// Evidence Schema for Teacher Professional Portfolio
// Based on Ministry Appraisal standards and e-portfolio guidelines

export const evidenceSchema = [
  // GP1 - Teacher Knows the Subject Content
  {
    id: 'gp1.1',
    gp: 'GP 1',
    subsection: '1.1',
    title: 'Knows Subject Content',
    description: 'Demonstrates comprehensive knowledge of subject content.',
    recommendedEvidence: [
      'Academic certificates',
      'Lesson plans showing subject mastery',
      'Course outline',
      'Action plans for teaching',
      'Mentor/peer reports',
      'Student assessment samples'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of subject content knowledge',
    allowMultipleFiles: true
  },
  {
    id: 'gp1.2',
    gp: 'GP 1',
    subsection: '1.2',
    title: 'Relates Concepts to Other Subjects',
    description: 'Shows ability to connect subject concepts across different disciplines.',
    recommendedEvidence: [
      'STEAM/STEM lesson plans',
      'Lesson plans showing cross-curricular links',
      'Integrated thematic units'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of cross-curricular connections',
    allowMultipleFiles: true
  },
  {
    id: 'gp1.3',
    gp: 'GP 1',
    subsection: '1.3',
    title: 'Understands Subject Structure in Curriculum',
    description: 'Demonstrates understanding of how subject content is structured in the curriculum.',
    recommendedEvidence: [
      'Lesson plans showing "basic to complex" progression',
      'Amended curriculum guide',
      'Scheme of work / unit plan'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of curriculum structure understanding',
    allowMultipleFiles: true
  },
  {
    id: 'gp1.4',
    gp: 'GP 1',
    subsection: '1.4',
    title: 'Relates Subject to National Development Goals',
    description: 'Connects subject content to national development goals and standards.',
    recommendedEvidence: [
      'Lesson plans referencing national goals',
      'Projects linking ICT to society / economy',
      'Notes linking subject to Vision 2030 or national standards'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence linking subject to national goals',
    allowMultipleFiles: true
  },

  // GP2 - Teacher Knows How to Teach
  {
    id: 'gp2.1',
    gp: 'GP 2',
    subsection: '2.1',
    title: 'Critical Thinking & Creativity',
    description: 'Promotes critical thinking and creativity in teaching and learning.',
    recommendedEvidence: [
      'Lesson plan showing differentiation',
      'Assessment pieces (projects, models, quizzes)',
      'Amended curriculum guide',
      'Case studies',
      'Action research'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of critical thinking and creativity',
    allowMultipleFiles: true
  },
  {
    id: 'gp2.2',
    gp: 'GP 2',
    subsection: '2.2',
    title: 'Interactive, Collaborative Teaching',
    description: 'Uses interactive and collaborative teaching strategies to engage students.',
    recommendedEvidence: [
      'Group work samples',
      'SBA/IA samples',
      'ICT lesson plan',
      'Photos/video of group activities',
      'Project-based learning samples',
      'Curriculum pacing guide'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of interactive and collaborative teaching',
    allowMultipleFiles: true
  },
  {
    id: 'gp2.3',
    gp: 'GP 2',
    subsection: '2.3',
    title: 'Reflective Practice & Action Research',
    description: 'Engages in reflective practice and action research to improve teaching.',
    recommendedEvidence: [
      'Action research paper',
      'Case studies',
      'Mark book',
      'Log book entries',
      'Student questionnaires',
      'Lesson plan evaluations'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of reflective practice and action research',
    allowMultipleFiles: true
  },
  {
    id: 'gp2.4',
    gp: 'GP 2',
    subsection: '2.4',
    title: 'Effective Communication & Use of Media',
    description: 'Demonstrates effective communication and use of various media in teaching.',
    recommendedEvidence: [
      'PowerPoints used in class',
      'Videos, Smartboard captures',
      'WhatsApp group communication',
      'Google Classroom screenshots',
      'Class visit sheets'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of effective communication and media use',
    allowMultipleFiles: true
  },

  // GP3 - Classroom Management & Diversity
  {
    id: 'gp3.1',
    gp: 'GP 3',
    subsection: '3.1',
    title: 'Developmental Characteristics of Students',
    description: 'Understands and addresses developmental characteristics of students.',
    recommendedEvidence: [
      'Lesson plans showing age-appropriate activities',
      'Differentiated tasks'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence addressing developmental characteristics',
    allowMultipleFiles: true
  },
  {
    id: 'gp3.2',
    gp: 'GP 3',
    subsection: '3.2',
    title: 'Diverse Learning Needs',
    description: 'Addresses diverse learning needs of all students.',
    recommendedEvidence: [
      'Differentiated lesson plans',
      'SEN accommodations',
      'Modified worksheets'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of addressing diverse learning needs',
    allowMultipleFiles: true
  },
  {
    id: 'gp3.3',
    gp: 'GP 3',
    subsection: '3.3',
    title: 'Inclusive Education',
    description: 'Implements inclusive education practices to support all learners.',
    recommendedEvidence: [
      'Evidence of support strategies',
      'Diagnostic test results',
      'Individualized learning tasks'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of inclusive education practices',
    allowMultipleFiles: true
  },
  {
    id: 'gp3.4',
    gp: 'GP 3',
    subsection: '3.4',
    title: 'Learning Styles & Diagnostic Assessment',
    description: 'Uses learning style assessments and diagnostic tools to inform teaching.',
    recommendedEvidence: [
      'Diagnostic tests',
      'Learning style assessments',
      'Mark book comparisons',
      'Individual progress charts'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of learning styles and diagnostic assessment',
    allowMultipleFiles: true
  },
  {
    id: 'gp3.5',
    gp: 'GP 3',
    subsection: '3.5',
    title: 'Interest, Prior Learning, Integration',
    description: 'Incorporates student interests, prior learning, and integration strategies.',
    recommendedEvidence: [
      'Projects integrating prior knowledge',
      'Cross-subject activities',
      'Reinforcement worksheets'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of interest, prior learning, and integration',
    allowMultipleFiles: true
  },
  {
    id: 'gp3.6',
    gp: 'GP 3',
    subsection: '3.6',
    title: 'Gender & Equity Approaches',
    description: 'Implements gender-sensitive and equitable teaching approaches.',
    recommendedEvidence: [
      'Individual work plans',
      'Notes showing adjusted instruction',
      'Patterns in mark book showing equity'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of gender and equity approaches',
    allowMultipleFiles: true
  },
  {
    id: 'gp3.7',
    gp: 'GP 3',
    subsection: '3.7',
    title: 'Behaviour Management',
    description: 'Establishes and maintains effective behaviour management strategies.',
    recommendedEvidence: [
      'Classroom rules',
      'Log book entries',
      'Behaviour contracts'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of behaviour management',
    allowMultipleFiles: true
  },
  {
    id: 'gp3.8',
    gp: 'GP 3',
    subsection: '3.8',
    title: 'Safe Classroom Environment',
    description: 'Creates and maintains a safe and supportive classroom environment.',
    recommendedEvidence: [
      'Incentive programme',
      'Photographs of classroom setup',
      'Reflection on safe space creation'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of safe classroom environment',
    allowMultipleFiles: true
  },

  // GP4 - Professional Development
  {
    id: 'gp4.1',
    gp: 'GP 4',
    subsection: '4.1',
    title: 'Self-Assessment, Collaboration, IDP',
    description: 'Engages in self-assessment, collaboration, and Individual Development Planning.',
    recommendedEvidence: [
      'Meeting agendas',
      'Peer review notes',
      'Reflection sheets',
      'IDP (Individual Development Plan)'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of self-assessment, collaboration, and IDP',
    allowMultipleFiles: true
  },
  {
    id: 'gp4.2',
    gp: 'GP 4',
    subsection: '4.2',
    title: 'Improving Content Mastery & Methodology',
    description: 'Continuously improves content mastery and teaching methodology.',
    recommendedEvidence: [
      'Workshop certificates',
      'PD logs',
      'Lesson plans using new strategies',
      'Technology integration evidence'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of improving content mastery and methodology',
    allowMultipleFiles: true
  },
  {
    id: 'gp4.3',
    gp: 'GP 4',
    subsection: '4.3',
    title: 'Higher Order Thinking / 5Es & 4Cs',
    description: 'Promotes higher order thinking using 5Es and 4Cs framework.',
    recommendedEvidence: [
      'Lesson plans showing 5Es',
      'Lesson plans using Critical Thinking, Creativity',
      'Reflection on teaching improvement'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of higher order thinking and 5Es & 4Cs',
    allowMultipleFiles: true
  },

  // GP5 - Parents & Community
  {
    id: 'gp5.1',
    gp: 'GP 5',
    subsection: '5.1',
    title: 'Communication with Parents',
    description: 'Establishes and maintains effective communication with parents.',
    recommendedEvidence: [
      'Call logs',
      'Logbook entries',
      'Parent-teacher meeting notes',
      'Screenshots of communication (messages, memos)'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of parent communication',
    allowMultipleFiles: true
  },
  {
    id: 'gp5.2',
    gp: 'GP 5',
    subsection: '5.2',
    title: 'Community Engagement',
    description: 'Engages with the school and broader community.',
    recommendedEvidence: [
      'PTA attendance lists',
      'Photos of school events',
      'Evidence of community project participation'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of community engagement',
    allowMultipleFiles: true
  },
  {
    id: 'gp5.3',
    gp: 'GP 5',
    subsection: '5.3',
    title: 'Values & Attitudes with Community',
    description: 'Promotes values and positive attitudes within the community.',
    recommendedEvidence: [
      'Jamaica Day photos',
      'Prizegiving photos/videos',
      'Resource personnel evidence'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of values and attitudes with community',
    allowMultipleFiles: true
  },
  {
    id: 'gp5.4',
    gp: 'GP 5',
    subsection: '5.4',
    title: 'Professional Responsibility in the Community',
    description: 'Demonstrates professional responsibility within the community context.',
    recommendedEvidence: [
      'Referrals',
      'Intervention programme logs',
      'Fundraising activity records'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of professional responsibility in community',
    allowMultipleFiles: true
  },

  // GP6 - Professional Conduct
  {
    id: 'gp6.1',
    gp: 'GP 6',
    subsection: '6.1',
    title: 'Modelling Positive Behaviour',
    description: 'Models positive behaviour and professional conduct.',
    recommendedEvidence: [
      'Attendance registers',
      'Peer observation sheets',
      'Student feedback'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of modelling positive behaviour',
    allowMultipleFiles: true
  },
  {
    id: 'gp6.2',
    gp: 'GP 6',
    subsection: '6.2',
    title: 'Commitment to Students & Institution',
    description: 'Demonstrates commitment to students and the educational institution.',
    recommendedEvidence: [
      'Department meeting logs',
      'Project committee records',
      'Commendation letters'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of commitment to students and institution',
    allowMultipleFiles: true
  },
  {
    id: 'gp6.3',
    gp: 'GP 6',
    subsection: '6.3',
    title: 'Responsibility to Self & Others',
    description: 'Demonstrates responsibility to self and others in professional practice.',
    recommendedEvidence: [
      'Class visit reports',
      'Student appraisal forms',
      'Awards for teaching excellence'
    ],
    maxCredit: 3,
    uploadFieldLabel: 'Upload evidence of responsibility to self and others',
    allowMultipleFiles: true
  }
]

/**
 * Get evidence schema items by GP category
 * @param {string} gpCategory - The GP category (e.g., 'GP1', 'GP2', etc.)
 * @returns {Array} - Filtered array of evidence schema items
 */
export function getEvidenceByGP(gpCategory) {
  const gpNumber = gpCategory.replace('GP', '')
  return evidenceSchema.filter(item => item.gp.startsWith(`GP ${gpNumber}`))
}

/**
 * Get evidence schema item by ID
 * @param {string} id - The ID of the evidence schema item (e.g., 'gp1.1')
 * @returns {Object|null} - The evidence schema item or null if not found
 */
export function getEvidenceById(id) {
  return evidenceSchema.find(item => item.id === id) || null
}

/**
 * Get all GP categories from evidence schema
 * @returns {Array} - Array of unique GP categories
 */
export function getAllGPCategories() {
  return [...new Set(evidenceSchema.map(item => {
    const match = item.gp.match(/GP (\d+)/)
    return match ? `GP${match[1]}` : null
  }).filter(Boolean))]
}
