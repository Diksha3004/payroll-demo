# PaySync Pro — Enterprise Payroll & HR Suite (Vercel Demo)

A full-featured, zero-latency **Payroll Management System Demo** pre-configured for instant deployment on **Vercel**.

Designed with **multi-role access**, **realistic sample data**, **interactive calculations**, and **client-side persistence (LocalStorage)** so anyone testing the demo gets a complete enterprise software experience without needing database setup.

---

## 🌟 Demo Features Overview

### 1. 🎭 Multi-Role Demo Switcher
* **Top-Bar Role Switcher**: Instantly switch between **Admin**, **HR Manager**, and **Employee** views with a single click.
* **Reset Demo Data**: Easily restore all records back to pristine initial state at any time.

### 2. ⚡ Payroll Processing Engine
* **Monthly Batch Payroll Runs**: Generate, review, recalculate, and approve payroll batches.
* **Automatic Salary Calculations**:
  * **Earnings**: Basic Salary, House Rent Allowance (HRA), Dearness Allowance (DA), Conveyance, Medical, and Other Allowances.
  * **Statutory Deductions**: Provident Fund (PF / 12%), Professional Tax, and Income Tax (TDS).
* **Batch Status Tracking**: `Draft` → `Processing` → `Approved` → `Paid`.

### 3. 📄 Payslip & ID Card Generation
* **Digital Payslips**: Itemized payslip viewer with gross earnings, total deductions, and net salary in words.
* **PDF Download**: One-click printable PDF generation using `html2pdf.js`.
* **Printable ID Cards**: Employee identity cards complete with scannable QR codes.

### 4. 👥 Employee & Department Directory
* **Employee Management**: Profile views, role assignments, salary tier setup, and bank account tracking.
* **Department Oversight**: Department budgeting, head-of-department tracking, and headcount distribution.

### 5. 📅 Attendance & Leave Management
* **Interactive Attendance Sheet**: Track Present, Absent, Half-Day, and Leave statuses.
* **Leave Requests**: Vacation, Sick Leave, Casual Leave approval and rejection workflows with remaining leave balances.

### 6. 📊 Analytics, Reports & Exports
* **Live Charts**: Department salary allocation (donut), payroll expense trends (line), and deduction breakdown.
* **Excel Export**: Export employee rosters, payroll summaries, and tax sheets to `.xlsx` via `SheetJS`.

---

## 🔑 Demo Login Credentials

The login screen provides 1-click quick-login buttons, or you can enter:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full system control, payroll approval, organization settings |
| **HR Manager** | `hr` | `hr123` | Employee management, attendance, leave approvals, payroll generation |
| **Employee** | `employee` | `emp123` | Personal profile, payslips, leave requests, attendance view |

---

## 🚀 How to Deploy to Vercel

### Option 1: Deploy with Vercel CLI (Fastest)

1. Open your terminal in this project folder:
   ```bash
   cd payroll-management-system
   ```
2. Run the Vercel deployment command:
   ```bash
   npx vercel
   ```
3. Follow the CLI prompts:
   * **Set up and deploy?** Press `y`
   * **Which scope?** Select your Vercel account
   * **Link to existing project?** `N`
   * **What's your project's name?** `payroll-demo`
   * **In which directory is your code located?** `.` (or `./frontend`)
4. To deploy directly to production:
   ```bash
   npx vercel --prod
   ```

---

### Option 2: Deploy via GitHub (Vercel Web Dashboard)

1. Initialize git and push to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Payroll Demo"
   git branch -M main
   git remote add origin https://github.com/<your-username>/payroll-demo.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your `payroll-demo` GitHub repository.
4. Keep the default settings (the included `vercel.json` automatically routes traffic to `frontend`).
5. Click **Deploy**.

---

## 💻 Local Preview

To preview the demo locally before deploying:

```bash
# Using npm
npm start

# Or using Python's built-in server
python -m http.server 3000 --directory frontend
```

Open `http://localhost:3000` in your web browser.

---

## 🛠️ Tech Stack
* **UI & Design**: Bootstrap 5.3, Bootstrap Icons, Inter Typography
* **Visualization**: Chart.js 4.4
* **PDF Engine**: html2pdf.js
* **Spreadsheet Engine**: SheetJS (xlsx 0.18.5)
* **QR Codes**: QRCode.js
* **Hosting**: Vercel (Edge static delivery with zero cold start)
