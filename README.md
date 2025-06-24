# Beneficial Owner Check

A simple webapp to assist merchants identify which individuals need to be provided as directors or beneficial owners of their business.

## Features

- **Region Selection**: Choose your business region to see specific compliance requirements
- **Owner Management**: Add directors, shareholders, and beneficial owners with ownership percentages
- **Compliance Calculation**: Automatically determines which individuals must be reported based on regional thresholds
- **Real-time Validation**: Validates ownership structure and highlights issues
- **Visual Indicators**: Clearly highlights required individuals with warning colors and icons

## Supported Regions

- United States (25% threshold)
- United Kingdom (25% threshold)
- European Union (25% threshold)
- Canada (25% threshold)
- Australia (25% threshold)
- Singapore (25% threshold)
- Hong Kong (25% threshold)
- Japan (25% threshold)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd beneficial-owner-check
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## How to Use

1. **Select Your Region**: Choose your business region from the dropdown to see compliance requirements
2. **Add Owners**: Use the form to add directors, shareholders, and beneficial owners
3. **Specify Ownership**: Enter ownership percentages for each individual
4. **Review Results**: The app will highlight which individuals must be reported for compliance

## Compliance Rules

- **Directors**: Always required to be reported in all supported regions
- **Shareholders/Beneficial Owners**: Required if ownership percentage meets or exceeds the regional threshold (typically 25%)
- **Validation**: The app ensures total ownership doesn't exceed 100% and requires at least one director

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Development**: ESLint for code quality

## Project Structure

```
src/
├── components/          # React components
│   ├── RegionSelector.tsx
│   ├── OwnerForm.tsx
│   ├── OwnerList.tsx
│   └── ComplianceSummary.tsx
├── data/               # Static data
│   └── regions.ts
├── types/              # TypeScript type definitions
│   └── types.ts
├── utils/              # Utility functions
│   └── ownershipCalculator.ts
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
