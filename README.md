# Emergency Relief Blockchain Platform

A full-stack web application for emergency and disaster relief using Blockchain (Ethereum) and Firebase, where donors, admins, and beneficiaries interact through a transparent and secure system.

## Features

- **Role-based access control**: Admin, Donor, and Beneficiary roles
- **Blockchain integration**: Ethereum-based transactions with ethers.js
- **Firebase authentication**: Secure user authentication and authorization
- **Responsive UI**: Modern dashboard-based interface with Tailwind CSS
- **Secure API**: Node.js/Express backend with JWT and Firebase authentication

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Blockchain**: Ethereum (ethers.js)
- **Wallet**: MetaMask integration

## Project Structure

```
project-root/
│
├── server.js                 # Main entry (backend + frontend)
├── package.json
├── .env
│
├── /config
│   ├── firebase.js
│   └── ethereum.js
│
├── /routes
│   ├── auth.routes.js
│   └── user.routes.js
│
├── /controllers
│   ├── auth.controller.js
│   └── user.controller.js
│
├── /middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── /frontend
│   ├── index.html
│   ├── main.jsx
│   ├── App.jsx
│   ├── /pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── Profile.jsx
│   ├── /components
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│
└── /public
```

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd emergency-relief-blockchain-app
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables**
   Create a `.env` file in the root directory with the following:

   ```env
   # Server Configuration
   PORT=3000

   # Firebase Configuration
   FIREBASE_TYPE=
   FIREBASE_PROJECT_ID=
   FIREBASE_PRIVATE_KEY_ID=
   FIREBASE_PRIVATE_KEY=
   FIREBASE_CLIENT_EMAIL=
   FIREBASE_CLIENT_ID=
   FIREBASE_AUTH_URI=
   FIREBASE_TOKEN_URI=
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=
   FIREBASE_CLIENT_X509_CERT_URL=
   FIREBASE_DATABASE_URL=

   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key-here
   JWT_EXPIRE=7d

   # Ethereum Configuration
   ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=your-ethereum-private-key-here
   ```

5. **Build the frontend**

   ```bash
   cd frontend
   npm run build
   ```

6. **Run the application**
   ```bash
   cd ..
   npm start
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run build-client` - Build the frontend

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### User Management

- `GET /api/user/me` - Get current user's profile
- `PUT /api/user/me` - Update current user's profile
- `GET /api/user` - Get all users (admin only)
- `GET /api/user/:id` - Get user by ID (admin only)
- `PUT /api/user/:id/role` - Update user role (admin only)

## User Roles

- **Admin**: Full access to user management and system settings
- **Donor**: Can make donations and view donation history
- **Beneficiary**: Can request assistance and view received aid

## Security Features

- JWT-based authentication
- Firebase authentication integration
- Role-based access control
- Input validation and sanitization
- Rate limiting
- Helmet security headers

## Development

To run in development mode with hot reloading:

1. Start the backend:

   ```bash
   npm run dev
   ```

2. In a separate terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Deployment

The application is configured for deployment-ready setup. The React frontend is built to the `public` directory and served by the Express server.

## Blockchain Integration

The application includes Ethereum blockchain integration for transparent and secure transactions. Smart contracts can be connected using the provided Ethereum configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
