# Disaster Relief Platform Frontend

A React-based frontend for the Disaster Relief Platform that integrates with Firebase and Ethereum blockchain using ethers.js.

## Folder Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── contexts/
│   │   ├── AuthContext.js       # Firebase authentication context
│   │   └── WalletContext.js     # Ethereum wallet connection context
│   ├── components/
│   │   ├── Navbar.js            # Navigation bar component
│   │   └── Footer.js            # Footer component
│   ├── pages/
│   │   ├── Home.js              # Landing page
│   │   ├── Login.js             # Login page
│   │   ├── Register.js          # Registration page
│   │   ├── DonorDashboard.js    # Donor dashboard page
│   │   ├── AdminDashboard.js    # Admin dashboard page
│   │   ├── BeneficiaryDashboard.js # Beneficiary dashboard page
│   │   └── Profile.js           # User profile page
│   ├── App.js                   # Main application component
│   └── index.js                 # Entry point
├── package.json                 # Project dependencies and scripts
└── README.md                    # This file
```

## Key Features

### Authentication & Wallet Integration

- Firebase Authentication for user management
- Ethereum wallet connection via MetaMask using ethers.js
- Role-based access control (donor, admin, beneficiary)

### Dashboards

#### Donor Dashboard

- View account information and wallet balance
- Make donations to active disasters
- View donation history
- Connect Ethereum wallet for transactions

#### Admin Dashboard

- Create and manage disaster events
- Approve vendors and beneficiaries
- Monitor transactions
- Manage platform operations

#### Beneficiary Dashboard

- View relief package information
- Spend tokens within category limits
- View transaction history
- Access available vendors

### Technical Implementation

#### Contexts

- `AuthContext`: Manages Firebase authentication state
- `WalletContext`: Handles Ethereum wallet connection and interactions

#### Components

- `Navbar`: Navigation with wallet connection status
- `Footer`: Standard footer component

#### Pages

- `Home`: Landing page with role-based navigation
- Authentication pages: Login and registration
- Dashboard pages: Role-specific interfaces
- `Profile`: User profile management

## Environment Variables

Create a `.env` file in the root of the `frontend` directory with the following variables:

```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Runs tests
- `npm run eject`: Ejects from Create React App (not recommended)

## Dependencies

- React and React DOM
- React Router for navigation
- Firebase for authentication and database
- ethers.js for Ethereum interactions
- Material UI for styling
- axios for HTTP requests

## Security Considerations

- All sensitive data is stored in environment variables
- Firebase security rules should be configured appropriately
- Ethereum transactions are secured through wallet signatures
- User roles are enforced both client-side and server-side
