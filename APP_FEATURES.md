# 📱 YouManage: Comprehensive Application Documentation

YouManage is a professional, offline-first Personal Finance Tracker PWA. It provides a premium, secure, and data-driven experience for managing your financial life entirely on your device.

---

## 🏗️ Technical Architecture & Stack
- **React 18 & Vite**: For a high-performance, modern web foundation.
- **Offline-First Excellence**: Uses `localStorage` as its primary database. No cloud, no tracking, total privacy.
- **PWA Ready**: Fully installable on iOS and Android with offline service workers.
- **Design System**: A bespoke "Glassmorphic" dark theme built with **Tailwind CSS** and **Framer Motion** for premium feel.
- **Iconography**: Clean, vector-based visuals using **Lucide React**.

---

## 📂 Project Structure
- `src/context/FinanceContext.tsx`: The "Brain" of the app. Manages all financial state, automation logic, and persistence.
- `src/components/Onboarding.tsx`: A data-driven 7-step guide to set up your financial year.
- `src/components/PinLock.tsx`: Local security layer that protects your data with a 4-6 digit code.
- `src/hooks/useLocalStorage.ts`: Custom hook for reactive, safe, and persistent data storage.
- `src/pages/`: Core application screens:
  - **Dashboard**: Real-time spending analysis and daily guardrails.
  - **Income & Salary**: Manage monthly earnings and automation.
  - **Monthly Bills**: Track fixed costs and recurring subscriptions.
  - **Savings & Debts**: Visual progress towards financial goals and liability tracking.
  - **History**: Grouped transaction logs with audit-quality transparency.

---

## 🏁 Advanced Onboarding Flow
The unique onboarding process ensures you start with accurate data:
1.  **Security**: Define a local PIN for privacy.
2.  **Salary Entry**: Set your monthly income and exact payday.
3.  **Automation Switch**: Toggle if the app should record your salary automatically each month.
4.  **Extra Income**: Add side-hustles or one-time bonuses.
5.  **Essential Budgets**: Suggestions for Food, Transport, Bills, and more based on financial best practices.
6.  **Emergency Fund**: Set a priority savings target (e.g., 3 months of expenses).
7.  **Daily Allowance**: Real-time calculation of your safe daily spending limit.

---

## 🔒 Security & Data Portability
- **Local PIN Lock**: Optional security layer that keeps your data private on shared devices.
- **Zero Cloud Storage**: Your data never leaves your device.
- **Full Data Portability**: 
  - **JSON Export**: Download your entire history as a portable file.
  - **JSON Import**: Smart Merge or Overwrite options with schema validation.

---

## � Key Functional Logic
- **Daily Budget Calculation**: `((Current Balance - Total Bills) / Days Left in Month)`.
- **Salary Automation**: The app checks on your payday and auto-records your salary income only if enabled.
- **Budget Health**: Dynamic progress bars that turn Red if you exceed your planned category limits.
- **Debt Tracking**: Bilateral tracking for money owed to you and money you owe others.
