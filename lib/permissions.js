// =====================================================================
// SCHOOLCONNECT 360 - ROLE DEFINITIONS & PERMISSION ENGINE
// Covers all 34 System Roles + Custom Roles
// =====================================================================

export const ROLE_DEFINITIONS = {
  // Platform Level
  super_admin: {
    title: 'Super Administrator',
    category: 'Platform Administration',
    isPlatformLevel: true,
    modules: ['overview', 'applications', 'schools', 'users', 'subscriptions', 'announcements', 'audit', 'settings'],
    description: 'Manages multi-school platform, reviews applications, monitors subscriptions and audit logs.',
  },

  // School Leadership
  school_owner: {
    title: 'School Owner / Proprietor',
    category: 'School Leadership',
    modules: ['overview', 'students', 'staff', 'academics', 'finance_summary', 'reports', 'approvals'],
    description: 'Reviews institutional performance, high-level financials, and major policy approvals.',
  },
  headteacher: {
    title: 'Headteacher / Principal',
    category: 'School Leadership',
    modules: ['overview', 'students', 'staff', 'academics', 'attendance', 'examinations', 'reports', 'approvals'],
    description: 'Oversees whole-school educational operations, Student Directory, staff performance, and approvals.',
  },
  deputy_headteacher_academics: {
    title: 'Deputy Headteacher — Academics',
    category: 'School Leadership',
    modules: ['overview', 'academics', 'examinations', 'classes', 'timetables', 'reports'],
    description: 'Coordinates curriculum delivery, teacher performance, and academic examinations.',
  },
  deputy_headteacher_discipline: {
    title: 'Deputy Headteacher — Discipline',
    category: 'School Leadership',
    modules: ['overview', 'discipline', 'attendance', 'students', 'reports'],
    description: 'Oversees student conduct, attendance adherence, and disciplinary follow-ups.',
  },
  school_admin: {
    title: 'School Administrator',
    category: 'School Leadership',
    modules: ['overview', 'profile', 'academics', 'students', 'staff', 'accounts', 'departments', 'operations', 'reports', 'settings'],
    description: 'Configures school workspace, classes, departments, user accounts, and operations.',
  },

  // Academic Department
  director_of_studies: {
    title: 'Director of Studies',
    category: 'Academic Department',
    modules: ['overview', 'academics', 'classes', 'subjects', 'teacher_assignments', 'timetables', 'examinations'],
    description: 'Manages academic structures, syllabus schedules, timetable allocations, and examinations.',
  },
  teacher: {
    title: 'Subject Teacher',
    category: 'Academic Department',
    modules: ['overview', 'my_classes', 'my_subjects', 'attendance', 'marks', 'assignments', 'timetables'],
    description: 'Teaches assigned classes, takes attendance, enters marks, and gives student assignments.',
  },
  class_teacher: {
    title: 'Class Teacher',
    category: 'Academic Department',
    modules: ['overview', 'my_class', 'attendance', 'students', 'marks', 'report_cards', 'parent_contacts'],
    description: 'Oversees assigned class stream, daily attendance, student welfare, and report card remarks.',
  },
  examination_officer: {
    title: 'Examination Officer',
    category: 'Academic Department',
    modules: ['overview', 'examinations', 'assessments', 'marks_review', 'results_processing'],
    description: 'Coordinates exam timetables, assessment weights, marks verification, and grading.',
  },
  academic_records_officer: {
    title: 'Academic Records Officer',
    category: 'Academic Department',
    modules: ['overview', 'records', 'results', 'report_cards', 'transcripts', 'corrections'],
    description: 'Maintains verified academic archives, official transcripts, and grade corrections.',
  },
  registrar: {
    title: 'Registrar / Admissions Officer',
    category: 'Academic Department',
    modules: ['overview', 'admissions', 'students', 'enrollments', 'guardians', 'transfers'],
    description: 'Primary officer for student registration, guardian linkage, and class enrollment.',
  },

  // Finance
  bursar: {
    title: 'Bursar / Accountant',
    category: 'Finance',
    modules: ['overview', 'fees', 'invoices', 'payments', 'receipts', 'expenses', 'reports'],
    description: 'Configures fee structures, audits tuition collections, reconciles payments, and logs expenses.',
  },
  cashier: {
    title: 'Cashier',
    category: 'Finance',
    modules: ['overview', 'record_payment', 'student_invoices', 'receipts', 'my_transactions'],
    description: 'Processes counter payments, searches student accounts, and issues official receipts.',
  },

  // Health and Welfare
  nurse: {
    title: 'Nurse / Health Officer',
    category: 'Health and Welfare',
    modules: ['overview', 'clinic_visits', 'student_health', 'medical_followups', 'health_reports'],
    description: 'Records infirmary visits, student health profiles, prescriptions, and medical vitals.',
  },
  counsellor: {
    title: 'School Counsellor',
    category: 'Health and Welfare',
    modules: ['overview', 'counselling_cases', 'case_notes', 'referrals', 'action_plans'],
    description: 'Provides confidential emotional and behavioral guidance for assigned cases.',
  },
  safeguarding_officer: {
    title: 'Safeguarding Officer',
    category: 'Health and Welfare',
    modules: ['overview', 'safeguarding_cases', 'incident_reports', 'interventions', 'audits'],
    description: 'Maintains highly restricted child protection and safeguarding case files.',
  },
  discipline_officer: {
    title: 'Discipline Officer',
    category: 'Health and Welfare',
    modules: ['overview', 'discipline_records', 'student_cases', 'interventions', 'reports'],
    description: 'Documents disciplinary infractions, detentions, suspensions, and corrective measures.',
  },
  student_affairs_officer: {
    title: 'Student Affairs Officer',
    category: 'Health and Welfare',
    modules: ['overview', 'student_welfare', 'student_requests', 'activities', 'followups'],
    description: 'Coordinates student services, general welfare, and campus student requests.',
  },

  // School Operations
  librarian: {
    title: 'Librarian',
    category: 'School Operations',
    modules: ['overview', 'books_catalog', 'issue_return', 'borrowings', 'overdue', 'reports'],
    description: 'Manages library book inventory, issues books directly to enrolled students, and collects fines.',
  },
  hr_manager: {
    title: 'HR Manager',
    category: 'School Operations',
    modules: ['overview', 'staff_directory', 'staff_attendance', 'leave_requests', 'departments', 'reports'],
    description: 'Oversees staff employment records, daily staff attendance, and leave approvals.',
  },
  procurement_officer: {
    title: 'Procurement Officer',
    category: 'School Operations',
    modules: ['overview', 'procurement_requests', 'purchase_orders', 'suppliers', 'reports'],
    description: 'Handles department purchase requests, quotes, purchase orders, and supplier liaison.',
  },
  storekeeper: {
    title: 'Storekeeper / Inventory Manager',
    category: 'School Operations',
    modules: ['overview', 'inventory_items', 'stock_in_out', 'low_stock_alerts', 'reports'],
    description: 'Tracks consumable supplies, equipment assets, and material checkouts.',
  },
  feeding_manager: {
    title: 'Feeding / Cafeteria Manager',
    category: 'School Operations',
    modules: ['overview', 'meal_menus', 'cafeteria_inventory', 'feeding_reports'],
    description: 'Plans daily breakfast/lunch menus, monitors kitchen stock, and caters to dietary needs.',
  },
  transport_manager: {
    title: 'Transport Manager',
    category: 'School Operations',
    modules: ['overview', 'bus_routes', 'vehicle_fleet', 'student_allocations', 'reports'],
    description: 'Manages school bus routes, drivers, maintenance, and student transit allocations.',
  },
  boarding_manager: {
    title: 'Boarding / Hostel Manager',
    category: 'School Operations',
    modules: ['overview', 'dormitories', 'room_allocations', 'boarding_rollcall', 'reports'],
    description: 'Assigns dorm rooms and beds to enrolled students, and monitors boarding attendance.',
  },

  // Activities & Communication
  sports_coordinator: {
    title: 'Sports Coordinator',
    category: 'Activities and Communication',
    modules: ['overview', 'sports_teams', 'fixtures', 'competitions', 'achievements'],
    description: 'Organizes school athletic teams, matches, coaching schedules, and sports trophies.',
  },
  club_coordinator: {
    title: 'Club Coordinator',
    category: 'Activities and Communication',
    modules: ['overview', 'school_clubs', 'club_members', 'meetings', 'activities'],
    description: 'Coordinates extracurricular clubs, student enrollments, and club patrons.',
  },
  communications_officer: {
    title: 'Communications Officer',
    category: 'Activities and Communication',
    modules: ['overview', 'announcements', 'newsletters', 'events', 'parent_broadcasts'],
    description: 'Publishes public and internal notices, event calendars, and school news.',
  },
  it_administrator: {
    title: 'IT Administrator',
    category: 'Activities and Communication',
    modules: ['overview', 'user_accounts', 'audit_logs', 'system_health', 'settings'],
    description: 'Monitors platform usage, user logins, security audit logs, and account credentials.',
  },
  receptionist: {
    title: 'Receptionist / Front Desk',
    category: 'Activities and Communication',
    modules: ['overview', 'visitor_logs', 'appointments', 'directory_lookup', 'inquiries'],
    description: 'Manages visitor sign-ins, parent appointment bookings, and front office inquiries.',
  },

  // School Community
  parent: {
    title: 'Parent / Guardian',
    category: 'School Community',
    modules: ['overview', 'my_children', 'attendance', 'report_cards', 'fee_balances', 'announcements'],
    description: 'Views connected children’s real-time attendance, grades, report cards, and fee invoices.',
  },
  student: {
    title: 'Student',
    category: 'School Community',
    modules: ['overview', 'my_profile', 'my_timetable', 'my_attendance', 'my_marks', 'announcements'],
    description: 'Accesses personal class timetables, assignments, attendance records, and verified term marks.',
  },
  alumni: {
    title: 'Alumni',
    category: 'School Community',
    modules: ['overview', 'alumni_directory', 'school_news', 'events', 'giving'],
    description: 'Connects with former classmates, mentors current students, and attends reunion events.',
  },
  supplier: {
    title: 'Supplier',
    category: 'School Community',
    modules: ['overview', 'purchase_orders', 'deliveries', 'invoices_status'],
    description: 'Receives school purchase orders, submits delivery confirmations, and tracks payment statuses.',
  },

  // Custom Role Fallback
  custom_role: {
    title: 'Custom Assigned Role',
    category: 'Custom Role',
    modules: ['overview', 'students', 'academics', 'reports'],
    description: 'Custom defined role with granular permissions granted by the School Administrator.',
  },
};

/**
 * Returns the navigation links configured for the active role.
 */
export function getRoleNavLinks(role) {
  const def = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.custom_role;

  if (role === 'super_admin') {
    return [
      { name: 'Platform Overview', path: '/dashboard', icon: 'LayoutDashboard' },
      { name: 'School Applications', path: '/dashboard/superadmin/applications', icon: 'Building' },
      { name: 'Registered Schools', path: '/dashboard/superadmin/schools', icon: 'GraduationCap' },
      { name: 'Platform Users', path: '/dashboard/superadmin/users', icon: 'Users' },
      { name: 'Subscriptions', path: '/dashboard/superadmin/subscriptions', icon: 'CreditCard' },
      { name: 'Audit Logs', path: '/dashboard/superadmin/audit', icon: 'ShieldCheck' },
      { name: 'Platform Settings', path: '/dashboard/superadmin/settings', icon: 'Settings' },
    ];
  }

  // Base navigation items tailored to the role
  const links = [{ name: 'Dashboard Overview', path: '/dashboard', icon: 'LayoutDashboard' }];

  // Leadership & Academic
  if (['school_owner', 'headteacher', 'school_admin', 'deputy_headteacher_academics', 'director_of_studies', 'registrar', 'academic_records_officer'].includes(role)) {
    links.push({ name: 'Student Directory', path: '/dashboard/students', icon: 'Users' });
    links.push({ name: 'Academics & Classes', path: '/dashboard/academics', icon: 'BookOpen' });
  }

  // Teacher / Class Teacher
  if (['teacher', 'class_teacher'].includes(role)) {
    links.push({ name: 'My Classes & Students', path: '/dashboard/students', icon: 'Users' });
    links.push({ name: 'Attendance Register', path: '/dashboard/attendance', icon: 'CalendarCheck' });
    links.push({ name: 'Marks & Grading', path: '/dashboard/examinations', icon: 'Award' });
  }

  // Attendance
  if (['headteacher', 'school_admin', 'deputy_headteacher_discipline', 'registrar'].includes(role)) {
    links.push({ name: 'Attendance Overview', path: '/dashboard/attendance', icon: 'CalendarCheck' });
  }

  // Examinations
  if (['headteacher', 'examination_officer', 'academic_records_officer', 'director_of_studies', 'deputy_headteacher_academics'].includes(role)) {
    links.push({ name: 'Examinations & Reports', path: '/dashboard/examinations', icon: 'Award' });
  }

  // Finance & Bursary
  if (['bursar', 'cashier', 'school_owner', 'school_admin', 'headteacher'].includes(role)) {
    links.push({ name: 'Finance & Invoices', path: '/dashboard/finance', icon: 'CreditCard' });
  }

  // Library
  if (['librarian', 'headteacher', 'school_admin'].includes(role)) {
    links.push({ name: 'Library System', path: '/dashboard/library', icon: 'Library' });
  }

  // Health Clinic (Confidential)
  if (['nurse'].includes(role)) {
    links.push({ name: 'Infirmary Clinic', path: '/dashboard/clinic', icon: 'HeartPulse' });
  }

  // Counselling (Strictly Confidential)
  if (['counsellor'].includes(role)) {
    links.push({ name: 'Counselling Cases', path: '/dashboard/counselling', icon: 'FileHeart' });
  }

  // Safeguarding (Strictly Confidential)
  if (['safeguarding_officer'].includes(role)) {
    links.push({ name: 'Safeguarding Register', path: '/dashboard/safeguarding', icon: 'ShieldAlert' });
  }

  // Discipline
  if (['discipline_officer', 'deputy_headteacher_discipline', 'headteacher', 'school_admin'].includes(role)) {
    links.push({ name: 'Discipline Records', path: '/dashboard/discipline', icon: 'Gavel' });
  }

  // Operations (Procurement, Store, Cafeteria, Transport, Boarding)
  if (['procurement_officer', 'storekeeper', 'feeding_manager', 'transport_manager', 'boarding_manager', 'school_admin'].includes(role)) {
    links.push({ name: 'School Operations', path: '/dashboard/operations', icon: 'Truck' });
  }

  // Approvals
  if (['school_owner', 'headteacher', 'school_admin', 'hr_manager', 'bursar'].includes(role)) {
    links.push({ name: 'Approvals & Requests', path: '/dashboard/approvals', icon: 'CheckSquare' });
  }

  // Reports
  if (['school_owner', 'headteacher', 'school_admin', 'bursar', 'director_of_studies'].includes(role)) {
    links.push({ name: 'Analytical Reports', path: '/dashboard/reports', icon: 'BarChart3' });
  }

  // Parent Portal
  if (role === 'parent') {
    links.push({ name: 'My Children', path: '/dashboard/students', icon: 'Users' });
    links.push({ name: 'Attendance & Reports', path: '/dashboard/examinations', icon: 'Award' });
  }

  // Student Portal
  if (role === 'student') {
    links.push({ name: 'My Courses & Marks', path: '/dashboard/examinations', icon: 'Award' });
    links.push({ name: 'My Attendance', path: '/dashboard/attendance', icon: 'CalendarCheck' });
    links.push({ name: 'Library Borrowings', path: '/dashboard/library', icon: 'BookOpen' });
  }

  // Supplier Portal
  if (role === 'supplier') {
    links.push({ name: 'Purchase Orders', path: '/dashboard/operations', icon: 'Truck' });
  }

  // Account management — authorised school leadership and HR
  if (['school_admin', 'headteacher', 'school_owner', 'hr_manager'].includes(role)) {
    links.push({ name: 'Account Management', path: '/dashboard/accounts', icon: 'UserCheck' });
  }

  if (role === 'school_admin') {
    links.push({ name: 'Class Management', path: '/dashboard/classes', icon: 'Layers' });
    links.push({ name: 'School Settings', path: '/dashboard/settings', icon: 'Settings' });
  }

  // Class Management — Headteacher / Deputy / Director of Studies
  if (['headteacher', 'deputy_headteacher_academics', 'director_of_studies'].includes(role)) {
    links.push({ name: 'Class Management', path: '/dashboard/classes', icon: 'Layers' });
  }

  // My Class — Class Teacher and regular Teacher
  if (['teacher', 'class_teacher'].includes(role)) {
    links.push({ name: 'My Class Portal', path: '/dashboard/myclass', icon: 'Layers' });
  }

  // HR — HR Manager
  if (role === 'hr_manager') {
    links.push({ name: 'HR Management', path: '/dashboard/hr', icon: 'Briefcase' });
  }

  // Parent portal link
  if (role === 'parent') {
    links.push({ name: 'My Children', path: '/dashboard/parent', icon: 'Baby' });
  }

  // Student portal link
  if (role === 'student') {
    links.push({ name: 'My Student Portal', path: '/dashboard/student', icon: 'GraduationCap' });
  }

  // Messages — everyone (school roles)
  links.push({ name: 'Messages', path: '/dashboard/messages', icon: 'MessageSquare' });

  // Profile — everyone
  links.push({ name: 'My Profile', path: '/dashboard/profile', icon: 'UserCircle' });

  return links;
}

/**
 * Checks if a given role is strictly barred from accessing sensitive records.
 */
export function isAccessRestricted(role, moduleName) {
  // Super Admin cannot access student medical, counselling, or safeguarding records
  if (role === 'super_admin' && ['clinic', 'counselling', 'safeguarding'].includes(moduleName)) {
    return true;
  }

  // Non-nurses cannot view clinic notes
  if (moduleName === 'clinic' && role !== 'nurse') {
    return true;
  }

  // Non-counsellors cannot view counselling notes
  if (moduleName === 'counselling' && role !== 'counsellor') {
    return true;
  }

  // Non-safeguarding officers cannot view safeguarding cases
  if (moduleName === 'safeguarding' && role !== 'safeguarding_officer') {
    return true;
  }

  return false;
}
