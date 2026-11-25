/**
 * Payroll Management System — IdCardGenerator Module
 * Renders a premium corporate ID card preview and exports it as PDF.
 */

const IdCardGenerator = (() => {

  /* ─────────────────────────── helpers ─────────────────────────── */

  /**
   * Returns initials from a full name for the avatar fallback.
   */
  function _initials(name = '') {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');
  }

  /**
   * Format a date string to DD MMM YYYY.
   */
  function _fmtDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  /**
   * Build the full ID-card HTML markup.
   */
  function _buildCardHTML(emp) {
    const org = INITIAL_DATA.organization;
    const initials = _initials(emp.fullName);

    // Photo element — if photo URL present use <img>, otherwise show avatar initials circle
    const photoHTML = emp.photo
      ? `<img src="${emp.photo}" alt="${emp.fullName}"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
            style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,0.25)"
         >
         <div style="display:none;width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#2563eb);border:4px solid #fff;
                     box-shadow:0 4px 16px rgba(0,0,0,0.25);align-items:center;justify-content:center;
                     font-size:2.4rem;font-weight:800;color:#fff;letter-spacing:1px">${initials}</div>`
      : `<div style="width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#2563eb);border:4px solid #fff;
                     box-shadow:0 4px 16px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;
                     font-size:2.4rem;font-weight:800;color:#fff;letter-spacing:1px">${initials}</div>`;

    return `
<div id="idCardContent" style="font-family:'Segoe UI',Arial,sans-serif;display:flex;justify-content:center;align-items:center;padding:20px 0">
  <div style="width:340px;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(30,58,95,0.3);background:#fff;position:relative">

    <!-- ══ TOP GRADIENT BANNER ══ -->
    <div style="background:linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 60%,#60a5fa 100%);padding:28px 20px 20px;text-align:center;position:relative">
      <!-- decorative circles -->
      <div style="position:absolute;top:-30px;left:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.07)"></div>
      <div style="position:absolute;top:-10px;right:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.05)"></div>

      <!-- Company name -->
      <div style="color:#fff;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;opacity:0.9;margin-bottom:2px">
        ${org.name}
      </div>
      <div style="color:rgba(255,255,255,0.65);font-size:0.6rem;letter-spacing:1px">${org.tagline || 'Enterprise Cloud &amp; Software Solutions'}</div>

      <!-- Photo -->
      <div style="margin-top:16px;display:flex;justify-content:center">
        ${photoHTML}
      </div>

      <!-- QR code placeholder container (filled by JS after render) -->
      <div id="idCardQRContainer_${emp.id.replace(/-/g, '_')}"
           style="position:absolute;top:16px;right:14px;background:#fff;border-radius:6px;padding:3px;width:62px;height:62px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2)">
      </div>
    </div>

    <!-- ══ WHITE BODY ══ -->
    <div style="padding:18px 24px 14px;background:#fff">

      <!-- Name -->
      <div style="text-align:center;margin-bottom:4px">
        <div style="font-size:1.3rem;font-weight:800;color:#1a1a2e;line-height:1.2">${emp.fullName}</div>
        <div style="font-size:0.8rem;color:#2563eb;font-weight:600;margin-top:3px">${emp.designation}</div>
      </div>

      <!-- ID Badge -->
      <div style="text-align:center;margin:10px 0">
        <span style="display:inline-block;background:linear-gradient(90deg,#1e3a5f,#2563eb);color:#fff;font-size:0.78rem;font-weight:700;
                     padding:4px 18px;border-radius:20px;letter-spacing:1.5px">
          ${emp.id}
        </span>
      </div>

      <!-- Divider -->
      <div style="height:1px;background:linear-gradient(90deg,transparent,#d0d7de,transparent);margin:12px 0"></div>

      <!-- Details grid -->
      <table style="width:100%;border-collapse:collapse;font-size:0.78rem">
        <tr>
          <td style="padding:5px 0;color:#6c757d;font-weight:600;width:40%">
            <i style="color:#2563eb;margin-right:5px">&#9654;</i>Department
          </td>
          <td style="padding:5px 0;color:#1a1a2e;font-weight:500">${emp.department}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#6c757d;font-weight:600">
            <i style="color:#2563eb;margin-right:5px">&#9654;</i>Joining Date
          </td>
          <td style="padding:5px 0;color:#1a1a2e;font-weight:500">${_fmtDate(emp.joiningDate)}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#6c757d;font-weight:600">
            <i style="color:#2563eb;margin-right:5px">&#9654;</i>Contact
          </td>
          <td style="padding:5px 0;color:#1a1a2e;font-weight:500">${emp.mobile || '—'}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#6c757d;font-weight:600">
            <i style="color:#2563eb;margin-right:5px">&#9654;</i>Blood Group
          </td>
          <td style="padding:5px 0;color:#dc2626;font-weight:700">${emp.bloodGroup || '—'}</td>
        </tr>
      </table>

      <!-- Divider -->
      <div style="height:1px;background:linear-gradient(90deg,transparent,#d0d7de,transparent);margin:12px 0"></div>
    </div>

    <!-- ══ BOTTOM STRIP ══ -->
    <div style="background:linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%);padding:10px 20px;text-align:center">
      <div style="color:rgba(255,255,255,0.75);font-size:0.65rem;letter-spacing:0.5px">
        ${org.email}&nbsp;&nbsp;|&nbsp;&nbsp;www.zenithglobal.com
      </div>
      <div style="color:rgba(255,255,255,0.5);font-size:0.6rem;margin-top:2px">
        If found, please return to: ${org.address}
      </div>
    </div>

  </div>
</div>`;
  }

  /**
   * Inject QR code into the card after the HTML has been rendered.
   */
  function _injectQRCode(emp) {
    const containerId = `idCardQRContainer_${emp.id.replace(/-/g, '_')}`;
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = ''; // clear previous

    if (window.QRCode) {
      try {
        new QRCode(el, {
          text: `EMP:${emp.id}|NAME:${emp.fullName}|DEPT:${emp.department}`,
          width: 56,
          height: 56,
          colorDark: '#1e3a5f',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (e) {
        el.innerHTML = `<div style="font-size:0.55rem;color:#999;text-align:center">QR N/A</div>`;
      }
    } else {
      // Fallback: show employee ID text
      el.innerHTML = `<div style="font-size:0.55rem;color:#1e3a5f;font-weight:700;text-align:center;word-break:break-all">${emp.id}</div>`;
    }
  }

  /* ─────────────────────────── public API ─────────────────────────── */

  /**
   * Open Bootstrap modal with the professional ID card for empId.
   */
  function openIdCardModal(empId) {
    const emp = Store.getEmployeeById(empId);
    if (!emp) {
      if (typeof App !== 'undefined') App.showToast('Employee not found.', 'danger');
      return;
    }

    _ensureModal();

    // Render card HTML into preview area
    const previewArea = document.getElementById('idCardPreviewArea');
    if (previewArea) {
      previewArea.innerHTML = _buildCardHTML(emp);
    }

    // Set download button handler
    const dlBtn = document.getElementById('idCardDownloadBtn');
    if (dlBtn) {
      dlBtn.onclick = () => downloadIdCard(empId);
    }

    // Set modal title
    const titleEl = document.getElementById('idCardModalTitle');
    if (titleEl) titleEl.textContent = `ID Card — ${emp.fullName}`;

    // Show modal first so QR container is in the DOM, then inject QR
    const modalEl = document.getElementById('idCardModal');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();

      // After modal is shown, inject QR (needs visible DOM element)
      modalEl.addEventListener('shown.bs.modal', function handler() {
        _injectQRCode(emp);
        modalEl.removeEventListener('shown.bs.modal', handler);
      });
    } else {
      // Fallback: inject immediately if already visible
      _injectQRCode(emp);
    }
  }

  /**
   * Download the ID card as a PDF (landscape) using html2pdf.js.
   */
  function downloadIdCard(empId) {
    const emp = Store.getEmployeeById(empId);
    const contentEl = document.getElementById('idCardContent');

    if (!window.html2pdf) {
      if (typeof App !== 'undefined') App.showToast('PDF library not loaded. Please refresh and try again.', 'danger');
      return;
    }
    if (!contentEl) {
      if (typeof App !== 'undefined') App.showToast('ID card content not found.', 'danger');
      return;
    }

    const fileName = emp
      ? `IDCard_${emp.id}_${emp.fullName.replace(/\s+/g, '_')}.pdf`
      : 'IDCard.pdf';

    if (typeof App !== 'undefined') App.showToast('Generating ID Card PDF…', 'info');

    html2pdf()
      .set({
        margin: 5,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: { scale: 3, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: [90, 140], orientation: 'portrait' }
      })
      .from(contentEl)
      .save()
      .then(() => {
        if (typeof App !== 'undefined') App.showToast('ID Card PDF downloaded successfully!', 'success');
      })
      .catch(() => {
        if (typeof App !== 'undefined') App.showToast('Failed to generate ID Card PDF. Please try again.', 'danger');
      });
  }

  /**
   * Render a grid of ID card preview cards for all employees (ID Cards section).
   * @param {string} containerId - DOM id to render into
   * @param {string} [filterDept] - optional department filter
   * @param {string} [searchTerm] - optional search term
   */
  function renderIdCardGrid(containerId = 'idCardGridContainer', filterDept = '', searchTerm = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let employees = Store.getEmployees().filter(e => e.employmentStatus !== 'Inactive');

    if (filterDept) {
      employees = employees.filter(e => e.department === filterDept);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      employees = employees.filter(e =>
        e.fullName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        (e.designation || '').toLowerCase().includes(q)
      );
    }

    if (!employees.length) {
      container.innerHTML = `
        <div class="col-12 text-center py-5 text-muted">
          <i class="bi bi-person-badge" style="font-size:3rem;opacity:0.3"></i>
          <p class="mt-3">No employees found.</p>
        </div>`;
      return;
    }

    const cards = employees.map(emp => {
      const initials = _initials(emp.fullName);
      const photoEl = emp.photo
        ? `<img src="${emp.photo}" class="rounded-circle border border-3 border-white shadow"
               style="width:70px;height:70px;object-fit:cover"
               onerror="this.outerHTML='<div style=\\'width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#2563eb);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#fff;\\'>${initials}</div>'">`
        : `<div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#2563eb);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#fff">${initials}</div>`;

      return `
        <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
          <div class="card border-0 shadow-sm h-100" style="border-radius:12px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:20px;text-align:center">
              <div class="d-flex justify-content-center">${photoEl}</div>
              <div class="text-white fw-bold mt-2" style="font-size:1rem">${emp.fullName}</div>
              <div class="text-white-50" style="font-size:0.75rem">${emp.designation}</div>
            </div>
            <div class="card-body text-center py-3">
              <span class="badge bg-primary mb-2">${emp.id}</span>
              <div class="text-muted" style="font-size:0.8rem">
                <i class="bi bi-building me-1"></i>${emp.department}
              </div>
            </div>
            <div class="card-footer bg-transparent border-0 text-center pb-3">
              <button class="btn btn-sm btn-outline-primary me-2" onclick="IdCardGenerator.openIdCardModal('${emp.id}')">
                <i class="bi bi-eye me-1"></i>Preview
              </button>
              <button class="btn btn-sm btn-primary" onclick="IdCardGenerator.downloadIdCard('${emp.id}')">
                <i class="bi bi-download me-1"></i>Download
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `<div class="row">${cards}</div>`;
  }

  /* ── ensure modal markup exists in DOM ── */
  function _ensureModal() {
    if (document.getElementById('idCardModal')) return;

    const html = `
<div class="modal fade" id="idCardModal" tabindex="-1" aria-labelledby="idCardModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" style="max-width:420px">
    <div class="modal-content border-0 shadow-lg" style="border-radius:16px;overflow:hidden">
      <div class="modal-header border-0" style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:16px 24px">
        <h5 class="modal-title fw-bold" id="idCardModalTitle">Employee ID Card</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-0 bg-light">
        <div id="idCardPreviewArea"></div>
      </div>
      <div class="modal-footer border-0" style="background:#f8f9fa;padding:12px 20px">
        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">
          <i class="bi bi-x-circle me-1"></i>Close
        </button>
        <button type="button" class="btn btn-primary btn-sm" id="idCardDownloadBtn">
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

  return { openIdCardModal, downloadIdCard, renderIdCardGrid };
})();
