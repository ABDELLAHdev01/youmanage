# 📱 YouManage: Detailed Feature Documentation

A comprehensive technical and functional breakdown of all capabilities in the YouManage Personal Finance Tracker.

---

## 🏗️ Core Technology & Architecture
- **Offline-First Excellence**: Built using a robust offline-first strategy. The app logic resides entirely in the client, ensuring zero latency and 100% availability without internet.
- **LocalStorage Data Engine**: 
  - Uses a custom `useLocalStorage` hook for reactive state synchronization.
  - Data is structured in a central `FinanceState` object containing categorized arrays for income, expenses, debts, and savings.
  - **Auto-Healing Migration**: On app startup, a persistence layer checks for missing data structures and automatically initializes them to prevent runtime errors with older data versions.
- **PWA Capabilities**: 
  - Service Workers handle resource caching for instant loads.
  - Manifest configuration allows "Add to Home Screen" on iOS and Android for a full-screen, native-app experience.
- **Premium Dark UI**: A bespoke design system using Tailwind CSS, featuring "Glassmorphism" effects, smooth transitions (Framer Motion), and high-contrast accessibility.

---

## 🏁 First-Time User Onboarding (Phase 15)
- **Engaging 5-Step Flow**:
  1. **Security PIN**: Setup a 4-6 digit code to lock the app locally.
  2. **Feature Spotlight**: Visual overview of key functional areas.
  3. **Salary Automation**: Set your baseline monthly income and payday.
  4. **Emergency Fund**: Optional instant creation of a savings goal.
  5. **Final Review**: Summary of your setup before entering the Dashboard.
- **Persistent State**: The onboarding experience is skipped automatically once completed.

---

## 🔒 Security & Privacy
- **Local PIN Lock**: If enabled, the app presents an animated keypad on every new session.
- **Zero Cloud Storage**: Your financial data never leaves your device's LocalStorage.
- **Emergency Disable**: PIN can be disabled or changed anytime within Settings (requires confirmation).

---

## 📊 Dashboard: The Command Center
- **Smart Hero Card**: 
  - **Dynamic Calculation**: Displays "Money Left Today" using the formula: `(Remaining Monthly Budget - Monthly Bills / Days Left) - Spent Today`.
  - **Triple-State Visuals**: 🟢 Emerald (Safe), 🟡 Amber (80% used), 🔴 Red (Exceeded).
- **Interactive Analytics**: 
  - **Spending Distribution**: Responsive Pie Chart of current month expenses.
  - **Category Health**: Progress bars that transition color as you approach monthly limits.

---

## 💸 Expense & Bill Management
- **Monthly Bills (Phase 16)**: 
  - Track fixed costs like Rent, Netflix, or Utilities.
  - These are prioritized in your daily budget calculations.
- **Intelligent Creation**: 
  - Real-time "Budget Projection" warns you *before* you submit an expense if it will exceed a limit.
- **History Audit**: 
  - Grouped by date with daily totals.
  - Multi-view filtering (Day/Week/Month).

---

## 💰 Income & Salary Automation
- **Monthly Salary Engine**: 
  - Background check auto-generates your salary income on your chosen payday.
- **Extra Income Tracking**: 
  - Form for one-time bonuses, gifts, or side hustles.

---

## 🎯 Savings Goals & Debt Tracker
- **Target-Based Savings**: Progress visualization via donut charts.
- **Debt Liability Tracker**: Bilateral management of money owed and to be collected.
- **Visual Repayment**: Gradient bars showing completion percentage of debts.

---

## ⚙️ Advanced Data Tools
- **Budget Configuration**: Per-category limit setting.
- **Dual Budget Modes**: Choose between System Recommended or Custom Daily limits.
- **Backup & Portability**: 
  - **JSON Export**: Timestamped full data backups.
  - **JSON Import**: Smart Merge (handles duplicates) or Replace (clean slate) modes with strict schema validation.
