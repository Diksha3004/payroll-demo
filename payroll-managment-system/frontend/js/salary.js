/**
 * Payroll Management System — Salary Manager
 * Handles salary structure display, editing, live calculation, and stat cards.
 */

const SalaryManager = (() => {
  // ─── State ───────────────────────────────────────────────────────────────
  let _bsModal = null;
  let _currentEmpId = null;

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function _val(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) || 0 : 0;
  }

  function _set(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function _getDeptOptions() {
    const employees = Store.getEmployees();
    const depts = [...new Set(employees.map(e => e.department))].sort();
    return depts;
  }

  // ─── Live Recalculation ───────────────────────────────────────────────────
  function calculateLive() {
    const basic       = _val('salaryModalBasic');
    const hra         = _val('salaryModalHra');
    const da          = _val('salaryModalDa');
    const conveyance  = _val('salaryModalConveyance');
    const medical     = _val('salaryModalMedical');
    const other       = _val('salaryModalOther');

    const gross = basic + hra + da + conveyance + medical + other;

    const pf  = _val('salaryModalPf');
    const pt  = _val('salaryModalPt');
    const tds = _val('salaryModalTds');

    const net = gross - pf - pt - tds;

    _set('salaryModalGross', gross.toFixed(0));
    _set('salaryModalNet', net.toFixed(0));

    // Update displayed labels if they exist
    const grossLabel = document.getElementById('salaryModalGrossLabel');
    const netLabel   = document.getElementById('salaryModalNetLabel');
    if (grossLabel) grossLabel.textContent = Store.formatINR(gross);
    if (netLabel)   netLabel.textContent   = Store.formatINR(net);
  }

  // Auto-fill HRA/DA/Other/PF/TDS when Basic changes
  function _autoFillFromBasic() {
    const basic = _val('salaryModalBasic');
    const rules = INITIAL_DATA.salaryRules;

    _set('salaryModalHra', Math.round(basic * rules.hraPercent));
    _set('salaryModalDa',  Math.round(basic * rules.daPercent));
    _set('salaryModalConveyance', rules.conveyanceFixed);
    _set('salaryModalMedical',    rules.medicalFixed);
    _set('salaryModalOther', Math.round(basic * rules.otherAllowancePercent));
    _set('salaryModalPf',  Math.round(basic * rules.pfPercent));
    _set('salaryModalPt',  rules.professionalTaxFixed);

    const gross = basic +
      Math.round(basic * rules.hraPercent) +
      Math.round(basic * rules.daPercent) +
      rules.conveyanceFixed +
      rules.medicalFixed +
      Math.round(basic * rules.otherAllowancePercent);

    _set('salaryModalTds', Math.round(gross * rules.tdsRate));
    calculateLive();
  }

  // ─── Open Edit Modal ──────────────────────────────────────────────────────
  function openEditModal(empId) {
    _currentEmpId = empId;

    const emp    = Store.getEmployeeById(empId);
    const struct = Store.getSalaryStructureForEmployee(empId);

    if (!emp) {
      App.showToast('Employee not found.', 'danger');
      return;
    }

    _set('salaryModalEmpId', empId);
    _set('salaryModalEmpName', emp.fullName);

    _set('salaryModalBasic',      struct.basicSalary);
    _set('salaryModalHra',        struct.hra);
    _set('salaryModalDa',         struct.da);
    _set('salaryModalConveyance', struct.conveyance);
    _set('salaryModalMedical',    struct.medical);
    _set('salaryModalOther',      struct.otherAllowances);
    _set('salaryModalGross',      struct.grossSalary);
    _set('salaryModalPf',         struct.pf);
    _set('salaryModalPt',         struct.professionalTax);
    _set('salaryModalTds',        struct.tds);
    _set('salaryModalOtherDed',   struct.otherDeductions);
    _set('salaryModalNet',        struct.netSalary);

    calculateLive();

    // Show Bootstrap modal
    if (!_bsModal) {
      const modalEl = document.getElementById('salaryModal');
      if (modalEl) {
        _bsModal = new bootstrap.Modal(modalEl);
      }
    }
    if (_bsModal) _bsModal.show();
  }

  // ─── Save Salary Structure ────────────────────────────────────────────────
  function _saveStructure() {
    if (!_currentEmpId) return;

    const basic      = _val('salaryModalBasic');
    const hra        = _val('salaryModalHra');
    const da         = _val('salaryModalDa');
    const conveyance = _val('salaryModalConveyance');
    const medical    = _val('salaryModalMedical');
    const other      = _val('salaryModalOther');
    const gross      = basic + hra + da + conveyance + medical + other;
    const pf         = _val('salaryModalPf');
    const pt         = _val('salaryModalPt');
    const tds        = _val('salaryModalTds');
    const otherDed   = _val('salaryModalOtherDed');
    const totalDed   = pf + pt + tds + otherDed;
    const net        = gross - totalDed;

    const structure = {
      basicSalary:      basic,
      hra,
      da,
      conveyance,
      medical,
      otherAllowances:  other,
      grossSalary:      gross,
      pf,
      professionalTax:  pt,
      tds,
      otherDeductions:  otherDed,
      totalDeductions:  totalDed,
      netSalary:        net
    };

    Store.saveSalaryStructure(_currentEmpId, structure);
    App.showToast(`Salary structure updated for ${document.getElementById('salaryModalEmpName')?.value || _currentEmpId}.`, 'success');

    if (_bsModal) _bsModal.hide();
    render(); // refresh table
  }

  // ─── Stat Cards ───────────────────────────────────────────────────────────
  function _updateStatCards(employees, structures) {
    let totalGross = 0;
    let totalNet   = 0;
    let totalDed   = 0;

    employees.forEach(emp => {
      const s = structures[emp.id] || Store.computeDefaultSalaryStructure(emp.basicSalary || 50000);
      totalGross += s.grossSalary   || 0;
      totalNet   += s.netSalary     || 0;
      totalDed   += s.totalDeductions || 0;
    });

    _setText('salaryStatGross',      Store.formatINR(totalGross));
    _setText('salaryStatNet',        Store.formatINR(totalNet));
    _setText('salaryStatDeductions', Store.formatINR(totalDed));
  }

  // ─── Populate Department Filter ───────────────────────────────────────────
  function _populateDeptFilter() {
    const select = document.getElementById('salaryFilterDept');
    if (!select) return;

    const currentVal = select.value;
    // Keep the first "All Departments" option
    while (select.options.length > 1) select.remove(1);

    _getDeptOptions().forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept;
      opt.textContent = dept;
      select.appendChild(opt);
    });

    if (currentVal) select.value = currentVal;
  }

  // ─── Build Table ──────────────────────────────────────────────────────────
  function _buildTable(employees, structures) {
    const tbody = document.getElementById('salaryTableBody');
    if (!tbody) return;

    if (employees.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="14" class="text-center text-muted py-4">
            <i class="bi bi-search fs-2 d-block mb-2"></i>No records found.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = employees.map(emp => {
      const s = structures[emp.id] || Store.computeDefaultSalaryStructure(emp.basicSalary || 50000);
      return `
        <tr>
          <td class="fw-semibold">${emp.id}</td>
          <td>${emp.fullName}</td>
          <td><span class="badge bg-secondary-subtle text-secondary">${emp.department}</span></td>
          <td class="text-end">${Store.formatINR(s.basicSalary)}</td>
          <td class="text-end">${Store.formatINR(s.hra)}</td>
          <td class="text-end">${Store.formatINR(s.da)}</td>
          <td class="text-end">${Store.formatINR(s.conveyance)}</td>
          <td class="text-end">${Store.formatINR(s.medical)}</td>
          <td class="text-end">${Store.formatINR(s.otherAllowances)}</td>
          <td class="text-end fw-bold text-success">${Store.formatINR(s.grossSalary)}</td>
          <td class="text-end text-danger">${Store.formatINR(s.pf)}</td>
          <td class="text-end text-danger">${Store.formatINR(s.professionalTax)}</td>
          <td class="text-end text-danger">${Store.formatINR(s.tds)}</td>
          <td class="text-end fw-bold text-primary">${Store.formatINR(s.netSalary)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="SalaryManager.openEditModal('${emp.id}')">
              <i class="bi bi-pencil-square"></i> Edit
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  // ─── Filter + Search Logic ────────────────────────────────────────────────
  function _getFilteredEmployees() {
    let employees  = Store.getEmployees().filter(e => e.employmentStatus !== 'Inactive');
    const deptEl   = document.getElementById('salaryFilterDept');
    const searchEl = document.getElementById('salarySearchInput');
    const dept     = deptEl   ? deptEl.value.trim()   : '';
    const query    = searchEl ? searchEl.value.trim().toLowerCase() : '';

    if (dept) {
      employees = employees.filter(e => e.department === dept);
    }
    if (query) {
      employees = employees.filter(e =>
        e.fullName.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query)
      );
    }
    return employees;
  }

  // ─── Event Binding ────────────────────────────────────────────────────────
  function _bindEvents() {
    // Filter / Search
    const deptFilter   = document.getElementById('salaryFilterDept');
    const searchInput  = document.getElementById('salarySearchInput');

    if (deptFilter)  deptFilter.addEventListener('change', render);
    if (searchInput) searchInput.addEventListener('input',  render);

    // Modal live-calc inputs — earnings
    const earningsIds = ['salaryModalBasic', 'salaryModalHra', 'salaryModalDa',
                         'salaryModalConveyance', 'salaryModalMedical', 'salaryModalOther'];
    const deductionIds = ['salaryModalPf', 'salaryModalPt', 'salaryModalTds', 'salaryModalOtherDed'];

    earningsIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => {
        if (id === 'salaryModalBasic') _autoFillFromBasic();
        else calculateLive();
      });
    });

    deductionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', calculateLive);
    });

    // Save button
    const form = document.getElementById('salaryForm');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        _saveStructure();
      });
    }

    // Reset modal reference when modal is hidden
    const modalEl = document.getElementById('salaryModal');
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        _currentEmpId = null;
      });
    }
  }

  // ─── Public: render ───────────────────────────────────────────────────────
  function render() {
    _populateDeptFilter();

    const structures = Store.getSalaryStructures();
    const allActiveEmployees = Store.getEmployees().filter(e => e.employmentStatus !== 'Inactive');
    const filteredEmployees  = _getFilteredEmployees();

    _updateStatCards(allActiveEmployees, structures);
    _buildTable(filteredEmployees, structures);
  }

  // ─── Public: init ─────────────────────────────────────────────────────────
  function init() {
    _bsModal = null; // reset so modal is re-initialized
    _bindEvents();
    render();
  }

  return { init, render, openEditModal, calculateLive };
})();
