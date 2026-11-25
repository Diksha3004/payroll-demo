/**
 * Payroll Management System — PayslipGenerator Module
 * Handles professional payslip rendering, PDF download, and employee payslip history.
 */

const PayslipGenerator = (() => {

  /* ─────────────────────────── helpers ─────────────────────────── */

  function _statusBadge(status) {
    const map = {
      Paid: 'success',
      Approved: 'primary',
      Draft: 'secondary',
      Pending: 'warning'
    };
    const color = map[status] || 'secondary';
    return `<span class="badge bg-${color} px-3 py-2 fs-6">${status}</span>`;
  }

  function _row2(label1, val1, label2, val2, shade = false) {
    const bg = shade ? 'style="background:#f8f9fa"' : '';
    return `
      <tr ${bg}>
        <td class="fw-semibold text-muted" style="width:22%;padding:6px 10px">${label1}</td>
        <td style="padding:6px 10px">${val1 || '—'}</td>
        <td class="fw-semibold text-muted" style="width:22%;padding:6px 10px">${label2}</td>
        <td style="padding:6px 10px">${val2 || '—'}</td>
      </tr>`;
  }

  function _buildPayslipHTML(record, emp) {
    const fmt = Store.formatINR;
    const org = INITIAL_DATA.organization;

    const totalEarnings = record.grossSalary;
    const totalDeductions = record.totalDeductions;
    const net = record.netSalary;

    const joiningFmt = emp.joiningDate
      ? new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';

    return `
<div id="payslipContent" style="font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff;max-width:900px;margin:0 auto;border:1px solid #d0d7de;border-radius:8px;overflow:hidden">

  <!-- ══════════ HEADER ══════════ -->
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);color:#fff;padding:28px 32px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-size:1.45rem;font-weight:700;letter-spacing:0.5px">${org.name}</div>
      <div style="font-size:0.82rem;opacity:0.85;margin-top:4px">${org.address}</div>
      <div style="font-size:0.82rem;opacity:0.85">${org.phone} &nbsp;|&nbsp; ${org.email}</div>
    </div>
    <div style="text-align:right">
      <div style="background:rgba(255,255,255,0.18);border-radius:6px;padding:10px 18px">
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;opacity:0.85">Payslip For</div>
        <div style="font-size:1.3rem;font-weight:700;margin-top:2px">${record.monthYear}</div>
        <div style="font-size:0.78rem;opacity:0.8;margin-top:2px">Generated: ${record.generatedDate || new Date().toISOString().split('T')[0]}</div>
      </div>
    </div>
  </div>

  <div style="padding:0 32px 28px">

    <!-- ══════════ EMPLOYEE DETAILS ══════════ -->
    <div style="margin-top:22px;border:1px solid #e1e4e8;border-radius:6px;overflow:hidden">
      <div style="background:#f0f4ff;padding:8px 14px;font-weight:600;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.5px;color:#2563eb;border-bottom:1px solid #e1e4e8">
        Employee Information
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
        <tbody>
          ${_row2('Employee Name', emp.fullName, 'Employee ID', emp.id, false)}
          ${_row2('Department', emp.department, 'Designation', emp.designation, true)}
          ${_row2('Date of Joining', joiningFmt, 'Bank Account', emp.bankAccount ? `${emp.bankAccount} (${emp.bankName || ''})` : '—', false)}
          ${_row2('PAN Number', emp.pan, 'UAN Number', emp.uan, true)}
        </tbody>
      </table>
    </div>

    <!-- ══════════ ATTENDANCE ══════════ -->
    <div style="margin-top:16px;border:1px solid #e1e4e8;border-radius:6px;overflow:hidden">
      <div style="background:#f0f4ff;padding:8px 14px;font-weight:600;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.5px;color:#2563eb;border-bottom:1px solid #e1e4e8">
        Attendance Summary
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
        <tbody>
          <tr>
            <td class="fw-semibold text-muted" style="width:22%;padding:8px 10px;font-weight:600;color:#6c757d">Working Days</td>
            <td style="padding:8px 10px">${record.totalWorkingDays}</td>
            <td class="fw-semibold text-muted" style="width:22%;padding:8px 10px;font-weight:600;color:#6c757d">Present Days</td>
            <td style="padding:8px 10px">${record.presentDays}</td>
            <td class="fw-semibold text-muted" style="width:22%;padding:8px 10px;font-weight:600;color:#dc3545">LOP Days</td>
            <td style="padding:8px 10px;color:#dc3545;font-weight:600">${record.lopDays || 0}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ══════════ EARNINGS & DEDUCTIONS ══════════ -->
    <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:16px">

      <!-- EARNINGS -->
      <div style="border:1px solid #e1e4e8;border-radius:6px;overflow:hidden">
        <div style="background:#e8f5e9;padding:8px 14px;font-weight:600;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.5px;color:#1b5e20;border-bottom:1px solid #e1e4e8">
          Earnings
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.87rem">
          <thead>
            <tr style="background:#f8f9fa">
              <th style="padding:7px 12px;text-align:left;color:#555;font-weight:600">Component</th>
              <th style="padding:7px 12px;text-align:right;color:#555;font-weight:600">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding:6px 12px">Basic Salary</td><td style="padding:6px 12px;text-align:right">${fmt(record.basicSalary)}</td></tr>
            <tr style="background:#f8f9fa"><td style="padding:6px 12px">HRA</td><td style="padding:6px 12px;text-align:right">${fmt(record.hra)}</td></tr>
            <tr><td style="padding:6px 12px">Dearness Allowance (DA)</td><td style="padding:6px 12px;text-align:right">${fmt(record.da)}</td></tr>
            <tr style="background:#f8f9fa"><td style="padding:6px 12px">Conveyance</td><td style="padding:6px 12px;text-align:right">${fmt(record.conveyance)}</td></tr>
            <tr><td style="padding:6px 12px">Medical Allowance</td><td style="padding:6px 12px;text-align:right">${fmt(record.medical)}</td></tr>
            <tr style="background:#f8f9fa"><td style="padding:6px 12px">Other Allowances</td><td style="padding:6px 12px;text-align:right">${fmt(record.otherAllowances)}</td></tr>
            <tr style="border-top:2px solid #2e7d32;background:#e8f5e9">
              <td style="padding:9px 12px;font-weight:700;color:#1b5e20">Total Earnings</td>
              <td style="padding:9px 12px;text-align:right;font-weight:700;color:#1b5e20">${fmt(totalEarnings)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- DEDUCTIONS -->
      <div style="border:1px solid #e1e4e8;border-radius:6px;overflow:hidden">
        <div style="background:#fce4ec;padding:8px 14px;font-weight:600;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.5px;color:#880e4f;border-bottom:1px solid #e1e4e8">
          Deductions
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.87rem">
          <thead>
            <tr style="background:#f8f9fa">
              <th style="padding:7px 12px;text-align:left;color:#555;font-weight:600">Component</th>
              <th style="padding:7px 12px;text-align:right;color:#555;font-weight:600">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding:6px 12px">Provident Fund (PF)</td><td style="padding:6px 12px;text-align:right">${fmt(record.pf)}</td></tr>
            <tr style="background:#f8f9fa"><td style="padding:6px 12px">Professional Tax</td><td style="padding:6px 12px;text-align:right">${fmt(record.professionalTax)}</td></tr>
            <tr><td style="padding:6px 12px">TDS</td><td style="padding:6px 12px;text-align:right">${fmt(record.tds)}</td></tr>
            <tr style="background:#f8f9fa"><td style="padding:6px 12px">Other Deductions</td><td style="padding:6px 12px;text-align:right">${fmt(record.otherDeductions || 0)}</td></tr>
            <tr style="height:36px"><td colspan="2"></td></tr>
            <tr style="border-top:2px solid #c62828;background:#fce4ec">
              <td style="padding:9px 12px;font-weight:700;color:#880e4f">Total Deductions</td>
              <td style="padding:9px 12px;text-align:right;font-weight:700;color:#880e4f">${fmt(totalDeductions)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════ NET PAY FOOTER ══════════ -->
    <div style="margin-top:18px;background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);border-radius:8px;padding:20px 28px;color:#fff;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:0.8rem;opacity:0.8;text-transform:uppercase;letter-spacing:0.5px">Net Salary Payable</div>
        <div style="font-size:2rem;font-weight:800;margin-top:2px">${fmt(net)}</div>
        <div style="font-size:0.8rem;opacity:0.85;margin-top:4px;font-style:italic">${Store.numberToWordsINR(net)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:0.8rem;opacity:0.8;margin-bottom:6px">Payment Status</div>
        ${_statusBadge(record.status)}
        ${record.paymentReference ? `<div style="font-size:0.75rem;opacity:0.75;margin-top:6px">Ref: ${record.paymentReference}</div>` : ''}
      </div>
    </div>

    <!-- ══════════ FOOTER NOTE ══════════ -->
    <div style="margin-top:18px;border-top:1px dashed #d0d7de;padding-top:14px;text-align:center;font-size:0.76rem;color:#888">
      This is a system-generated payslip and does not require a signature. For queries, contact HR at ${org.email}<br>
      <strong>${org.name}</strong> &nbsp;|&nbsp; ${org.address}
    </div>

  </div>
</div>`;
  }

  /* ─────────────────────────── public API ─────────────────────────── */

  /**
   * Open Bootstrap modal with professional payslip for the given payroll record ID.
   */
  function openPayslipModal(recordId) {
    const records = Store.getPayrollRecords();
    const record = records.find(r => r.id === recordId);
    if (!record) {
      if (typeof App !== 'undefined') App.showToast('Payroll record not found.', 'danger');
      return;
    }

    const emp = Store.getEmployeeById(record.employeeId);
    if (!emp) {
      if (typeof App !== 'undefined') App.showToast('Employee data not found.', 'danger');
      return;
    }

    // Set modal title
    const titleEl = document.getElementById('payslipModalTitle');
    if (titleEl) titleEl.textContent = `Payslip — ${record.employeeName} | ${record.monthYear}`;

    // Inject payslip HTML
    const contentEl = document.getElementById('payslipContent');
    if (contentEl) {
      contentEl.innerHTML = _buildPayslipHTML(record, emp);
    } else {
      // If payslipContent doesn't exist yet (first open), inject into modal body
      const modalBody = document.querySelector('#payslipModal .modal-body');
      if (modalBody) {
        let wrapper = document.createElement('div');
        wrapper.id = 'payslipContent';
        wrapper.innerHTML = _buildPayslipHTML(record, emp);
        modalBody.innerHTML = '';
        modalBody.appendChild(wrapper);
      }
    }

    // Wire download button
    const dlBtn = document.getElementById('payslipDownloadBtn');
    if (dlBtn) {
      dlBtn.onclick = () => downloadPayslipPDF(recordId);
    }

    // Show modal
    const modalEl = document.getElementById('payslipModal');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  }

  /**
   * Download the visible payslip area as a PDF using html2pdf.js.
   */
  function downloadPayslipPDF(recordId) {
    const records = Store.getPayrollRecords();
    const record = records.find(r => r.id === recordId);
    const contentEl = document.getElementById('payslipContent');

    if (!window.html2pdf) {
      if (typeof App !== 'undefined') App.showToast('PDF library not loaded. Please refresh and try again.', 'danger');
      return;
    }
    if (!contentEl) {
      if (typeof App !== 'undefined') App.showToast('Payslip content not found.', 'danger');
      return;
    }

    const fileName = record
      ? `Payslip_${record.employeeId}_${record.monthYear.replace(/ /g, '_')}.pdf`
      : 'Payslip.pdf';

    if (typeof App !== 'undefined') App.showToast('Generating PDF, please wait…', 'info');

    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(contentEl)
      .save()
      .then(() => {
        if (typeof App !== 'undefined') App.showToast('Payslip PDF downloaded successfully!', 'success');
      })
      .catch(() => {
        if (typeof App !== 'undefined') App.showToast('Failed to generate PDF. Please try again.', 'danger');
      });
  }

  /**
   * Render a table of all payslips for a given employee — used in Employee Dashboard.
   * @param {string} empId
   * @param {string} containerId - DOM id of the container to render into
   */
  function renderEmployeePayslips(empId, containerId = 'employeePayslipsTable') {
    const records = Store.getPayrollRecords().filter(r => r.employeeId === empId);
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!records.length) {
      container.innerHTML = `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-file-earmark-text" style="font-size:3rem;opacity:0.3"></i>
          <p class="mt-3">No payslips found for this employee.</p>
        </div>`;
      return;
    }

    // Sort most recent first
    const sorted = [...records].sort((a, b) => {
      const da = new Date(`${a.month} 1, ${a.year}`);
      const db = new Date(`${b.month} 1, ${b.year}`);
      return db - da;
    });

    const statusColors = { Paid: 'success', Approved: 'primary', Draft: 'secondary', Pending: 'warning' };

    const rows = sorted.map(r => {
      const badge = `<span class="badge bg-${statusColors[r.status] || 'secondary'}">${r.status}</span>`;
      return `
        <tr>
          <td>${r.monthYear}</td>
          <td>${Store.formatINR(r.grossSalary)}</td>
          <td>${Store.formatINR(r.totalDeductions)}</td>
          <td class="fw-bold text-success">${Store.formatINR(r.netSalary)}</td>
          <td>${badge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="PayslipGenerator.openPayslipModal('${r.id}')">
              <i class="bi bi-eye me-1"></i>View
            </button>
            <button class="btn btn-sm btn-outline-secondary ms-1" onclick="PayslipGenerator.downloadPayslipPDF('${r.id}')">
              <i class="bi bi-download me-1"></i>PDF
            </button>
          </td>
        </tr>`;
    }).join('');

    container.innerHTML = `
      <table class="table table-hover table-sm align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Month & Year</th>
            <th>Gross Salary</th>
            <th>Deductions</th>
            <th>Net Salary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  /* ── ensure modal markup exists in DOM ── */
  function _ensureModal() {
    if (document.getElementById('payslipModal')) return;

    const html = `
<div class="modal fade" id="payslipModal" tabindex="-1" aria-labelledby="payslipModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header" style="background:#1e3a5f;color:#fff">
        <h5 class="modal-title" id="payslipModalTitle">Payslip</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body bg-light">
        <div id="payslipContent"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
          <i class="bi bi-x-circle me-1"></i>Close
        </button>
        <button type="button" class="btn btn-primary" id="payslipDownloadBtn">
          <i class="bi bi-download me-1"></i>Download PDF
        </button>
      </div>
    </div>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);
  }

  // Auto-inject modal when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _ensureModal);
  } else {
    _ensureModal();
  }

  return { openPayslipModal, downloadPayslipPDF, renderEmployeePayslips };
})();
