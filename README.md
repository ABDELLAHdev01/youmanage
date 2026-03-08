# YouManage - Personal Finance Tracker

YouManage is a privacy-first, offline-ready Personal Finance Tracker built as a Progressive Web Application (PWA). It runs entirely in your browser and uses `localStorage` to keep your financial data securely on your device. No backend, no accounts, no data leaves your phone or computer.

## Features

- **PWA & Offline Ready**: Installable on mobile and desktop. Works completely offline.
- **Privacy First**: All data is stored locally on your device via `localStorage`.
- **Dashboard Overview**: Get a quick snapshot of your financial health, remaining budget for the month, and expenses today.
- **Expense Tracking**: Easily add and categorize your daily expenses.
- **Budgeting**: Set and manage monthly limits for different spending categories.
- **Debt Tracker**: Visually track your progress on paying off loans and credit cards.
- **Savings Goals**: Set goals and watch your emergency fund and savings grow.
- **History & Filtering**: View past expenses with intuitive filtering and color-coded categories.
- **Dark Mode Support**: Beautiful, modern UI that respects your device's theme preferences.
- **Data Export/Import**: Easily backup your data as a JSON file and restore it across devices.

## Tech Stack

- **Frontend Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, responsive, and modern design.
- **Charts**: [Recharts](https://recharts.org/) for beautiful data visualization.
- **Routing**: React Router
- **Forms**: React Hook Form
- **PWA Support**: `vite-plugin-pwa`

## Getting Started

### Prerequisites

You will need [Node.js](https://nodejs.org/) (version 16 or newer recommended) installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/youmanage.git
   cd youmanage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

You can then serve the built files from the `dist` directory using any static file server, or preview it locally:

```bash
npm run preview
```

## Usage & Verification

1. **First Launch**: Open the application in your browser. It should default to Dark Mode (or respect your system settings).
2. **Adding Data**: Start by adding a few expenses via the Add Expense page. Check the Dashboard to see your budget and charts update immediately.
3. **Tracking Debt/Savings**: Navigate to the respective trackers to configure your financial goals and observe the progress bars.
4. **Offline Capability**: Turn off your network connection or use Chrome DevTools to simulate being offline, and refresh the page. The app will continue to function seamlessly.
5. **Data Backup**: Head over to Settings to export your financial data as a JSON file, which you can later import to restore your state.

## License

This project is licensed under the MIT License.