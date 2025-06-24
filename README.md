# Beneficial Owner Check

A web application to help merchants identify which individuals need to be provided as directors or beneficial owners of their business for compliance purposes.

## Features

- **Region-specific compliance requirements**: Different regions have different thresholds and requirements
- **Business type support**: Custom requirements based on business structure
- **Ownership structure visualization**: Interactive tree diagram showing ownership relationships
- **Nested ownership support**: Drill down into organizations to find ultimate beneficial owners
- **Configuration editor**: Password-protected editor to modify region configurations
- **Real-time validation**: Immediate feedback on ownership percentages and compliance status

## Setup

### Prerequisites

- Node.js (v16 or higher)
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

3. Install server dependencies:
```bash
npm install express cors
```

### Running the Application

1. **Development Mode** (Frontend only):
```bash
npm run dev
```
This runs the frontend on `http://localhost:5173`

2. **With Backend Server** (For YAML editing):
```bash
# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start the frontend
npm run dev
```

The backend server runs on `http://localhost:3001` and provides API endpoints for saving YAML configuration files.

## Configuration Editor

The configuration editor allows you to modify region-specific YAML files. To access it:

1. Click the "Configuration Editor" button in the main application
2. Enter the password: `shopifymerchantverification`
3. Select a region to edit
4. Modify the configuration using the form interface
5. Click "Save Changes" to update the actual YAML file

### Backend API Endpoints

- `POST /api/save-config`: Save YAML configuration
  - Body: `{ regionCode: string, config: object }`
- `GET /api/config/:regionCode`: Get YAML configuration

## Project Structure

```
src/
├── components/          # React components
│   ├── BusinessForm.tsx
│   ├── ComplianceSummary.tsx
│   ├── ConfigEditor.tsx
│   ├── OwnerForm.tsx
│   ├── OwnerList.tsx
│   ├── OwnershipTree.tsx
│   └── ...
├── config/             # YAML configuration files
│   └── regions/
│       ├── us.yaml
│       ├── uk.yaml
│       └── ...
├── utils/              # Utility functions
│   ├── ownershipCalculator.ts
│   └── yamlLoader.ts
└── types.ts            # TypeScript type definitions
```

## Usage

1. **Select Region**: Choose your business region to see region-specific requirements
2. **Add Business Details**: Enter your business information (optional but recommended)
3. **Add Owners**: Add directors and owners with their ownership percentages
4. **Review Compliance**: See which individuals must be reported based on your structure
5. **Drill Down**: For organizations, click "Add Owners" to add their owners

## Ownership Structure Example

```
Benny's Burgers (Trading Company)
├── John Smith (Individual) - 50% owner
└── Benny Holdings (Company) - 50% owner
    └── Benny Family Trust (Trust) - 100% owner
        ├── Alice Benny (Individual) - 60% owner
        └── Bob Benny (Individual) - 40% owner
```

In this example, the compliance system would identify:
- John Smith: 50% effective ownership (direct)
- Alice Benny: 30% effective ownership (50% × 60%)
- Bob Benny: 20% effective ownership (50% × 40%)

## Development

### Building for Production

```bash
npm run build
```

This creates a `dist` folder with the production build.

### Running Production Server

```bash
npm run server
```

The server will serve the built application from the `dist` folder and provide API endpoints for configuration management.

## License

[Add your license information here]
