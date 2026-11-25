/**
 * Payroll Management System — Main Application Controller (app.js)
 * Entry point that ties Auth, Store, and all feature modules together.
 * Handles login/logout, navigation, dashboard, and toast notifications.
 */

const App = {
  // =========================================================
  //  BOOTSTRAP
  // =========================================================
  init() {
    Store.init();

    const user = Auth.getCurrentUser();
    if (user) {
      this._showMainApp(user);
    } else {
      this._showLoginScreen();
    }
  },

  // =========================================================
  //  LOGIN SCREEN
  // =========================================================
  _showLoginScreen() {
    const loginEl  = document.getElementById("loginScreen");
    const mainEl   = document.getElementById("mainApp");
    if (loginEl) loginEl.classList.remove("d-none");
    if (mainEl)  mainEl.classList.add("d-none");

    this._bindLoginEvents();
  },

  _bindLoginEvents() {
    // Regular login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        const result   = Auth.login(username, password);

        if (result.success) {
          this._onLoginSuccess(result.user);
        } else {
          this._showLoginError(result.message || "Invalid credentials.");
        }
      });
    }

    // Quick login buttons
    const demoRoles = ["admin", "hr", "employee"];
    demoRoles.forEach(role => {
      const btn = document.getElementById(`quickLogin_${role}`);
      if (btn) {
        btn.addEventListener("click", () => {
          const result = Auth.quickLogin(role);
          if (result.success) {
            this._onLoginSuccess(result.user);
          }
        });
      }
    });

    // Toggle password visibility
    const togglePwd = document.getElementById("togglePassword");
    if (togglePwd) {
      togglePwd.addEventListener("click", () => {
        const pwdInput = document.getElementById("loginPassword");
        const icon     = togglePwd.querySelector("i");
        if (pwdInput.type === "password") {
          pwdInput.type = "text";
          if (icon) { icon.classList.remove("bi-eye"); icon.classList.add("bi-eye-slash"); }
        } else {
          pwdInput.type = "password";
          if (icon) { icon.classList.remove("bi-eye-slash"); icon.classList.add("bi-eye"); }
        }
      });
    }
  },

  _showLoginError(msg) {
    const errEl = document.getElementById("loginError");
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove("d-none");
      setTimeout(() => errEl.classList.add("d-none"), 4000);
    }
  },

  _onLoginSuccess(user) {
    const loginEl = document.getElementById("loginScreen");
    const mainEl  = document.getElementById("mainApp");
    if (loginEl) loginEl.classList.add("d-none");
    if (mainEl)  mainEl.classList.remove("d-none");
    this._showMainApp(user);
  },

  // =========================================================
  //  MAIN APP SHELL
  // =========================================================
  _showMainApp(user) {
    this._renderNavbar(user);
    this._renderSidebar(user);
    this._bindGlobalEvents(user);

    // Default landing section
    if (user.role === "employee") {
      this.navigateTo("dashboard");
    } else {
      this.navigateTo("dashboard");
    }
  },

  // ---- Navbar ----
  _renderNavbar(user) {
    const navbar = document.getElementById("mainNavbar");
    if (!navbar) return;

    const isAdmin    = user.role === "admin";
    const isHR       = user.role === "hr";
    const isEmployee = user.role === "employee";

    navbar.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-link text-dark p-0 border-0" id="sidebarToggleBtn" title="Toggle Sidebar">
          <i class="bi bi-list fs-4"></i>
        </button>
        <a class="navbar-brand fw-bold text-primary mb-0 fs-6" href="javascript:void(0)" onclick="App.navigateTo('dashboard')">
          <i class="bi bi-briefcase-fill me-1"></i>
          <span class="d-none d-sm-inline">Zenith Global</span>
          <span class="d-inline d-sm-none">ZGT</span>
        </a>
      </div>

      <div class="d-flex align-items-center gap-2 gap-sm-3">
        <!-- Demo View Switcher Toolbar -->
        <div class="btn-group btn-group-sm d-none d-md-inline-flex" role="group" aria-label="Demo Role Switcher">
          <button type="button" class="btn ${isAdmin ? 'btn-primary active' : 'btn-outline-primary'} py-1 px-2" onclick="App.switchRole('admin')" title="Switch to Admin view">
            <i class="bi bi-shield-lock me-1"></i>Admin
          </button>
          <button type="button" class="btn ${isHR ? 'btn-success active' : 'btn-outline-success'} py-1 px-2" onclick="App.switchRole('hr')" title="Switch to HR view">
            <i class="bi bi-people me-1"></i>HR
          </button>
          <button type="button" class="btn ${isEmployee ? 'btn-secondary active' : 'btn-outline-secondary'} py-1 px-2" onclick="App.switchRole('employee')" title="Switch to Employee view">
            <i class="bi bi-person me-1"></i>Employee
          </button>
        </div>

        <!-- Reset Demo Data Button -->
        <button class="btn btn-sm btn-outline-warning d-none d-sm-inline-flex align-items-center gap-1 py-1 px-2" onclick="App.resetDemoData()" title="Reset demo data to default sample state">
          <i class="bi bi-arrow-counterclockwise"></i> <span class="d-none d-lg-inline">Reset Demo</span>
        </button>
        <!-- Notification Bell -->
        <div class="dropdown">
          <button class="btn btn-link text-dark p-1 border-0 position-relative" data-bs-toggle="dropdown"
              aria-expanded="false" title="Notifications">
            <i class="bi bi-bell fs-5"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style="font-size:0.6rem;">3</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow" style="width:300px;">
            <li class="dropdown-header fw-semibold text-dark px-3 py-2 border-bottom">
              Notifications <span class="badge bg-danger ms-1">3</span>
            </li>
            <li>
              <a class="dropdown-item py-2" href="javascript:void(0)">
                <div class="d-flex gap-2 align-items-start">
                  <i class="bi bi-clock text-warning mt-1"></i>
                  <div>
                    <div class="small fw-medium">November 2026 payroll pending</div>
                    <div class="text-muted" style="font-size:0.75rem;">Generate &amp; approve payroll batch</div>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a class="dropdown-item py-2" href="javascript:void(0)" onclick="App.navigateTo('leaves')">
                <div class="d-flex gap-2 align-items-start">
                  <i class="bi bi-calendar-x text-info mt-1"></i>
                  <div>
                    <div class="small fw-medium">2 leave requests pending</div>
                    <div class="text-muted" style="font-size:0.75rem;">Sneha Rao, Suresh Reddy</div>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a class="dropdown-item py-2" href="javascript:void(0)">
                <div class="d-flex gap-2 align-items-start">
                  <i class="bi bi-cake2 text-success mt-1"></i>
                  <div>
                    <div class="small fw-medium">Upcoming birthday: Manoj Tiwari</div>
                    <div class="text-muted" style="font-size:0.75rem;">Dec 03 — in 11 days</div>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>

        <!-- User Avatar + Dropdown -->
        <div class="dropdown">
          <button class="btn btn-link p-0 border-0 d-flex align-items-center gap-2 text-decoration-none"
              data-bs-toggle="dropdown" aria-expanded="false">
            <img src="${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName) + '&background=2563eb&color=fff&size=36'}"
                alt="${user.fullName}" class="rounded-circle border"
                style="width:34px;height:34px;object-fit:cover;"
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=2563eb&color=fff&size=36'">
            <div class="d-none d-md-block text-start">
              <div class="fw-semibold text-dark" style="font-size:0.82rem;line-height:1.2;">${user.fullName}</div>
              <div class="text-muted" style="font-size:0.70rem;text-transform:capitalize;">${user.role}</div>
            </div>
            <i class="bi bi-chevron-down text-muted d-none d-md-inline" style="font-size:0.65rem;"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <li class="px-3 py-2 border-bottom">
              <div class="fw-semibold">${user.fullName}</div>
              <div class="text-muted small">${user.email || ""}</div>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle mt-1" style="text-transform:capitalize;">${user.role}</span>
            </li>
            <li class="dropdown-header fw-bold text-dark px-3 pt-2 pb-1 small">Demo View Switcher</li>
            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="App.switchRole('admin')"><i class="bi bi-shield-lock text-primary me-2"></i>Switch to Admin</a></li>
            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="App.switchRole('hr')"><i class="bi bi-people text-success me-2"></i>Switch to HR</a></li>
            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="App.switchRole('employee')"><i class="bi bi-person text-secondary me-2"></i>Switch to Employee</a></li>
            <li><hr class="dropdown-divider my-1"></li>
            <li><a class="dropdown-item py-1 small text-warning" href="javascript:void(0)" onclick="App.resetDemoData()"><i class="bi bi-arrow-counterclockwise me-2"></i>Reset Demo Data</a></li>
            <li><hr class="dropdown-divider my-1"></li>
            ${user.role === "employee" ? `
            <li>
              <a class="dropdown-item" href="javascript:void(0)" onclick="App.navigateTo('dashboard')">
                <i class="bi bi-person-circle me-2"></i>My Profile
              </a>
            </li>` : ""}
            <li>
              <a class="dropdown-item text-danger" href="javascript:void(0)" id="navLogoutBtn">
                <i class="bi bi-box-arrow-right me-2"></i>Logout
              </a>
            </li>
          </ul>
        </div>
      </div>`;

    // Bind logout
    const logoutBtn = document.getElementById("navLogoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => this.logout());

    // Bind sidebar toggle
    const toggleBtn = document.getElementById("sidebarToggleBtn");
    if (toggleBtn) toggleBtn.addEventListener("click", () => this._toggleSidebar());
  },

  // ---- Sidebar ----
  _renderSidebar(user) {
    const sidebar = document.getElementById("mainSidebar");
    if (!sidebar) return;

    const isAdmin    = user.role === "admin";
    const isHR       = user.role === "hr";
    const isEmployee = user.role === "employee";

    let navItems = [];

    if (isAdmin || isHR) {
      navItems = [
        { section: "dashboard",   icon: "bi-speedometer2",       label: "Dashboard" },
        { section: "employees",   icon: "bi-people-fill",         label: "Employees" },
        ...(isAdmin ? [{ section: "departments", icon: "bi-diagram-3-fill", label: "Departments" }] : []),
        { section: "attendance",  icon: "bi-clock-history",       label: "Attendance" },
        { section: "leaves",      icon: "bi-calendar-x-fill",     label: "Leaves" },
        { section: "salary",      icon: "bi-currency-rupee",      label: "Salary" },
        { section: "payroll",     icon: "bi-credit-card-2-front", label: "Payroll Processing" },
        { section: "reports",     icon: "bi-file-earmark-bar-graph-fill", label: "Reports" },
        { section: "idcards",     icon: "bi-person-badge-fill",   label: "ID Cards" }
      ];
    } else if (isEmployee) {
      navItems = [
        { section: "dashboard",   icon: "bi-house-fill",          label: "Dashboard" },
        { section: "myprofile",   icon: "bi-person-circle",       label: "My Profile" },
        { section: "myattendance",icon: "bi-clock-history",       label: "My Attendance" },
        { section: "myleaves",    icon: "bi-calendar-x-fill",     label: "My Leaves" },
        { section: "mysalary",    icon: "bi-currency-rupee",      label: "My Salary" },
        { section: "mypayslips",  icon: "bi-receipt",             label: "My Payslips" },
        { section: "myidcard",    icon: "bi-person-badge-fill",   label: "My ID Card" }
      ];
    }

    sidebar.innerHTML = `
      <div class="d-flex flex-column h-100">
        <!-- Brand -->
        <div class="px-3 py-3 border-bottom d-flex align-items-center gap-2">
          <div class="rounded-2 bg-primary d-flex align-items-center justify-content-center flex-shrink-0"
              style="width:36px;height:36px;">
            <i class="bi bi-briefcase-fill text-white"></i>
          </div>
          <div class="sidebar-brand-text overflow-hidden">
            <div class="fw-bold text-dark" style="font-size:0.85rem;white-space:nowrap;">Zenith Global</div>
            <div class="text-muted" style="font-size:0.70rem;white-space:nowrap;">Payroll Management</div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-grow-1 overflow-auto py-2" id="sidebarNav">
          <ul class="nav flex-column gap-1 px-2">
            ${navItems.map(item => `
              <li class="nav-item">
                <a class="nav-link rounded-2 d-flex align-items-center gap-2 px-3 py-2 text-dark sidebar-nav-link"
                    href="javascript:void(0)"
                    data-section="${item.section}"
                    onclick="App.navigateTo('${item.section}')"
                    id="navLink_${item.section}">
                  <i class="bi ${item.icon} flex-shrink-0" style="font-size:1rem;"></i>
                  <span class="sidebar-link-label">${item.label}</span>
                </a>
              </li>`).join("")}
          </ul>
        </nav>

        <!-- Footer -->
        <div class="border-top px-3 py-2">
          <button class="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
              onclick="App.logout()">
            <i class="bi bi-box-arrow-right"></i>
            <span class="sidebar-link-label">Logout</span>
          </button>
        </div>
      </div>`;
  },

  _toggleSidebar() {
    const wrapper = document.getElementById("appWrapper");
    if (wrapper) wrapper.classList.toggle("sidebar-collapsed");
  },

  _setActiveNavLink(section) {
    document.querySelectorAll(".sidebar-nav-link").forEach(link => {
      link.classList.remove("active", "bg-primary", "text-white");
      link.classList.add("text-dark");
    });
    // Map employee sections back to their base equivalent for ID lookup
    const linkId = `navLink_${section}`;
    const activeLink = document.getElementById(linkId);
    if (activeLink) {
      activeLink.classList.add("active", "bg-primary", "text-white");
      activeLink.classList.remove("text-dark");
    }
  },

  // ---- Global bindings ----
  _bindGlobalEvents(user) {
    // Ensure toast container exists
    if (!document.getElementById("toastContainer")) {
      const container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container position-fixed bottom-0 end-0 p-3";
      container.style.zIndex = "11000";
      document.body.appendChild(container);
    }
  },

  // =========================================================
  //  NAVIGATION
  // =========================================================
  navigateTo(section) {
    const user = Auth.getCurrentUser();
    if (!user) return;

    // Hide all content sections
    const sections = document.querySelectorAll(".app-section");
    sections.forEach(el => el.classList.add("d-none"));

    this._setActiveNavLink(section);

    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      const wrapper = document.getElementById("appWrapper");
      if (wrapper && !wrapper.classList.contains("sidebar-collapsed")) {
        wrapper.classList.add("sidebar-collapsed");
      }
    }

    // Employee-specific routing
    if (user.role === "employee") {
      switch (section) {
        case "dashboard":
        case "myprofile":
        case "myattendance":
        case "myleaves":
        case "mysalary":
        case "mypayslips":
        case "myidcard":
          this._renderEmployeeSection(section, user);
          return;
      }
    }

    // Admin/HR routing
    switch (section) {
      case "dashboard":
        this._showSection("sectionDashboard");
        this.initializeDashboard();
        break;

      case "employees":
        this._showSection("sectionEmployees");
        if (window.EmployeeManager) EmployeeManager.init();
        break;

      case "departments":
        this._showSection("sectionDepartments");
        if (window.DepartmentManager) DepartmentManager.init();
        break;

      case "attendance":
        this._showSection("sectionAttendance");
        if (window.AttendanceManager) AttendanceManager.init();
        break;

      case "leaves":
        this._showSection("sectionLeaves");
        if (window.LeaveManager) LeaveManager.init();
        break;

      case "salary":
        this._showSection("sectionSalary");
        if (window.SalaryManager) SalaryManager.render();
        break;

      case "payroll":
        this._showSection("sectionPayroll");
        if (window.PayrollProcessor) PayrollProcessor.init();
        break;

      case "reports":
        this._showSection("sectionReports");
        if (window.ReportsManager) ReportsManager.init();
        break;

      case "idcards":
        this._showSection("sectionIdCards");
        if (window.IdCardGenerator) IdCardGenerator.renderAllCards();
        break;

      default:
        this.navigateTo("dashboard");
    }
  },

  _showSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("d-none");
    }
  },

  // =========================================================
  //  DASHBOARD (Admin / HR)
  // =========================================================
  initializeDashboard() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    if (user.role === "employee") {
      this._renderEmployeeSection("dashboard", user);
      return;
    }

    this._showSection("sectionDashboard");

    const employees = Store.getEmployees();
    const leaves    = Store.getLeaves();
    const depts     = Store.getDepartments();
    const payroll   = Store.getPayrollRecords();

    const activeEmp   = employees.filter(e => e.employmentStatus === "Active").length;
    const onLeaveEmp  = employees.filter(e => e.employmentStatus === "On Leave").length;
    const pendingLeave = leaves.filter(l => l.status === "Pending").length;

    // Monthly payroll totals (November 2026 or latest available)
    const novRecords = payroll.filter(r => r.month === "November" && r.year === 2026);
    const monthlyNet = novRecords.reduce((s, r) => s + r.netSalary, 0);
    const pendingPay = payroll.filter(r => r.status === "Draft" || r.status === "Approved");

    // Populate stat cards
    this._setTextContent("statTotalEmployees",   employees.length);
    this._setTextContent("statActiveEmployees",  activeEmp);
    this._setTextContent("statOnLeave",          onLeaveEmp);
    this._setTextContent("statMonthlyPayroll",   Store.formatINR(monthlyNet || 0));
    this._setTextContent("statPendingPayroll",   pendingPay.length);
    this._setTextContent("statTotalDepts",       depts.length);

    // Activities
    this._renderActivities();

    // Birthdays
    this._renderBirthdays();

    // Pending leave count badge
    const pendingBadge = document.getElementById("pendingLeaveCount");
    if (pendingBadge) pendingBadge.textContent = pendingLeave;

    // Charts — deferred to allow DOM to settle
    setTimeout(() => {
      if (window.Charts) Charts.initDashboardCharts();
    }, 100);
  },

  _renderActivities() {
    const container = document.getElementById("recentActivitiesList");
    if (!container) return;

    const activities = INITIAL_DATA.activities || [];
    if (activities.length === 0) {
      container.innerHTML = `<div class="text-muted small text-center py-3">No recent activities.</div>`;
      return;
    }

    container.innerHTML = activities.map(act => `
      <div class="d-flex align-items-start gap-3 py-2 border-bottom">
        <div class="rounded-circle bg-light d-flex align-items-center justify-content-center flex-shrink-0"
            style="width:34px;height:34px;">
          <i class="bi ${act.icon} ${act.color}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="small fw-medium text-dark">${act.action}</div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <span class="text-muted" style="font-size:0.72rem;"><i class="bi bi-person me-1"></i>${act.user}</span>
            <span class="text-muted" style="font-size:0.72rem;"><i class="bi bi-clock me-1"></i>${act.time}</span>
          </div>
        </div>
      </div>`).join("");
  },

  _renderBirthdays() {
    const container = document.getElementById("upcomingBirthdaysList");
    if (!container) return;

    const birthdays = INITIAL_DATA.birthdays || [];
    if (birthdays.length === 0) {
      container.innerHTML = `<div class="text-muted small text-center py-3">No upcoming birthdays.</div>`;
      return;
    }

    container.innerHTML = birthdays.map(b => `
      <div class="d-flex align-items-center gap-3 py-2 border-bottom">
        <div class="rounded-circle bg-warning-subtle d-flex align-items-center justify-content-center flex-shrink-0"
            style="width:34px;height:34px;">
          <i class="bi bi-cake2 text-warning"></i>
        </div>
        <div class="flex-grow-1">
          <div class="small fw-semibold text-dark">${b.name}</div>
          <div class="text-muted" style="font-size:0.72rem;">${b.department} &nbsp;·&nbsp; ${b.date}</div>
        </div>
        <span class="badge ${b.daysLeft === 'Passed' ? 'bg-secondary' : 'bg-warning text-dark'} ms-auto"
            style="font-size:0.65rem;">${b.daysLeft}</span>
      </div>`).join("");
  },

  // =========================================================
  //  EMPLOYEE SECTIONS
  // =========================================================
  _renderEmployeeSection(section, user) {
    const empId = user.employeeId;
    const emp   = empId ? Store.getEmployeeById(empId) : null;

    // Show/hide employee dashboard section
    const dashEl = document.getElementById("sectionDashboard");
    const sections = document.querySelectorAll(".app-section");
    sections.forEach(el => el.classList.add("d-none"));
    if (dashEl) dashEl.classList.remove("d-none");

    // Build the employee-specific content in the dashboard
    const contentEl = document.getElementById("employeeDashboardContent");
    if (!contentEl) return;

    switch (section) {
      case "dashboard":
        this._renderEmployeeDashboard(emp, user, contentEl);
        break;
      case "myprofile":
        this._renderMyProfile(emp, contentEl);
        break;
      case "myattendance":
        this._renderMyAttendance(emp, contentEl);
        break;
      case "myleaves":
        this._renderMyLeaves(emp, contentEl);
        break;
      case "mysalary":
        this._renderMySalary(emp, contentEl);
        break;
      case "mypayslips":
        this._renderMyPayslips(emp, contentEl);
        break;
      case "myidcard":
        if (emp && window.IdCardGenerator) {
          contentEl.innerHTML = `
            <div class="d-flex justify-content-center py-3">
              <button class="btn btn-primary btn-lg" onclick="IdCardGenerator.openIdCardModal('${emp.id}')">
                <i class="bi bi-person-badge-fill me-2"></i>Open My ID Card
              </button>
            </div>`;
          setTimeout(() => IdCardGenerator.openIdCardModal(emp.id), 200);
        }
        break;
      default:
        this._renderEmployeeDashboard(emp, user, contentEl);
    }
  },

  _renderEmployeeDashboard(emp, user, container) {
    if (!emp) {
      container.innerHTML = `<div class="alert alert-warning">Employee profile not found.</div>`;
      return;
    }

    const struct    = Store.getSalaryStructureForEmployee(emp.id);
    const attStats  = Store.getMonthlyAttendanceStats(emp.id, 2026, 11);
    const leaveBal  = Store.getEmployeeLeaveBalances(emp.id);
    const payslips  = Store.getPayrollRecords().filter(r => r.employeeId === emp.id);
    const latestPay = payslips.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      return months.indexOf(b.month) - months.indexOf(a.month);
    })[0];

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    container.innerHTML = `
      <!-- Greeting -->
      <div class="row g-4 mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">
            <div class="card-body d-flex align-items-center gap-4 py-4">
              <img src="${emp.photo || ''}" alt="${emp.fullName}"
                class="rounded-circle border border-3 border-white shadow flex-shrink-0"
                style="width:68px;height:68px;object-fit:cover;"
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=1d4ed8&color=fff&size=68'">
              <div class="text-white">
                <h4 class="fw-bold mb-1">${greeting}, ${emp.fullName.split(" ")[0]}! 👋</h4>
                <div class="opacity-75 small">${emp.designation} &nbsp;·&nbsp; ${emp.department}</div>
                <div class="opacity-75 small">${emp.id} &nbsp;·&nbsp; Since ${emp.joiningDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-primary fs-2 fw-bold">${attStats.present}</div>
            <div class="text-muted small">Days Present</div>
            <div class="text-muted" style="font-size:0.70rem;">November 2026</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-success fs-2 fw-bold">${attStats.attendancePercentage}%</div>
            <div class="text-muted small">Attendance Rate</div>
            <div class="text-muted" style="font-size:0.70rem;">This month</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-info fs-2 fw-bold">${leaveBal.casual.balance + leaveBal.sick.balance + leaveBal.earned.balance}</div>
            <div class="text-muted small">Leave Balance</div>
            <div class="text-muted" style="font-size:0.70rem;">Total days left</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-success fs-2 fw-bold" style="font-size:1.3rem !important;">${Store.formatINR(latestPay ? latestPay.netSalary : struct.netSalary)}</div>
            <div class="text-muted small">Latest Net Pay</div>
            <div class="text-muted" style="font-size:0.70rem;">${latestPay ? latestPay.monthYear : "No payslip yet"}</div>
          </div>
        </div>
      </div>

      <!-- Leave Balances & Quick Actions -->
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent fw-semibold border-bottom">
              <i class="bi bi-calendar3 me-2 text-primary"></i>Leave Balances
            </div>
            <div class="card-body">
              ${this._leaveBalanceRow("Casual Leave", leaveBal.casual, "primary")}
              ${this._leaveBalanceRow("Sick Leave",   leaveBal.sick,   "info")}
              ${this._leaveBalanceRow("Earned Leave", leaveBal.earned, "success")}
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent fw-semibold border-bottom">
              <i class="bi bi-receipt me-2 text-success"></i>Latest Payslip
            </div>
            <div class="card-body">
              ${latestPay ? `
                <div class="d-flex justify-content-between border-bottom py-1 small">
                  <span class="text-muted">Month</span>
                  <span class="fw-medium">${latestPay.monthYear}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom py-1 small">
                  <span class="text-muted">Gross Salary</span>
                  <span class="fw-medium">${Store.formatINR(latestPay.grossSalary)}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom py-1 small">
                  <span class="text-muted">Total Deductions</span>
                  <span class="text-danger">${Store.formatINR(latestPay.totalDeductions)}</span>
                </div>
                <div class="d-flex justify-content-between py-1 small fw-bold">
                  <span>Net Salary</span>
                  <span class="text-success">${Store.formatINR(latestPay.netSalary)}</span>
                </div>
                <div class="mt-2 text-center">
                  <span class="badge ${latestPay.status === 'Paid' ? 'bg-success' : latestPay.status === 'Approved' ? 'bg-primary' : 'bg-secondary'}">
                    ${latestPay.status}
                  </span>
                </div>
                ${window.PayslipGenerator ? `
                  <button class="btn btn-outline-primary btn-sm w-100 mt-3"
                      onclick="PayslipGenerator.openPayslipModal('${latestPay.id}')">
                    <i class="bi bi-eye me-1"></i>View Payslip
                  </button>` : ""}
              ` : `<div class="text-muted small text-center py-3">No payslip records available yet.</div>`}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row g-3">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent fw-semibold border-bottom">
              <i class="bi bi-lightning-charge me-2 text-warning"></i>Quick Actions
            </div>
            <div class="card-body d-flex flex-wrap gap-2">
              <button class="btn btn-primary" onclick="App.navigateTo('myleaves')">
                <i class="bi bi-calendar-plus me-2"></i>Apply for Leave
              </button>
              <button class="btn btn-outline-primary" onclick="App.navigateTo('mypayslips')">
                <i class="bi bi-receipt me-2"></i>View All Payslips
              </button>
              <button class="btn btn-outline-secondary" onclick="App.navigateTo('myidcard')">
                <i class="bi bi-person-badge me-2"></i>View ID Card
              </button>
              <button class="btn btn-outline-info" onclick="App.navigateTo('myattendance')">
                <i class="bi bi-clock-history me-2"></i>My Attendance
              </button>
              <button class="btn btn-outline-success" onclick="App.navigateTo('mysalary')">
                <i class="bi bi-currency-rupee me-2"></i>Salary Details
              </button>
            </div>
          </div>
        </div>
      </div>`;
  },

  _leaveBalanceRow(label, bal, color) {
    const pct = bal.total > 0 ? Math.round((bal.balance / bal.total) * 100) : 0;
    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between small mb-1">
          <span class="fw-medium">${label}</span>
          <span class="text-muted">${bal.balance} / ${bal.total} days left</span>
        </div>
        <div class="progress" style="height:6px;">
          <div class="progress-bar bg-${color}" style="width:${pct}%;"></div>
        </div>
      </div>`;
  },

  _renderMyProfile(emp, container) {
    if (!emp) { container.innerHTML = `<div class="alert alert-warning">Profile not found.</div>`; return; }

    const struct = Store.getSalaryStructureForEmployee(emp.id);
    container.innerHTML = `
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body d-flex gap-4 align-items-center py-4"
            style="background: linear-gradient(135deg,#f0f4ff,#fff);">
          <img src="${emp.photo || ''}" class="rounded-circle border shadow"
              style="width:80px;height:80px;object-fit:cover;"
              onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=2563eb&color=fff&size=80'">
          <div>
            <h4 class="fw-bold mb-1">${emp.fullName}</h4>
            <div class="text-muted small">${emp.designation} &nbsp;·&nbsp; ${emp.department}</div>
            <div class="text-muted small">${emp.id} &nbsp;·&nbsp; <span class="badge bg-success">Active</span></div>
          </div>
        </div>
      </div>
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent fw-semibold border-bottom">
              <i class="bi bi-info-circle me-2 text-primary"></i>Personal Information
            </div>
            <div class="card-body">
              ${this._profileRow("Email",        emp.email)}
              ${this._profileRow("Mobile",       emp.mobile)}
              ${this._profileRow("Gender",       emp.gender)}
              ${this._profileRow("Date of Birth",emp.dob)}
              ${this._profileRow("Blood Group",  emp.bloodGroup)}
              ${this._profileRow("Address",      emp.address)}
              ${this._profileRow("Joining Date", emp.joiningDate)}
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent fw-semibold border-bottom">
              <i class="bi bi-bank me-2 text-success"></i>Banking Details
            </div>
            <div class="card-body">
              ${this._profileRow("Bank Account", emp.bankAccount)}
              ${this._profileRow("Bank Name",    emp.bankName)}
              ${this._profileRow("IFSC Code",    emp.ifscCode)}
              ${this._profileRow("PAN",          emp.pan)}
              ${this._profileRow("UAN",          emp.uan)}
            </div>
          </div>
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent fw-semibold border-bottom">
              <i class="bi bi-currency-rupee me-2 text-warning"></i>Salary Overview
            </div>
            <div class="card-body">
              ${this._profileRow("Basic Salary",   Store.formatINR(struct.basicSalary))}
              ${this._profileRow("Gross Salary",   Store.formatINR(struct.grossSalary))}
              ${this._profileRow("Deductions",     Store.formatINR(struct.totalDeductions))}
              ${this._profileRow("Net Salary",     Store.formatINR(struct.netSalary), true)}
            </div>
          </div>
        </div>
      </div>`;
  },

  _profileRow(label, value, highlight = false) {
    return `
      <div class="d-flex justify-content-between border-bottom py-2 small">
        <span class="text-muted fw-medium">${label}</span>
        <span class="${highlight ? 'fw-bold text-success' : 'text-dark'}">${value || "—"}</span>
      </div>`;
  },

  _renderMyAttendance(emp, container) {
    if (!emp) { container.innerHTML = `<div class="alert alert-warning">Profile not found.</div>`; return; }

    const stats = Store.getMonthlyAttendanceStats(emp.id, 2026, 11);
    const attendanceData = Store.getAttendanceData();
    const empAttendance  = attendanceData[emp.id] || {};

    // Build calendar days
    const daysInMonth = 30; // November
    const firstDay    = new Date(2026, 10, 1).getDay(); // 0=Sun
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `2026-11-${String(d).padStart(2, "0")}`;
      days.push({ day: d, status: empAttendance[dateStr] || "Upcoming", dateStr });
    }

    const statusColor = s => {
      const map = { "Present": "#dcfce7", "Absent": "#fee2e2", "Half Day": "#fef9c3",
                    "On Leave": "#dbeafe", "Weekly Off": "#f1f5f9", "Upcoming": "#f8fafc" };
      return map[s] || "#f8fafc";
    };
    const statusText = s => {
      const map = { "Present": "#16a34a", "Absent": "#dc2626", "Half Day": "#ca8a04",
                    "On Leave": "#2563eb", "Weekly Off": "#94a3b8", "Upcoming": "#cbd5e1" };
      return map[s] || "#64748b";
    };

    container.innerHTML = `
      <h5 class="fw-bold mb-4"><i class="bi bi-clock-history me-2 text-primary"></i>My Attendance — November 2026</h5>
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-success fs-3 fw-bold">${stats.present}</div>
            <div class="text-muted small">Present</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-danger fs-3 fw-bold">${stats.absent}</div>
            <div class="text-muted small">Absent</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-warning fs-3 fw-bold">${stats.halfDay}</div>
            <div class="text-muted small">Half Days</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-primary fs-3 fw-bold">${stats.attendancePercentage}%</div>
            <div class="text-muted small">Rate</div>
          </div>
        </div>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent fw-semibold border-bottom">
          <i class="bi bi-calendar3 me-2"></i>November 2026 Calendar
        </div>
        <div class="card-body">
          <div class="d-grid" style="grid-template-columns: repeat(7, 1fr); gap: 4px;">
            ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d =>
              `<div class="text-center text-muted fw-semibold small py-1">${d}</div>`).join("")}
            ${days.map(d => d
              ? `<div class="text-center rounded-2 py-2 px-1"
                      style="background:${statusColor(d.status)};cursor:default;"
                      title="${d.dateStr}: ${d.status}">
                    <div class="fw-medium" style="color:${statusText(d.status)};font-size:0.85rem;">${d.day}</div>
                    <div style="font-size:0.55rem;color:${statusText(d.status)};white-space:nowrap;overflow:hidden;">${d.status === "Weekly Off" ? "Off" : d.status.length > 7 ? d.status.substring(0,5)+"…" : d.status}</div>
                  </div>`
              : `<div></div>`
            ).join("")}
          </div>
          <div class="d-flex flex-wrap gap-3 mt-3 justify-content-center small">
            ${[["Present","#dcfce7","#16a34a"],["Absent","#fee2e2","#dc2626"],["Half Day","#fef9c3","#ca8a04"],
               ["On Leave","#dbeafe","#2563eb"],["Weekly Off","#f1f5f9","#94a3b8"]].map(([s,bg,c]) =>
              `<div class="d-flex align-items-center gap-1">
                <div class="rounded-1 border" style="width:14px;height:14px;background:${bg};border-color:${c}!important;"></div>
                <span style="color:${c};">${s}</span>
              </div>`).join("")}
          </div>
        </div>
      </div>`;
  },

  _renderMyLeaves(emp, container) {
    if (!emp) { container.innerHTML = `<div class="alert alert-warning">Profile not found.</div>`; return; }

    const myLeaves  = Store.getLeaves().filter(l => l.employeeId === emp.id);
    const leaveBal  = Store.getEmployeeLeaveBalances(emp.id);
    const pending   = myLeaves.filter(l => l.status === "Pending").length;

    const statusBadge = s => {
      const map = { Pending: "warning text-dark", Approved: "success", Rejected: "danger" };
      return `<span class="badge bg-${map[s] || 'secondary'}">${s}</span>`;
    };

    const rows = myLeaves.length > 0
      ? myLeaves.map(l => `
          <tr>
            <td class="fw-medium">${l.id}</td>
            <td>${l.leaveType}</td>
            <td>${l.startDate}</td>
            <td>${l.endDate}</td>
            <td class="text-center">${l.days}</td>
            <td class="text-center">${statusBadge(l.status)}</td>
            <td class="text-muted small">${l.reason || "—"}</td>
          </tr>`).join("")
      : `<tr><td colspan="7" class="text-center py-4 text-muted">No leave applications found.</td></tr>`;

    container.innerHTML = `
      <h5 class="fw-bold mb-4"><i class="bi bi-calendar-x me-2 text-primary"></i>My Leaves</h5>
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-primary fs-3 fw-bold">${leaveBal.casual.balance}</div>
            <div class="text-muted small">Casual Leave</div>
            <div class="text-muted" style="font-size:0.7rem;">of ${leaveBal.casual.total} days</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-info fs-3 fw-bold">${leaveBal.sick.balance}</div>
            <div class="text-muted small">Sick Leave</div>
            <div class="text-muted" style="font-size:0.7rem;">of ${leaveBal.sick.total} days</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-success fs-3 fw-bold">${leaveBal.earned.balance}</div>
            <div class="text-muted small">Earned Leave</div>
            <div class="text-muted" style="font-size:0.7rem;">of ${leaveBal.earned.total} days</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center p-3">
            <div class="text-warning fs-3 fw-bold">${pending}</div>
            <div class="text-muted small">Pending Requests</div>
          </div>
        </div>
      </div>
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent fw-semibold border-bottom d-flex justify-content-between align-items-center">
          <span><i class="bi bi-list-ul me-2 text-primary"></i>Leave History</span>
          <button class="btn btn-primary btn-sm" onclick="App._showApplyLeaveForm('${emp.id}')">
            <i class="bi bi-plus-circle me-1"></i>Apply Leave
          </button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle small mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th><th>Type</th><th>From</th><th>To</th>
                  <th class="text-center">Days</th><th class="text-center">Status</th><th>Reason</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  },

  _showApplyLeaveForm(empId) {
    // Delegate to LeaveManager if available
    if (window.LeaveManager && LeaveManager.openApplyLeaveModal) {
      LeaveManager.openApplyLeaveModal(empId);
    } else {
      this.showToast("Leave application module not loaded.", "warning");
    }
  },

  _renderMySalary(emp, container) {
    if (!emp) { container.innerHTML = `<div class="alert alert-warning">Profile not found.</div>`; return; }

    const struct = Store.getSalaryStructureForEmployee(emp.id);
    container.innerHTML = `
      <h5 class="fw-bold mb-4"><i class="bi bi-currency-rupee me-2 text-success"></i>My Salary Structure</h5>
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-success text-white fw-semibold border-0">
              <i class="bi bi-plus-circle me-2"></i>Earnings
            </div>
            <div class="card-body">
              ${this._salaryRow("Basic Salary", struct.basicSalary)}
              ${this._salaryRow("HRA (40% of Basic)", struct.hra)}
              ${this._salaryRow("DA (12% of Basic)", struct.da)}
              ${this._salaryRow("Conveyance Allowance", struct.conveyance)}
              ${this._salaryRow("Medical Allowance", struct.medical)}
              ${this._salaryRow("Other Allowances (8%)", struct.otherAllowances)}
              <div class="d-flex justify-content-between pt-2 mt-1 border-top fw-bold">
                <span class="text-success">Gross Salary</span>
                <span class="text-success">${Store.formatINR(struct.grossSalary)}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-danger text-white fw-semibold border-0">
              <i class="bi bi-dash-circle me-2"></i>Deductions
            </div>
            <div class="card-body">
              ${this._salaryRow("Provident Fund (12%)", struct.pf, true)}
              ${this._salaryRow("Professional Tax", struct.professionalTax, true)}
              ${this._salaryRow("TDS (5%)", struct.tds, true)}
              ${this._salaryRow("Other Deductions", struct.otherDeductions || 0, true)}
              <div class="d-flex justify-content-between pt-2 mt-1 border-top fw-bold">
                <span class="text-danger">Total Deductions</span>
                <span class="text-danger">${Store.formatINR(struct.totalDeductions)}</span>
              </div>
            </div>
          </div>
          <div class="card border-0 shadow-sm mt-3 border-success">
            <div class="card-body d-flex justify-content-between align-items-center py-4">
              <div>
                <div class="text-muted small">Monthly Net Salary</div>
                <div class="fw-bold fs-4 text-success">${Store.formatINR(struct.netSalary)}</div>
              </div>
              <div class="rounded-circle bg-success-subtle d-flex align-items-center justify-content-center"
                  style="width:56px;height:56px;">
                <i class="bi bi-currency-rupee text-success fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  },

  _salaryRow(label, amount, isDed = false) {
    return `
      <div class="d-flex justify-content-between border-bottom py-2 small">
        <span class="text-muted">${label}</span>
        <span class="${isDed ? 'text-danger' : 'text-dark'} fw-medium">${Store.formatINR(amount)}</span>
      </div>`;
  },

  _renderMyPayslips(emp, container) {
    if (!emp) { container.innerHTML = `<div class="alert alert-warning">Profile not found.</div>`; return; }

    if (window.PayslipGenerator && PayslipGenerator.renderEmployeePayslips) {
      container.innerHTML = `<h5 class="fw-bold mb-4"><i class="bi bi-receipt me-2 text-primary"></i>My Payslips</h5>
        <div id="employeePayslipsContainer"></div>`;
      PayslipGenerator.renderEmployeePayslips(emp.id);
      return;
    }

    const payslips = Store.getPayrollRecords()
      .filter(r => r.employeeId === emp.id)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        return months.indexOf(b.month) - months.indexOf(a.month);
      });

    if (payslips.length === 0) {
      container.innerHTML = `<h5 class="fw-bold mb-4">My Payslips</h5>
        <div class="text-center py-5 text-muted"><i class="bi bi-receipt fs-1 d-block mb-2"></i>No payslips available.</div>`;
      return;
    }

    const rows = payslips.map(p => `
      <tr>
        <td class="fw-medium">${p.monthYear}</td>
        <td class="text-end">${Store.formatINR(p.grossSalary)}</td>
        <td class="text-end text-danger">${Store.formatINR(p.totalDeductions)}</td>
        <td class="text-end fw-bold text-success">${Store.formatINR(p.netSalary)}</td>
        <td class="text-center">
          <span class="badge bg-${p.status === 'Paid' ? 'success' : p.status === 'Approved' ? 'primary' : 'secondary'}">
            ${p.status}
          </span>
        </td>
        <td class="text-center">
          ${window.PayslipGenerator
            ? `<button class="btn btn-outline-primary btn-sm" onclick="PayslipGenerator.openPayslipModal('${p.id}')">
                <i class="bi bi-eye me-1"></i>View
               </button>`
            : "—"}
        </td>
      </tr>`).join("");

    container.innerHTML = `
      <h5 class="fw-bold mb-4"><i class="bi bi-receipt me-2 text-primary"></i>My Payslips</h5>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle small mb-0">
              <thead class="table-dark">
                <tr>
                  <th>Period</th><th class="text-end">Gross</th>
                  <th class="text-end">Deductions</th><th class="text-end">Net</th>
                  <th class="text-center">Status</th><th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  },

  // =========================================================
  //  TOAST NOTIFICATIONS
  // =========================================================
  showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container position-fixed bottom-0 end-0 p-3";
      container.style.zIndex = "11000";
      document.body.appendChild(container);
    }

    const colorMap = {
      success: { bg: "text-bg-success",  icon: "bi-check-circle-fill" },
      danger:  { bg: "text-bg-danger",   icon: "bi-x-circle-fill" },
      warning: { bg: "text-bg-warning",  icon: "bi-exclamation-triangle-fill" },
      info:    { bg: "text-bg-info",     icon: "bi-info-circle-fill" }
    };
    const cfg = colorMap[type] || colorMap.info;

    const toastId = `toast_${Date.now()}`;
    const toastEl = document.createElement("div");
    toastEl.id    = toastId;
    toastEl.className = `toast align-items-center ${cfg.bg} border-0`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${cfg.icon}"></i>
          <span>${message}</span>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"
            data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;

    container.appendChild(toastEl);

    const bsToast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3500 });
    bsToast.show();

    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  },

  // =========================================================
  //  DEMO CONTROLS
  // =========================================================
  switchRole(role) {
    const res = Auth.quickLogin(role);
    if (res && res.success) {
      this.showToast(`Switched to ${role.toUpperCase()} view`, "info");
      setTimeout(() => window.location.reload(), 300);
    }
  },

  resetDemoData() {
    if (confirm("Reset demo data back to default initial state? All modifications will be cleared.")) {
      Store.resetToDefaults();
      this.showToast("Demo data successfully restored to defaults!", "success");
      setTimeout(() => window.location.reload(), 500);
    }
  },

  // =========================================================
  //  LOGOUT
  // =========================================================
  logout() {
    this.showToast("Logging out…", "info");
    setTimeout(() => Auth.logout(), 600);
  },

  // =========================================================
  //  UTILITY
  // =========================================================
  _setTextContent(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
};

// =========================================================
//  ENTRY POINT
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
