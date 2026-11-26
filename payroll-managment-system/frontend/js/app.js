/**
 * PaySync Pro — Main Application Controller (app.js)
 * Coordinates authentication, view routing, sidebar, navbar, and dashboard.
 */

const App = {
  // ─────────────────────────────────────────────────────────────
  // 1. INITIALIZATION & BOOTSTRAP
  // ─────────────────────────────────────────────────────────────
  init() {
    Store.init();

    // Bind login form events
    this._bindAuthEvents();

    const currentUser = Auth.getCurrentUser();
    if (currentUser) {
      this._showMainApp(currentUser);
    } else {
      this._showLoginScreen();
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 2. AUTHENTICATION & LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────
  _showLoginScreen() {
    const loginEl = document.getElementById("loginScreen");
    const mainEl  = document.getElementById("mainApp");

    if (loginEl) {
      loginEl.classList.remove("d-none");
      loginEl.style.display = "flex";
    }
    if (mainEl) {
      mainEl.classList.add("d-none");
      mainEl.style.display = "none";
    }
  },

  _bindAuthEvents() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm && !loginForm.dataset.bound) {
      loginForm.dataset.bound = "true";
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername")?.value.trim();
        const password = document.getElementById("loginPassword")?.value;
        const result = Auth.login(username, password);

        if (result && result.success) {
          this.init();
        } else {
          this._showLoginError(result?.message || "Invalid username or password.");
        }
      });
    }

    // Bind quick login buttons if present by ID
    ["admin", "hr", "employee"].forEach(role => {
      const btn = document.getElementById(`quickLogin_${role}`);
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = "true";
        btn.addEventListener("click", () => this.quickLogin(role));
      }
    });
  },

  _showLoginError(msg) {
    const errEl = document.getElementById("loginError");
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove("d-none");
      setTimeout(() => errEl.classList.add("d-none"), 4000);
    }
  },

  quickLogin(role) {
    const res = Auth.quickLogin(role);
    if (res && res.success) {
      this.init();
    }
  },

  switchRole(role) {
    const res = Auth.quickLogin(role);
    if (res && res.success) {
      this.init();
      this.showToast(`Switched view to ${role.toUpperCase()}`, "info");
    }
  },

  resetDemoData() {
    if (confirm("Reset all demo data back to default initial state? All your additions/changes will be restored.")) {
      Store.resetToDefaults();
      this.init();
      this.showToast("Demo data successfully restored to defaults!", "success");
    }
  },

  logout() {
    Auth.logout();
    this.init();
    this.showToast("Logged out successfully.", "info");
  },

  // ─────────────────────────────────────────────────────────────
  // 3. MAIN APPLICATION SHELL
  // ─────────────────────────────────────────────────────────────
  _showMainApp(user) {
    const loginEl = document.getElementById("loginScreen");
    const mainEl  = document.getElementById("mainApp");

    if (loginEl) {
      loginEl.classList.add("d-none");
      loginEl.style.display = "none";
    }
    if (mainEl) {
      mainEl.classList.remove("d-none");
      mainEl.style.display = "block";
    }

    // Render User Details in Navbar & Sidebar
    this._renderUserUI(user);

    // Render Sidebar Navigation
    this.renderSidebar(user);

    // Navigate to default view
    this.navigateTo("dashboard");
  },

  _renderUserUI(user) {
    const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=2563eb&color=fff&size=40`;

    // Top Navbar
    const topAvatar = document.getElementById("topNavUserAvatar");
    const topName   = document.getElementById("topNavUserName");
    const topRole   = document.getElementById("topNavUserRole");
    const topDesig  = document.getElementById("topNavUserDesignation");

    if (topAvatar) topAvatar.src = avatar;
    if (topName)   topName.textContent = user.fullName;
    if (topRole)   topRole.textContent = user.role.toUpperCase();
    if (topDesig)  topDesig.textContent = user.designation || `${user.role.toUpperCase()} Access`;

    // Sidebar Footer
    const sideAvatar = document.getElementById("sidebarUserAvatar");
    const sideName   = document.getElementById("sidebarUserName");
    const sideRole   = document.getElementById("sidebarUserRole");

    if (sideAvatar) sideAvatar.src = avatar;
    if (sideName)   sideName.textContent = user.fullName;
    if (sideRole)   sideRole.textContent = user.role.toUpperCase();
  },

  // ─────────────────────────────────────────────────────────────
  // 4. SIDEBAR RENDERING
  // ─────────────────────────────────────────────────────────────
  renderSidebar(user) {
    const navContainer = document.getElementById("sidebarNav");
    if (!navContainer) return;

    const isAdmin    = user.role === "admin";
    const isHR       = user.role === "hr";
    const isEmployee = user.role === "employee";

    let menuSections = [];

    if (isAdmin || isHR) {
      menuSections = [
        {
          title: "CORE",
          items: [
            { id: "dashboard",   label: "Dashboard",       icon: "bi-speedometer2" },
            { id: "employees",   label: "Employees",       icon: "bi-people-fill" },
            ...(isAdmin ? [{ id: "departments", label: "Departments", icon: "bi-diagram-3-fill" }] : [])
          ]
        },
        {
          title: "MANAGEMENT",
          items: [
            { id: "attendance",  label: "Attendance",      icon: "bi-clock-history" },
            { id: "leaves",      label: "Leaves",          icon: "bi-calendar-x-fill" },
            { id: "salary",      label: "Salary Structure",icon: "bi-currency-rupee" }
          ]
        },
        {
          title: "FINANCE & TOOLS",
          items: [
            { id: "payroll",     label: "Process Payroll", icon: "bi-credit-card-2-front" },
            { id: "reports",     label: "Reports & Export",icon: "bi-file-earmark-bar-graph-fill" },
            { id: "idcards",     label: "ID Cards (QR)",   icon: "bi-person-badge-fill" }
          ]
        }
      ];
    } else if (isEmployee) {
      menuSections = [
        {
          title: "MY PORTAL",
          items: [
            { id: "dashboard",   label: "Overview",        icon: "bi-house-fill" },
            { id: "profile",     label: "My Profile",      icon: "bi-person-circle" },
            { id: "myPayslips",  label: "My Payslips",     icon: "bi-receipt" },
            { id: "myIdCard",    label: "My ID Card",      icon: "bi-person-badge-fill" }
          ]
        }
      ];
    }

    let html = "";
    menuSections.forEach(sec => {
      html += `<div class="sidebar-section-title">${sec.title}</div>`;
      sec.items.forEach(item => {
        html += `
          <button class="sidebar-nav-item" id="nav-${item.id}" onclick="App.navigateTo('${item.id}')">
            <i class="bi ${item.icon} nav-icon"></i>
            <span class="nav-label">${item.label}</span>
          </button>
        `;
      });
    });

    navContainer.innerHTML = html;
  },

  // ─────────────────────────────────────────────────────────────
  // 5. NAVIGATION & VIEW ROUTING
  // ─────────────────────────────────────────────────────────────
  navigateTo(section) {
    const user = Auth.getCurrentUser();
    if (!user) return;

    // 1. Hide all sections
    document.querySelectorAll(".section-page").forEach(sec => {
      sec.classList.remove("active");
    });

    // 2. Remove active state from all sidebar items
    document.querySelectorAll(".sidebar-nav-item").forEach(btn => {
      btn.classList.remove("active");
    });

    // 3. Show target section
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // 4. Set active state on sidebar item
    const targetNav = document.getElementById(`nav-${section}`);
    if (targetNav) {
      targetNav.classList.add("active");
    }

    // 5. Update top navbar title
    const titleEl = document.getElementById("topNavTitle");
    if (titleEl) {
      const titles = {
        dashboard: "Dashboard",
        employees: "Employees Directory",
        departments: "Departments & Headcount",
        attendance: "Monthly Attendance",
        leaves: "Leave Management",
        salary: "Salary Structures & Deductions",
        payroll: "Payroll Processing Wizard",
        reports: "Payroll Reports & Analytics",
        idcards: "Employee ID Cards",
        profile: "My Profile",
        myPayslips: "My Payslips",
        myIdCard: "My ID Card"
      };
      titleEl.innerHTML = `${titles[section] || "Dashboard"} <span id="topNavSubtitle"></span>`;
    }

    // 6. Close sidebar on mobile
    this.closeSidebar();

    // 7. Initialize target view controller
    this._initSectionModule(section, user);
  },

  _initSectionModule(section, user) {
    switch (section) {
      case "dashboard":
        this.renderDashboard(user);
        break;

      case "employees":
        if (window.EmployeeManager) EmployeeManager.init();
        break;

      case "departments":
        if (window.DepartmentManager) DepartmentManager.init();
        break;

      case "attendance":
        if (window.AttendanceManager) AttendanceManager.init();
        break;

      case "leaves":
        if (window.LeaveManager) LeaveManager.init();
        break;

      case "salary":
        if (window.SalaryManager) SalaryManager.init();
        break;

      case "payroll":
        if (window.PayrollProcessor) PayrollProcessor.init();
        break;

      case "reports":
        if (window.ReportsManager) ReportsManager.init();
        break;

      case "idcards":
        if (window.IdCardGenerator) IdCardGenerator.renderIdCardGrid("idCardGrid");
        break;

      case "profile":
        this.renderProfile(user);
        break;

      case "myPayslips":
        if (window.PayslipGenerator) {
          const empId = user.employeeId || "EMP-1001";
          PayslipGenerator.renderEmployeePayslips(empId, "myPayslipsTableBody");
        }
        break;

      case "myIdCard":
        if (window.IdCardGenerator) {
          const empId = user.employeeId || "EMP-1001";
          const container = document.getElementById("myIdCardContainer");
          if (container) {
            container.innerHTML = `
              <div class="d-flex flex-column align-items-center py-4">
                <div class="mb-4" style="max-width:380px;">
                  ${IdCardGenerator.buildCardHTML ? IdCardGenerator.buildCardHTML(Store.getEmployeeById(empId)) : '<div class="alert alert-info">ID Card ready for download</div>'}
                </div>
                <button class="btn btn-primary px-4 py-2" onclick="IdCardGenerator.downloadIdCard('${empId}')">
                  <i class="bi bi-download me-2"></i>Download ID Card (PDF)
                </button>
              </div>
            `;
          }
        }
        break;
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 6. DASHBOARD RENDERING
  // ─────────────────────────────────────────────────────────────
  renderDashboard(user) {
    const adminStatsRow     = document.getElementById("adminStatsRow");
    const adminChartsRow    = document.getElementById("adminChartsRow");
    const adminRecentPay    = document.getElementById("adminRecentPayroll");
    const employeeDashboard = document.getElementById("employeeDashboard");

    const greetingEl = document.getElementById("dashGreeting");
    const subtitleEl = document.getElementById("dashSubtitle");
    const dateEl     = document.getElementById("dashDate");

    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });
    }

    if (user.role === "admin" || user.role === "hr") {
      // Show Admin Dashboard Panels
      if (adminStatsRow)     adminStatsRow.classList.remove("d-none");
      if (adminChartsRow)    adminChartsRow.classList.remove("d-none");
      if (adminRecentPay)    adminRecentPay.classList.remove("d-none");
      if (employeeDashboard) employeeDashboard.classList.add("d-none");

      if (greetingEl) greetingEl.textContent = `Good Day, ${user.fullName.split(" ")[0]}! 👋`;
      if (subtitleEl) subtitleEl.textContent = "Here's your organization payroll & operations overview";

      // Calculate Stats
      const employees = Store.getEmployees();
      const leaves    = Store.getLeaves();
      const depts     = Store.getDepartments();
      const payroll   = Store.getPayrollRecords();

      const activeCount  = employees.filter(e => e.employmentStatus === "Active").length;
      const onLeaveCount = employees.filter(e => e.employmentStatus === "On Leave").length;

      // Current month payroll sum
      const currentMonthRecords = payroll.filter(r => r.month === "November" && r.year === 2026);
      const totalMonthlyNet = currentMonthRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);
      const pendingPayrollCount = payroll.filter(r => r.status === "Draft" || r.status === "Pending").length;

      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setTxt("statTotalEmp", employees.length);
      setTxt("statActiveEmp", activeCount);
      setTxt("statOnLeave", onLeaveCount);
      setTxt("statMonthlyPayroll", totalMonthlyNet > 0 ? Store.formatINR(totalMonthlyNet) : "₹18,45,200");
      setTxt("statPendingPayroll", pendingPayrollCount > 0 ? `${pendingPayrollCount} Batches` : "₹0");
      setTxt("statDepts", depts.length);

      // Pending Leaves Badge
      const pendingLeaves = leaves.filter(l => l.status === "Pending");
      setTxt("dashPendingLeaves", `${pendingLeaves.length} Pending`);

      // Initialize Charts
      if (window.Charts && typeof Charts.initDashboardCharts === "function") {
        setTimeout(() => Charts.initDashboardCharts(), 50);
      }

      // Recent Payroll Table
      const recentBody = document.getElementById("dashRecentPayrollBody");
      if (recentBody) {
        const recentRecords = payroll.slice(-5).reverse();
        if (recentRecords.length > 0) {
          recentBody.innerHTML = recentRecords.map(r => `
            <tr>
              <td><strong>${r.employeeName || r.employeeId}</strong></td>
              <td><span class="badge bg-light text-dark">${r.department || "General"}</span></td>
              <td>${r.month} ${r.year}</td>
              <td>${Store.formatINR(r.grossSalary || 0)}</td>
              <td class="fw-bold text-success">${Store.formatINR(r.netSalary || 0)}</td>
              <td><span class="badge bg-${r.status === 'Paid' ? 'success' : (r.status === 'Approved' ? 'primary' : 'warning')}">${r.status}</span></td>
            </tr>
          `).join("");
        }
      }

    } else {
      // Show Employee Dashboard
      if (adminStatsRow)     adminStatsRow.classList.add("d-none");
      if (adminChartsRow)    adminChartsRow.classList.add("d-none");
      if (adminRecentPay)    adminRecentPay.classList.add("d-none");
      if (employeeDashboard) employeeDashboard.classList.remove("d-none");

      if (greetingEl) greetingEl.textContent = `Welcome back, ${user.fullName}!`;
      if (subtitleEl) subtitleEl.textContent = "Employee Self-Service (ESS) Portal";

      const emp = Store.getEmployeeById(user.employeeId || "EMP-1001") || Store.getEmployees()[0];
      if (emp) {
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        };

        setVal("empDashName", emp.fullName);
        setVal("empDashDesig", emp.designation);
        setVal("empDashDept", emp.department);

        const photo = document.getElementById("empDashPhoto");
        if (photo) photo.src = emp.photo || user.avatar;

        // Balances
        setVal("empDashClBal", `${emp.leaveBalance?.cl || 4} Days`);
        setVal("empDashSlBal", `${emp.leaveBalance?.sl || 6} Days`);
        setVal("empDashElBal", `${emp.leaveBalance?.el || 12} Days`);

        // Salary Info
        const struct = Store.getSalaryStructureForEmployee(emp.id);
        if (struct) {
          setVal("empDashSalaryInfo", `${Store.formatINR(struct.gross)} / month`);
        }
      }
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 7. PROFILE RENDERING
  // ─────────────────────────────────────────────────────────────
  renderProfile(user) {
    const emp = Store.getEmployeeById(user.employeeId || "EMP-1001") || Store.getEmployees()[0];
    if (!emp) return;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || "—";
    };

    const avatar = document.getElementById("profileModalAvatar");
    if (avatar) avatar.src = emp.photo || user.avatar;

    setTxt("profileModalName", emp.fullName);
    setTxt("profileModalDesignation", emp.designation);
    setTxt("profileModalDept", emp.department);
    setTxt("profileModalId", emp.id);
    setTxt("profileEmail", emp.email);
    setTxt("profileMobile", emp.mobile);
    setTxt("profileGender", emp.gender);
    setTxt("profileDob", emp.dob);
    setTxt("profileBlood", emp.bloodGroup);
    setTxt("profileJoiningDate", emp.joiningDate);
    setTxt("profileAddress", emp.address);

    // Banking
    setTxt("profileBankAcc", emp.banking?.accountNumber);
    setTxt("profileBankName", emp.banking?.bankName);
    setTxt("profileIfsc", emp.banking?.ifsc);
    setTxt("profilePan", emp.banking?.pan);
    setTxt("profileUan", emp.banking?.uan);

    // Salary Structure
    const struct = Store.getSalaryStructureForEmployee(emp.id);
    if (struct) {
      setTxt("profileBasic", Store.formatINR(struct.basic));
      setTxt("profileHra", Store.formatINR(struct.hra));
      setTxt("profileDa", Store.formatINR(struct.da));
      setTxt("profileGross", Store.formatINR(struct.gross));
      setTxt("profilePf", Store.formatINR(struct.pf));
      setTxt("profilePt", Store.formatINR(struct.professionalTax));
      setTxt("profileTds", Store.formatINR(struct.tds));
      setTxt("profileNet", Store.formatINR(struct.net));
    }

    // Leaves
    setTxt("profileClBal", emp.leaveBalance?.cl ?? "4");
    setTxt("profileSlBal", emp.leaveBalance?.sl ?? "6");
    setTxt("profileElBal", emp.leaveBalance?.el ?? "12");

    // ID Card Button
    const idCardBtn = document.getElementById("profileIdCardBtn");
    if (idCardBtn && window.IdCardGenerator) {
      idCardBtn.onclick = () => IdCardGenerator.openIdCardModal(emp.id);
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 8. SIDEBAR TOGGLE (Mobile & Desktop)
  // ─────────────────────────────────────────────────────────────
  toggleSidebar() {
    const sb = document.getElementById("sidebar");
    const bd = document.getElementById("sidebarBackdrop");
    if (sb) sb.classList.toggle("sidebar-open");
    if (bd) bd.classList.toggle("show");
  },

  closeSidebar() {
    const sb = document.getElementById("sidebar");
    const bd = document.getElementById("sidebarBackdrop");
    if (sb) sb.classList.remove("sidebar-open");
    if (bd) bd.classList.remove("show");
  },

  // ─────────────────────────────────────────────────────────────
  // 9. TOAST NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────
  showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container position-fixed bottom-0 end-0 p-3";
      container.style.zIndex = "11000";
      document.body.appendChild(container);
    }

    const toastId = "toast_" + Date.now();
    const bgMap = {
      success: "bg-success text-white",
      danger: "bg-danger text-white",
      warning: "bg-warning text-dark",
      info: "bg-primary text-white"
    };
    const toastBg = bgMap[type] || bgMap.info;

    const toastEl = document.createElement("div");
    toastEl.id = toastId;
    toastEl.className = `toast align-items-center ${toastBg} border-0 shadow`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body fw-medium">${message}</div>
        <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;

    container.appendChild(toastEl);

    if (window.bootstrap && bootstrap.Toast) {
      const bsToast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3200 });
      bsToast.show();
      toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    } else {
      setTimeout(() => toastEl.remove(), 3500);
    }
  }
};

// ─────────────────────────────────────────────────────────────
// 10. DOM READY ENTRY POINT
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
