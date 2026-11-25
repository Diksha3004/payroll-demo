/**
 * Payroll Management System - Reports Manager Module
 * Generates various payroll, attendance, salary, and department reports
 * with PDF and Excel export capabilities.
 */

const ReportsManager = {
  currentReportTitle: "",

  init() {
    this.renderLandingPage();
    this.bindEvents();
  },

  renderLandingPage() {
    const output = document.getElementById("reportOutput");
    if (!output) return;

    output.innerHTML = `
      <div class="text-center py-5 my-3">
        <div class="mb-4">
          <i class="bi bi-file-earmark-bar-graph" style="font-size: 4rem; color: #cbd5e1;"></i>
        </div>
        <h4 class="fw-semibold text-muted">No Report Generated Yet</h4>
        <p class="text-muted mb-4" style="max-width: 400px; margin: 0 auto;">
          Select a report type from the options above and click the corresponding 
          Generate button to view your report here.
        </p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
            <i class="bi bi-calendar3 me-1"></i> Monthly Payroll
          </span>
          <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
            <i class="bi bi-graph-up me-1"></i> Annual Summary
          </span>
          <span class="badge bg-info-subtle text-info border border-info-subtle px-3 py-2">
            <i class="bi bi-people me-1"></i> Employee Salary
          </span>
          <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2">
            <i class="bi bi-diagram-3 me-1"></i> Department
          </span>
          <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2">
            <i class="bi bi-clock-history me-1"></i> Attendance
          </span>
          <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
            <i class="bi bi-calendar-x me-1"></i> Leave
          </span>
        </div>
      </div>`;

    this.toggleExportButtons(false);
  },

  bindEvents() {
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn.bind(this));
    };

    bind("generateMonthlyBtn",    () => this.generateMonthlyPayrollReport());
    bind("generateAnnualBtn",     () => this.generateAnnualPayrollReport());
    bind("generateEmpSalaryBtn",  () => this.generateEmployeeSalaryReport());
    bind("generateDeptBtn",       () => this.generateDepartmentReport());
    bind("generateAttendanceBtn", () => this.generateAttendanceReport());
    bind("generateLeaveBtn",      () => this.generateLeaveReport());
    bind("exportPdfBtn",          () => this.exportToPDF(this.currentReportTitle));
    bind("exportExcelBtn",        () => this.exportToExcel(this.currentReportTitle));
  },

  toggleExportButtons(enabled) {
    ["exportPdfBtn", "exportExcelBtn"].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = !enabled;
    });
  },

  setReportOutput(title, html) {
    this.currentReportTitle = title;
    const output = document.getElementById("reportOutput");
    if (!output) return;
    output.innerHTML = html;
    this.toggleExportButtons(true);
  },

  // =========================================================
  //  1. MONTHLY PAYROLL REPORT
  // =========================================================
  generateMonthlyPayrollReport() {
    const monthSel = document.getElementById("monthReportSelect");
    const yearSel  = document.getElementById("yearReportSelect");
    const month    = monthSel ? monthSel.value : "November";
    const year     = yearSel  ? parseInt(yearSel.value, 10) : 2026;

    const records  = Store.getPayrollRecords().filter(
      r => r.month === month && r.year === year
    );

    const title = `Monthly Payroll Report — ${month} ${year}`;

    if (records.length === 0) {
      this.setReportOutput(title, `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          No payroll records found for <strong>${month} ${year}</strong>.<br>
          Please generate payroll from the Payroll Processing section first.
        </div>`);
      return;
    }

    const totalGross  = records.reduce((s, r) => s + r.grossSalary, 0);
    const totalDed    = records.reduce((s, r) => s + r.totalDeductions, 0);
    const totalNet    = records.reduce((s, r) => s + r.netSalary, 0);

    const statusBadge = s => {
      const map = { Draft: "secondary", Approved: "primary", Paid: "success" };
      return `<span class="badge bg-${map[s] || 'secondary'}">${s}</span>`;
    };

    const rows = records.map(r => `
      <tr>
        <td class="fw-medium text-primary">${r.employeeId}</td>
        <td>${r.employeeName}</td>
        <td><span class="badge bg-light text-dark border">${r.department}</span></td>
        <td class="text-end">${Store.formatINR(r.grossSalary)}</td>
        <td class="text-end text-danger">${Store.formatINR(r.totalDeductions)}</td>
        <td class="text-end fw-semibold text-success">${Store.formatINR(r.netSalary)}</td>
        <td class="text-center">${statusBadge(r.status)}</td>
      </tr>`).join("");

    this.setReportOutput(title, `
      <div class="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 class="fw-bold mb-0">${title}</h5>
          <small class="text-muted">Generated: ${new Date().toLocaleString("en-IN")}</small>
        </div>
        <span class="badge bg-primary fs-6">${records.length} Employees</span>
      </div>
      <div class="row g-3 mb-4">
        ${this._summaryCard("Total Gross", Store.formatINR(totalGross), "primary", "bi-cash-stack")}
        ${this._summaryCard("Total Deductions", Store.formatINR(totalDed), "danger", "bi-dash-circle")}
        ${this._summaryCard("Total Net Payable", Store.formatINR(totalNet), "success", "bi-check-circle")}
      </div>
      <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle small" id="reportTable">
          <thead class="table-dark">
            <tr>
              <th>Emp ID</th><th>Name</th><th>Department</th>
              <th class="text-end">Gross Salary</th>
              <th class="text-end">Deductions</th>
              <th class="text-end">Net Salary</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot class="table-secondary fw-bold">
            <tr>
              <td colspan="3">TOTAL (${records.length} Employees)</td>
              <td class="text-end">${Store.formatINR(totalGross)}</td>
              <td class="text-end text-danger">${Store.formatINR(totalDed)}</td>
              <td class="text-end text-success">${Store.formatINR(totalNet)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>`);

    if (window.App) App.showToast(`Monthly Payroll Report for ${month} ${year} generated.`, "success");
  },

  // =========================================================
  //  2. ANNUAL PAYROLL REPORT
  // =========================================================
  generateAnnualPayrollReport() {
    const title = "Annual Payroll Report — FY 2026";

    const records = Store.getPayrollRecords();
    const monthOrder = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    // Group by month-year
    const grouped = {};
    records.forEach(r => {
      const key = `${r.month} ${r.year}`;
      if (!grouped[key]) {
        grouped[key] = { month: r.month, year: r.year, employees: 0, gross: 0, deductions: 0, net: 0, status: r.status };
      }
      grouped[key].employees++;
      grouped[key].gross      += r.grossSalary;
      grouped[key].deductions += r.totalDeductions;
      grouped[key].net        += r.netSalary;
      // escalate status: Paid > Approved > Draft
      const rank = { Paid: 3, Approved: 2, Draft: 1 };
      if ((rank[r.status] || 0) > (rank[grouped[key].status] || 0)) {
        grouped[key].status = r.status;
      }
    });

    // Sort by month order then year
    const rows = Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    if (rows.length === 0) {
      this.setReportOutput(title, `<div class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No payroll records found.</div>`);
      return;
    }

    const totalGross  = rows.reduce((s, r) => s + r.gross, 0);
    const totalDed    = rows.reduce((s, r) => s + r.deductions, 0);
    const totalNet    = rows.reduce((s, r) => s + r.net, 0);

    const statusBadge = s => {
      const map = { Draft: "secondary", Approved: "primary", Paid: "success" };
      return `<span class="badge bg-${map[s] || 'secondary'}">${s}</span>`;
    };

    const tableRows = rows.map(r => `
      <tr>
        <td class="fw-medium">${r.month} ${r.year}</td>
        <td class="text-center">${r.employees}</td>
        <td class="text-end">${Store.formatINR(r.gross)}</td>
        <td class="text-end text-danger">${Store.formatINR(r.deductions)}</td>
        <td class="text-end fw-semibold text-success">${Store.formatINR(r.net)}</td>
        <td class="text-center">${statusBadge(r.status)}</td>
      </tr>`).join("");

    this.setReportOutput(title, `
      <div class="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 class="fw-bold mb-0">${title}</h5>
          <small class="text-muted">Generated: ${new Date().toLocaleString("en-IN")}</small>
        </div>
        <span class="badge bg-dark fs-6">${rows.length} Months</span>
      </div>
      <div class="row g-3 mb-4">
        ${this._summaryCard("Annual Gross", Store.formatINR(totalGross), "primary", "bi-graph-up")}
        ${this._summaryCard("Annual Deductions", Store.formatINR(totalDed), "danger", "bi-dash-circle")}
        ${this._summaryCard("Annual Net Paid", Store.formatINR(totalNet), "success", "bi-currency-rupee")}
      </div>
      <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle small" id="reportTable">
          <thead class="table-dark">
            <tr>
              <th>Month</th>
              <th class="text-center">Employees</th>
              <th class="text-end">Gross Payroll</th>
              <th class="text-end">Total Deductions</th>
              <th class="text-end">Net Disbursed</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
          <tfoot class="table-secondary fw-bold">
            <tr>
              <td>TOTAL</td><td></td>
              <td class="text-end">${Store.formatINR(totalGross)}</td>
              <td class="text-end text-danger">${Store.formatINR(totalDed)}</td>
              <td class="text-end text-success">${Store.formatINR(totalNet)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>`);

    if (window.App) App.showToast("Annual Payroll Report generated.", "success");
  },

  // =========================================================
  //  3. EMPLOYEE SALARY STRUCTURE REPORT
  // =========================================================
  generateEmployeeSalaryReport() {
    const title = "Employee Salary Structure Report";
    const employees   = Store.getEmployees();
    const structures  = Store.getSalaryStructures();

    if (employees.length === 0) {
      this.setReportOutput(title, `<div class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No employee data.</div>`);
      return;
    }

    const totalGross = employees.reduce((s, e) => {
      const st = structures[e.id] || Store.computeDefaultSalaryStructure(e.basicSalary);
      return s + st.grossSalary;
    }, 0);

    const totalNet = employees.reduce((s, e) => {
      const st = structures[e.id] || Store.computeDefaultSalaryStructure(e.basicSalary);
      return s + st.netSalary;
    }, 0);

    const rows = employees.map(e => {
      const st = structures[e.id] || Store.computeDefaultSalaryStructure(e.basicSalary);
      return `
        <tr>
          <td class="fw-medium text-primary">${e.id}</td>
          <td>${e.fullName}</td>
          <td><span class="badge bg-light text-dark border">${e.department}</span></td>
          <td class="text-end">${Store.formatINR(st.basicSalary)}</td>
          <td class="text-end">${Store.formatINR(st.hra)}</td>
          <td class="text-end">${Store.formatINR(st.da)}</td>
          <td class="text-end">${Store.formatINR(st.conveyance)}</td>
          <td class="text-end">${Store.formatINR(st.medical)}</td>
          <td class="text-end fw-semibold">${Store.formatINR(st.grossSalary)}</td>
          <td class="text-end text-danger">${Store.formatINR(st.pf)}</td>
          <td class="text-end text-danger">${Store.formatINR(st.professionalTax)}</td>
          <td class="text-end text-danger">${Store.formatINR(st.tds)}</td>
          <td class="text-end fw-bold text-success">${Store.formatINR(st.netSalary)}</td>
        </tr>`;
    }).join("");

    this.setReportOutput(title, `
      <div class="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 class="fw-bold mb-0">${title}</h5>
          <small class="text-muted">Generated: ${new Date().toLocaleString("en-IN")} &nbsp;|&nbsp; ${employees.length} Employees</small>
        </div>
      </div>
      <div class="row g-3 mb-4">
        ${this._summaryCard("Total Employees", employees.length, "info", "bi-people")}
        ${this._summaryCard("Total Monthly Gross", Store.formatINR(totalGross), "primary", "bi-cash-stack")}
        ${this._summaryCard("Total Monthly Net", Store.formatINR(totalNet), "success", "bi-currency-rupee")}
      </div>
      <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle small" id="reportTable">
          <thead class="table-dark" style="font-size:0.75rem;">
            <tr>
              <th>Emp ID</th><th>Name</th><th>Dept</th>
              <th class="text-end">Basic</th><th class="text-end">HRA</th><th class="text-end">DA</th>
              <th class="text-end">Conv.</th><th class="text-end">Medical</th>
              <th class="text-end">Gross</th>
              <th class="text-end">PF</th><th class="text-end">P.Tax</th><th class="text-end">TDS</th>
              <th class="text-end">Net</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot class="table-secondary fw-bold">
            <tr>
              <td colspan="8">TOTAL (${employees.length} Employees)</td>
              <td class="text-end">${Store.formatINR(totalGross)}</td>
              <td colspan="3"></td>
              <td class="text-end text-success">${Store.formatINR(totalNet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>`);

    if (window.App) App.showToast("Employee Salary Report generated.", "success");
  },

  // =========================================================
  //  4. DEPARTMENT REPORT
  // =========================================================
  generateDepartmentReport() {
    const title = "Department-Wise Payroll Report";
    const employees  = Store.getEmployees();
    const structures = Store.getSalaryStructures();
    const depts      = Store.getDepartments();

    // Group employees by department
    const deptMap = {};
    depts.forEach(d => {
      deptMap[d.name] = { name: d.name, head: d.head, headcount: 0, grossPayroll: 0, netPayroll: 0, active: 0, onLeave: 0 };
    });

    employees.forEach(e => {
      if (!deptMap[e.department]) {
        deptMap[e.department] = { name: e.department, head: "—", headcount: 0, grossPayroll: 0, netPayroll: 0, active: 0, onLeave: 0 };
      }
      const st = structures[e.id] || Store.computeDefaultSalaryStructure(e.basicSalary);
      deptMap[e.department].headcount++;
      deptMap[e.department].grossPayroll += st.grossSalary;
      deptMap[e.department].netPayroll   += st.netSalary;
      if (e.employmentStatus === "Active")   deptMap[e.department].active++;
      if (e.employmentStatus === "On Leave") deptMap[e.department].onLeave++;
    });

    const deptList = Object.values(deptMap).filter(d => d.headcount > 0)
      .sort((a, b) => b.grossPayroll - a.grossPayroll);

    if (deptList.length === 0) {
      this.setReportOutput(title, `<div class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No department data.</div>`);
      return;
    }

    const totalGross = deptList.reduce((s, d) => s + d.grossPayroll, 0);
    const totalNet   = deptList.reduce((s, d) => s + d.netPayroll, 0);
    const totalEmp   = deptList.reduce((s, d) => s + d.headcount, 0);

    const rows = deptList.map(d => `
      <tr>
        <td class="fw-semibold">${d.name}</td>
        <td>${d.head}</td>
        <td class="text-center"><span class="badge bg-primary">${d.headcount}</span></td>
        <td class="text-center"><span class="text-success">${d.active}</span></td>
        <td class="text-center"><span class="text-warning">${d.onLeave}</span></td>
        <td class="text-end fw-medium">${Store.formatINR(d.grossPayroll)}</td>
        <td class="text-end fw-semibold text-success">${Store.formatINR(d.netPayroll)}</td>
        <td class="text-end text-muted">
          ${totalGross > 0 ? ((d.grossPayroll / totalGross) * 100).toFixed(1) : 0}%
        </td>
      </tr>`).join("");

    this.setReportOutput(title, `
      <div class="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 class="fw-bold mb-0">${title}</h5>
          <small class="text-muted">Generated: ${new Date().toLocaleString("en-IN")} &nbsp;|&nbsp; ${deptList.length} Departments</small>
        </div>
      </div>
      <div class="row g-3 mb-4">
        ${this._summaryCard("Departments", deptList.length, "info", "bi-diagram-3")}
        ${this._summaryCard("Total Employees", totalEmp, "secondary", "bi-people")}
        ${this._summaryCard("Total Gross Payroll", Store.formatINR(totalGross), "primary", "bi-cash-stack")}
        ${this._summaryCard("Total Net Payroll", Store.formatINR(totalNet), "success", "bi-currency-rupee")}
      </div>
      <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle small" id="reportTable">
          <thead class="table-dark">
            <tr>
              <th>Department</th><th>Head</th>
              <th class="text-center">Headcount</th>
              <th class="text-center">Active</th>
              <th class="text-center">On Leave</th>
              <th class="text-end">Gross Payroll</th>
              <th class="text-end">Net Payroll</th>
              <th class="text-end">% Share</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot class="table-secondary fw-bold">
            <tr>
              <td colspan="2">TOTAL</td>
              <td class="text-center">${totalEmp}</td>
              <td colspan="2"></td>
              <td class="text-end">${Store.formatINR(totalGross)}</td>
              <td class="text-end text-success">${Store.formatINR(totalNet)}</td>
              <td class="text-end">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>`);

    if (window.App) App.showToast("Department Report generated.", "success");
  },

  // =========================================================
  //  5. ATTENDANCE REPORT (November 2026)
  // =========================================================
  generateAttendanceReport() {
    const title = "Attendance Report — November 2026";
    const employees = Store.getEmployees();

    if (employees.length === 0) {
      this.setReportOutput(title, `<div class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No employee data.</div>`);
      return;
    }

    let totalPresent = 0, totalAbsent = 0, totalHalfDay = 0;

    const rows = employees.map(e => {
      const stats = Store.getMonthlyAttendanceStats(e.id, 2026, 11);
      totalPresent += stats.present;
      totalAbsent  += stats.absent;
      totalHalfDay += stats.halfDay;

      const rateBadge = stats.attendancePercentage >= 90
        ? `<span class="badge bg-success">${stats.attendancePercentage}%</span>`
        : stats.attendancePercentage >= 75
        ? `<span class="badge bg-warning text-dark">${stats.attendancePercentage}%</span>`
        : `<span class="badge bg-danger">${stats.attendancePercentage}%</span>`;

      return `
        <tr>
          <td class="fw-medium text-primary">${e.id}</td>
          <td>${e.fullName}</td>
          <td><span class="badge bg-light text-dark border">${e.department}</span></td>
          <td class="text-center">${stats.totalWorkingDays}</td>
          <td class="text-center text-success fw-medium">${stats.present}</td>
          <td class="text-center text-danger">${stats.absent}</td>
          <td class="text-center text-warning">${stats.halfDay}</td>
          <td class="text-center text-info">${stats.onLeave}</td>
          <td class="text-center">${rateBadge}</td>
        </tr>`;
    }).join("");

    const avgRate = employees.length > 0
      ? Math.round(employees.reduce((s, e) => {
          return s + Store.getMonthlyAttendanceStats(e.id, 2026, 11).attendancePercentage;
        }, 0) / employees.length)
      : 0;

    this.setReportOutput(title, `
      <div class="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 class="fw-bold mb-0">${title}</h5>
          <small class="text-muted">Generated: ${new Date().toLocaleString("en-IN")} &nbsp;|&nbsp; ${employees.length} Employees</small>
        </div>
      </div>
      <div class="row g-3 mb-4">
        ${this._summaryCard("Avg Attendance Rate", `${avgRate}%`, "success", "bi-person-check")}
        ${this._summaryCard("Total Present Days", totalPresent, "primary", "bi-check-circle")}
        ${this._summaryCard("Total Absent Days", totalAbsent, "danger", "bi-x-circle")}
        ${this._summaryCard("Total Half Days", totalHalfDay, "warning", "bi-clock-history")}
      </div>
      <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle small" id="reportTable">
          <thead class="table-dark">
            <tr>
              <th>Emp ID</th><th>Name</th><th>Department</th>
              <th class="text-center">Working Days</th>
              <th class="text-center">Present</th>
              <th class="text-center">Absent</th>
              <th class="text-center">Half Day</th>
              <th class="text-center">On Leave</th>
              <th class="text-center">Rate</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`);

    if (window.App) App.showToast("Attendance Report for November 2026 generated.", "success");
  },

  // =========================================================
  //  6. LEAVE REPORT
  // =========================================================
  generateLeaveReport() {
    const title = "Leave Applications Report";
    const leaves = Store.getLeaves();

    if (leaves.length === 0) {
      this.setReportOutput(title, `<div class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No leave applications found.</div>`);
      return;
    }

    const pending  = leaves.filter(l => l.status === "Pending").length;
    const approved = leaves.filter(l => l.status === "Approved").length;
    const rejected = leaves.filter(l => l.status === "Rejected").length;

    const statusBadge = s => {
      const map = { Pending: "warning text-dark", Approved: "success", Rejected: "danger" };
      return `<span class="badge bg-${map[s] || 'secondary'}">${s}</span>`;
    };

    const rows = leaves.map(l => `
      <tr>
        <td class="fw-medium text-primary">${l.id}</td>
        <td>${l.employeeName}</td>
        <td><span class="badge bg-light text-dark border">${l.department}</span></td>
        <td>${l.leaveType}</td>
        <td>${l.startDate}</td>
        <td>${l.endDate}</td>
        <td class="text-center">${l.days}</td>
        <td class="text-center">${statusBadge(l.status)}</td>
        <td>${l.reviewedBy || "—"}</td>
        <td class="text-muted" style="max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
            title="${l.reason || ''}">${l.reason || "—"}</td>
      </tr>`).join("");

    this.setReportOutput(title, `
      <div class="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 class="fw-bold mb-0">${title}</h5>
          <small class="text-muted">Generated: ${new Date().toLocaleString("en-IN")} &nbsp;|&nbsp; ${leaves.length} Applications</small>
        </div>
      </div>
      <div class="row g-3 mb-4">
        ${this._summaryCard("Total Applications", leaves.length, "info", "bi-file-earmark-text")}
        ${this._summaryCard("Pending", pending, "warning", "bi-clock")}
        ${this._summaryCard("Approved", approved, "success", "bi-check-circle")}
        ${this._summaryCard("Rejected", rejected, "danger", "bi-x-circle")}
      </div>
      <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle small" id="reportTable">
          <thead class="table-dark">
            <tr>
              <th>Leave ID</th><th>Employee</th><th>Department</th><th>Type</th>
              <th>Start Date</th><th>End Date</th><th class="text-center">Days</th>
              <th class="text-center">Status</th><th>Reviewed By</th><th>Reason</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`);

    if (window.App) App.showToast("Leave Report generated.", "success");
  },

  // =========================================================
  //  EXPORT: PDF
  // =========================================================
  exportToPDF(title) {
    if (!window.html2pdf) {
      if (window.App) App.showToast("PDF library not loaded. Please check CDN link.", "danger");
      return;
    }

    const element = document.getElementById("reportOutput");
    if (!element) return;

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `${title.replace(/[^a-z0-9]/gi, "_")}.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: "in", format: "a4", orientation: "landscape" }
    };

    if (window.App) App.showToast("Generating PDF, please wait…", "info");
    html2pdf().set(opt).from(element).save();
  },

  // =========================================================
  //  EXPORT: Excel (SheetJS)
  // =========================================================
  exportToExcel(title) {
    if (!window.XLSX) {
      if (window.App) App.showToast("Excel library (SheetJS) not loaded.", "danger");
      return;
    }

    const output = document.getElementById("reportOutput");
    if (!output) return;

    const table = output.querySelector("table");
    if (!table) {
      if (window.App) App.showToast("No table data to export.", "warning");
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);

    // Auto-width columns
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      let maxLen = 10;
      for (let R = range.s.r; R <= range.e.r; R++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v) {
          const len = String(cell.v).length;
          if (len > maxLen) maxLen = len;
        }
      }
      colWidths.push({ wch: Math.min(maxLen + 2, 30) });
    }
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const filename = `${title.replace(/[^a-z0-9]/gi, "_")}.xlsx`;
    XLSX.writeFile(wb, filename);

    if (window.App) App.showToast("Excel file downloaded.", "success");
  },

  // =========================================================
  //  HELPER: Summary card HTML
  // =========================================================
  _summaryCard(label, value, color, icon) {
    return `
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body d-flex align-items-center gap-3 p-3">
            <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style="width:42px;height:42px;background:var(--bs-${color}-bg-subtle,rgba(13,110,253,.1));">
              <i class="bi ${icon} text-${color} fs-5"></i>
            </div>
            <div class="overflow-hidden">
              <div class="small text-muted text-truncate">${label}</div>
              <div class="fw-bold fs-6 text-${color} text-truncate">${value}</div>
            </div>
          </div>
        </div>
      </div>`;
  }
};
