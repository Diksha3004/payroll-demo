/**
 * Payroll Management System — Payroll Processor
 * Handles monthly payroll generation, approval, payment, and status management.
 */

const PayrollProcessor = (() => {
  // ─── State ───────────────────────────────────────────────────────────────
  let _currentMonth = null;
  let _currentYear  = null;
  let _currentRecords = [];

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function _statusBadge(status) {
    const map = {
      Draft:    'secondary',
      Approved: 'primary',
      Paid:     'success'
    };
    const color = map[status] || 'secondary';
    return `<span class="badge bg-${color} status-badge">${status}</span>`;
  }

  // ─── Populate Month / Year Selectors ─────────────────────────────────────
  function _populateSelectors() {
    const monthSel = document.getElementById('payrollMonthSelect');
    const yearSel  = document.getElementById('payrollYearSelect');

    if (monthSel && monthSel.options.length === 0) {
      MONTHS.forEach((m, i) => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        if (i === 10) opt.selected = true; // November (index 10) default
        monthSel.appendChild(opt);
      });
    }

    if (yearSel && yearSel.options.length === 0) {
      for (let y = 2024; y <= 2027; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === 2026) opt.selected = true; // 2026 default
        yearSel.appendChild(opt);
      }
    }
  }

  // ─── Stat Cards ───────────────────────────────────────────────────────────
  function _updateStatCards(records) {
    let totalGross = 0;
    let totalNet   = 0;
    let totalDed   = 0;

    records.forEach(r => {
      totalGross += r.grossSalary    || 0;
      totalNet   += r.netSalary      || 0;
      totalDed   += r.totalDeductions || 0;
    });

    _setText('payrollStatEmployees',  records.length);
    _setText('payrollStatGross',      Store.formatINR(totalGross));
    _setText('payrollStatNet',        Store.formatINR(totalNet));
    _setText('payrollStatDeductions', Store.formatINR(totalDed));
  }

  // ─── Build Result Table ───────────────────────────────────────────────────
  function _renderTable(records) {
    const tbody = document.getElementById('payrollResultTableBody');
    if (!tbody) return;

    if (!records || records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center text-muted py-4">
            <i class="bi bi-calculator fs-2 d-block mb-2"></i>
            No payroll records. Select a month and click <strong>Calculate Payroll</strong>.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr>
        <td class="fw-semibold">${r.employeeId}</td>
        <td>${r.employeeName}</td>
        <td><span class="badge bg-secondary-subtle text-secondary">${r.department}</span></td>
        <td class="text-center">${r.totalWorkingDays}</td>
        <td class="text-center">${r.presentDays}</td>
        <td class="text-end">${Store.formatINR(r.basicSalary)}</td>
        <td class="text-end">${Store.formatINR(r.totalAllowances)}</td>
        <td class="text-end fw-bold text-success">${Store.formatINR(r.grossSalary)}</td>
        <td class="text-end text-danger">${Store.formatINR(r.totalDeductions)}</td>
        <td class="text-end fw-bold text-primary">${Store.formatINR(r.netSalary)}</td>
        <td>${_statusBadge(r.status)}</td>
        <td>
          <button class="btn btn-sm btn-outline-info"
            onclick="typeof PayslipGenerator !== 'undefined' && PayslipGenerator.openPayslipModal('${r.id}')">
            <i class="bi bi-file-earmark-text"></i> Payslip
          </button>
        </td>
      </tr>`).join('');

    _updateStatCards(records);
  }

  // ─── Calculate Payroll ────────────────────────────────────────────────────
  function calculatePayroll() {
    const monthSel = document.getElementById('payrollMonthSelect');
    const yearSel  = document.getElementById('payrollYearSelect');

    if (!monthSel || !yearSel) return;

    const month = monthSel.value;
    const year  = parseInt(yearSel.value, 10);

    if (!month || !year) {
      App.showToast('Please select a valid month and year.', 'warning');
      return;
    }

    _currentMonth = month;
    _currentYear  = year;

    // Duplicate prevention
    const alreadyExists = Store.checkPayrollExists(month, year);
    if (alreadyExists) {
      App.showToast(
        `Payroll for ${month} ${year} already exists. Loading existing records.`,
        'warning'
      );
      // Load existing records instead
      _currentRecords = Store.getPayrollRecords().filter(
        r => r.month === month && r.year === year
      );
      _renderTable(_currentRecords);
      return;
    }

    // Generate fresh payroll
    const generated = Store.generateMonthlyPayroll(month, year);

    if (!generated || generated.length === 0) {
      App.showToast('No active employees found or payroll already generated.', 'info');
      // Try loading whatever was stored
      _currentRecords = Store.getPayrollRecords().filter(
        r => r.month === month && r.year === year
      );
      _renderTable(_currentRecords);
      return;
    }

    _currentRecords = generated;
    _renderTable(_currentRecords);
    App.showToast(
      `Payroll calculated for ${generated.length} employee(s) — ${month} ${year}.`,
      'success'
    );
  }

  // ─── Approve Payroll ──────────────────────────────────────────────────────
  function approvePayroll() {
    if (!_currentMonth || !_currentYear) {
      App.showToast('Please calculate payroll first.', 'warning');
      return;
    }

    // Check if any records are in Draft/Pending state
    const hasDraft = _currentRecords.some(
      r => r.status === 'Draft' || r.status === 'Pending'
    );
    if (!hasDraft) {
      App.showToast('No Draft records to approve for this period.', 'info');
      return;
    }

    const count = Store.approvePayroll(_currentMonth, _currentYear);

    if (count > 0) {
      // Update in-memory records
      _currentRecords = Store.getPayrollRecords().filter(
        r => r.month === _currentMonth && r.year === _currentYear
      );

      // Update badges in DOM without full re-render
      _updateBadgesInDOM('Draft',    'Approved');
      _updateBadgesInDOM('Pending',  'Approved');

      _updateStatCards(_currentRecords);
      App.showToast(`${count} payroll record(s) approved for ${_currentMonth} ${_currentYear}.`, 'success');
    } else {
      App.showToast('No eligible records to approve.', 'info');
    }
  }

  // ─── Mark As Paid ─────────────────────────────────────────────────────────
  function markAsPaid() {
    if (!_currentMonth || !_currentYear) {
      App.showToast('Please calculate payroll first.', 'warning');
      return;
    }

    const hasApproved = _currentRecords.some(r => r.status === 'Approved');
    if (!hasApproved) {
      App.showToast('No Approved records to mark as Paid. Please approve first.', 'warning');
      return;
    }

    const count = Store.markPayrollAsPaid(_currentMonth, _currentYear);

    if (count > 0) {
      _currentRecords = Store.getPayrollRecords().filter(
        r => r.month === _currentMonth && r.year === _currentYear
      );

      _updateBadgesInDOM('Approved', 'Paid');
      _updateStatCards(_currentRecords);
      App.showToast(`${count} record(s) marked as Paid for ${_currentMonth} ${_currentYear}.`, 'success');
    } else {
      App.showToast('No Approved records found to mark as Paid.', 'info');
    }
  }

  // ─── DOM Badge Update (without full re-render) ────────────────────────────
  function _updateBadgesInDOM(fromStatus, toStatus) {
    const tbody = document.getElementById('payrollResultTableBody');
    if (!tbody) return;

    const map = { Draft: 'secondary', Approved: 'primary', Paid: 'success' };
    const newColor = map[toStatus] || 'secondary';

    tbody.querySelectorAll('.status-badge').forEach(badge => {
      if (badge.textContent.trim() === fromStatus) {
        badge.textContent = toStatus;
        badge.className   = `badge bg-${newColor} status-badge`;
      }
    });
  }

  // ─── Event Binding ────────────────────────────────────────────────────────
  function _bindEvents() {
    const calcBtn    = document.getElementById('calculatePayrollBtn');
    const approveBtn = document.getElementById('approvePayrollBtn');
    const paidBtn    = document.getElementById('markAsPaidBtn');

    if (calcBtn)    calcBtn.addEventListener('click',    calculatePayroll);
    if (approveBtn) approveBtn.addEventListener('click', approvePayroll);
    if (paidBtn)    paidBtn.addEventListener('click',    markAsPaid);
  }

  // ─── Public: init ─────────────────────────────────────────────────────────
  function init() {
    _currentMonth   = null;
    _currentYear    = null;
    _currentRecords = [];

    _populateSelectors();
    _bindEvents();

    // Show empty state
    const tbody = document.getElementById('payrollResultTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center text-muted py-5">
            <i class="bi bi-calculator fs-2 d-block mb-2 text-primary"></i>
            Select a <strong>Month</strong> and <strong>Year</strong>, then click
            <strong>Calculate Payroll</strong> to begin.
          </td>
        </tr>`;
    }

    // Reset stat cards
    _setText('payrollStatEmployees',  '—');
    _setText('payrollStatGross',      '—');
    _setText('payrollStatNet',        '—');
    _setText('payrollStatDeductions', '—');
  }

  // ─── Public: render (alias for init when navigating back) ─────────────────
  function render() {
    _populateSelectors();
    // If we already have records loaded, re-render them
    if (_currentRecords.length > 0) {
      _renderTable(_currentRecords);
    }
  }

  return { init, render, calculatePayroll, approvePayroll, markAsPaid };
})();
