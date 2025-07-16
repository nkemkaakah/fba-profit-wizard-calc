# Amazon FBA Profit Calculator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue)](https://fba-profit-wizard-calc.vercel.app/)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A comprehensive, fully responsive Amazon FBA profit calculator designed to help sellers make informed decisions about their product profitability. Built with modern web technologies and featuring an intuitive user interface with real-time calculations and advanced features.

## 🚀 Live Demo

**[View Live Demo](https://fba-profit-wizard-calc.vercel.app/)**

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Sub-Features](#sub-features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Amazon FBA Profit Calculator is a single-page web application that provides sellers with a comprehensive tool to calculate their potential profits, margins, and break-even points for Amazon FBA products. The app features real-time calculations, scenario comparisons, data visualization, and backend logging capabilities.

## ✨ Key Features

### Core Functionality
- **Intuitive Profit Calculator**: Clean, user-friendly interface for Amazon FBA sellers
- **Real-time Calculations**: Instant updates as you type with automatic result rendering
- **Comprehensive Metrics**: Calculate net profit, profit margin (%), and break-even units
- **Smart Defaults**: Auto-calculates referral fees (15% of selling price) and other common values
- **Data Persistence**: Supabase backend logs key input values, final results, and timestamps

### Monetization Ready
- **Ad Placement Areas**: Two strategically placed ad slots ("Ad goes here") for future monetization
- **Email Capture**: Professional email input with "Send my results to my inbox" CTA
- **Lead Generation**: Backend logging of email captures for marketing purposes

### Export & Sharing
- **PDF Export**: Professional calculation reports with company branding
- **JSON Export**: Raw data export for further analysis
- **Share Links**: Generate shareable URLs with calculation parameters
- **Copy to Clipboard**: One-click sharing functionality

## 🎨 Sub-Features (Thoughtful Touches)

### User Experience Enhancements
- **Interactive Tooltips**: Inline help for terms like FBA fee, referral fee, break-even, and PPC
- **Explainer Modals**: Detailed explanations of complex calculations and terms
- **Real-time Validation**: Live profit margin feedback with warnings (⚠️ for negative profits)
- **Contextual Advice**: Smart suggestions below results (e.g., "At this margin, you'd need to sell X units to net $Y")

### Advanced Features
- **Scenario Comparison**: Save and compare multiple calculation scenarios side-by-side
- **Interactive Charts**: Mini profit visualization charts using Recharts
- **Price/Volume Analysis**: Visual representation of profit against different variables
- **Mobile Responsive**: Fully optimized for mobile devices with touch-friendly interface

### Technical Excellence
- **SEO Optimized**: Descriptive headings, meta tags, and keyword-rich content
- **Accessibility**: ARIA labels, focus states, and full keyboard navigation support
- **Performance**: Optimized bundle size and lazy loading for fast load times
- **Error Handling**: Graceful error handling with user-friendly messages

### Educational Content
- **Formula Explanations**: Collapsible "How We Calculate" section with plain English explanations
- **Calculation Transparency**: Step-by-step breakdown of all profit calculations
- **FBA Guidelines**: Built-in help for Amazon FBA fee structures and policies

## 🛠 Technologies Used

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with excellent IDE support
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Radix UI** - Accessible, unstyled UI components
- **Shadcn/ui** - Beautiful, reusable components built on Radix UI

### Data Visualization
- **Recharts** - Composable charting library for React
- **Chart.js Integration** - Advanced charting capabilities

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - User authentication and authorization
- **Row Level Security** - Secure data access patterns

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality assurance
- **TypeScript Compiler** - Type checking and compilation
- **PostCSS** - CSS processing and optimization

### Deployment
- **Vercel** - Seamless deployment with global CDN
- **Continuous Integration** - Automated builds and deployments

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Supabase account (for backend functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fba-profit-wizard-calc.git
   cd fba-profit-wizard-calc
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## 📁 Project Structure

```
fba-profit-wizard-calc/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── placeholder.svg
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components (Shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tooltip-info.tsx
│   │   │   ├── info-modal.tsx
│   │   │   └── ...
│   │   ├── FBACalculator.tsx      # Main calculator component
│   │   ├── IntroScreen.tsx        # Welcome/intro screen
│   │   └── ProfitChart.tsx        # Chart visualization component
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   └── use-toast.ts           # Toast notification hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Supabase client configuration
│   │       └── types.ts           # Database type definitions
│   ├── lib/
│   │   ├── calculatorUtils.ts     # Core calculation logic
│   │   └── utils.ts               # Utility functions
│   ├── pages/
│   │   ├── Index.tsx              # Main page component
│   │   └── NotFound.tsx           # 404 page
│   ├── App.tsx                    # Root application component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles
├── supabase/
│   ├── migrations/                # Database migrations
│   └── config.toml               # Supabase configuration
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies and scripts
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite build configuration
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics or other services
VITE_ANALYTICS_ID=your_analytics_id
```

### Setting up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migrations found in `supabase/migrations/`
3. Copy your project URL and anon key to the environment variables
4. Enable Row Level Security (RLS) for production use

## 💡 Usage

### Basic Calculation

1. **Enter Product Details**:
   - Product cost (your wholesale/manufacturing cost)
   - Selling price (your planned Amazon listing price)
   - Referral fee (auto-calculated at 15% or enter custom)
   - FBA fee (fulfillment costs)
   - Shipping cost (to Amazon warehouse)
   - PPC budget (advertising spend)
   - Other fees (misc costs)

2. **View Results**:
   - Net profit per unit
   - Profit margin percentage
   - Break-even units needed
   - Contextual advice and recommendations

### Advanced Features

- **Scenario Comparison**: Save multiple scenarios and compare side-by-side
- **Data Export**: Download results as PDF or JSON
- **Share Results**: Generate shareable links with calculation parameters
- **Email Capture**: Send results to email (dummy implementation)

### Keyboard Shortcuts

- `Tab` - Navigate between input fields
- `Enter` - Calculate results
- `Escape` - Close modals
- `Ctrl/Cmd + S` - Save scenario

## 🎯 Key Calculations

### Net Profit Formula
```
Net Profit = Selling Price - (Product Cost + Referral Fee + FBA Fee + Shipping Cost + PPC Budget + Other Fees)
```

### Profit Margin Formula
```
Profit Margin = (Net Profit / Selling Price) × 100
```

### Break-Even Units Formula
```
Break-Even Units = Total Fixed Costs / Net Profit per Unit
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style and patterns
2. Add TypeScript types for all new features
3. Include unit tests for utility functions
4. Update documentation for new features
5. Ensure accessibility compliance

### Running Tests

```bash
npm test
# or
yarn test
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: https://fba-profit-wizard-calc.vercel.app/
- **GitHub Repository**: https://github.com/your-username/fba-profit-wizard-calc
- **Issue Tracker**: https://github.com/your-username/fba-profit-wizard-calc/issues

---

**Built with ❤️ for Amazon FBA sellers**

*Empowering sellers to make data-driven decisions with accurate profit calculations and insights.*
