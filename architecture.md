# Emergency & Disaster Relief Stablecoin System - Complete Architecture

## Tech Stack Overview

This system follows the specified tech stack:

**Frontend:**

- React
- ethers.js
- Firebase Authentication
- Firestore
- MetaMask wallet integration

**Backend:**

- Node.js
- Express.js
- Firebase Admin SDK
- Firestore as the primary database
- Ethereum event listeners for syncing on-chain data

**Blockchain:**

- Ethereum testnet (Sepolia or Polygon)
- Solidity smart contracts
- ERC-20 stablecoin (demo purpose)
- Role-based permissioned contracts

## Smart Contract Architecture

### 1. EmergencyReliefStablecoin.sol

**Purpose**: Core ERC-20 token with spending controls and category restrictions

**Key Features:**

- ERC-20 compliant token (ERS - Emergency Relief Stablecoin)
- Individual spending limits per beneficiary
- Category-based spending restrictions (food, medicine, shelter, water, clothing)
- Role-based access control (minters, burners, operators, emergency controllers)
- Transfer restrictions based on spending limits
- Beneficiary and vendor whitelisting
- ERC-20 token donation acceptance
- Emergency pause functionality

**Roles:**

- `MINTER_ROLE`: Can mint new tokens
- `BURNER_ROLE`: Can burn tokens
- `OPERATOR_ROLE`: Can set spending limits and category limits
- `EMERGENCY_ROLE`: Can pause/unpause contract operations
- `DEFAULT_ADMIN_ROLE`: Full administrative control

### 2. EmergencyReliefManager.sol

**Purpose**: Main coordination contract managing the overall system operations

**Key Features:**

- Donor fund deposits (ETH and ERC-20)
- Beneficiary and vendor whitelisting management
- Emergency event tracking and funding
- Fund distribution to beneficiaries
- Vendor spending operations
- Transaction history and audit trail
- ERC-20 token donation handling
- Emergency pause functionality

**Roles:**

- `DONOR_ROLE`: Can deposit funds
- `BENEFICIARY_ROLE`: Reserved for future use
- `VENDOR_ROLE`: Reserved for future use
- `OPERATOR_ROLE`: Can manage events, beneficiaries, vendors, and distributions
- `EMERGENCY_ROLE`: Can pause/unpause operations
- `DEFAULT_ADMIN_ROLE`: Full administrative control

## Data Distribution Strategy

### On-Chain Data (Smart Contracts)

- Token balances and transfers
- Spending limits and category restrictions
- Whitelist status for beneficiaries and vendors
- Transaction logs for auditability
- Emergency event metadata (funding amounts, status)
- Category spending tracking

### Off-Chain Data (Firestore)

- User profiles and authentication
- Detailed emergency event information
- Beneficiary personal information
- Vendor business information
- Transaction descriptions and metadata
- Audit logs with user details
- Images, documents, and media files
- Administrative operations logs

## Security Considerations

### Smart Contract Security

- Role-based access control with granular permissions
- Spending limits and category restrictions
- Emergency pause functionality
- Reentrancy protection
- Input validation and sanitization
- Proper error handling
- Access control modifiers

### System Security

- Separation of on-chain and off-chain data
- Secure wallet integration
- Firebase authentication and security rules
- Role-based access control in both on-chain and off-chain components
- Comprehensive audit logging

## Contract Interactions

### EmergencyReliefManager → EmergencyReliefStablecoin

- Minting tokens for beneficiaries
- Setting spending limits
- Setting category limits
- Whitelisting beneficiaries and vendors
- Processing vendor spending operations

### EmergencyReliefStablecoin (Independent Operations)

- Accepting ERC-20 token donations
- Enforcing spending rules
- Maintaining audit logs
- Managing whitelists

## Event System for Audit Tracking

### EmergencyReliefStablecoin Events

- `SpendingLimitSet`: When spending limits are set for beneficiaries
- `CategoryLimitSet`: When category limits are updated
- `CategorySpent`: When vendors spend funds on behalf of beneficiaries
- `BeneficiaryWhitelisted`: When beneficiaries are added/removed from whitelist
- `VendorWhitelisted`: When vendors are added/removed from whitelist
- `FundsDonated`: When ERC-20 tokens are donated
- `EmergencyPause`: When contract is paused/unpaused

### EmergencyReliefManager Events

- `DonorAdded`: When donors are registered
- `BeneficiaryAdded`: When beneficiaries are registered
- `VendorAdded`: When vendors are registered
- `FundsDeposited`: When ETH funds are deposited
- `BeneficiaryWhitelisted`: When beneficiaries are whitelisted for events
- `VendorWhitelisted`: When vendors are whitelisted
- `FundsDistributed`: When funds are distributed to beneficiaries
- `EmergencyEventCreated`: When emergency events are created
- `FundsSpent`: When vendors spend funds
- `ERC20DonationReceived`: When ERC-20 tokens are donated
- `EmergencyPause`: When operations are paused/unpaused

## Integration with Frontend/Backend

### Frontend Integration (React + ethers.js)

- Wallet connection via MetaMask
- Contract interaction through ethers.js
- Firebase authentication for user management
- Firestore for off-chain data retrieval
- Real-time updates for both on-chain and off-chain data

### Backend Integration (Node.js + Express.js)

- Firebase Admin SDK for authentication and database access
- Ethereum event listeners for syncing on-chain data to Firestore
- API endpoints for complex operations
- Administrative interfaces for operators
- Audit trail maintenance

## Deployment Strategy

### Smart Contracts

- Deploy EmergencyReliefStablecoin first
- Deploy EmergencyReliefManager with the stablecoin address
- Configure roles for operators and administrators
- Verify contracts on Etherscan for transparency

### Backend Services

- Set up Firebase project with authentication and Firestore
- Configure security rules for data access
- Deploy Node.js/Express server with event listeners
- Set up administrative interfaces

### Frontend

- Configure environment variables for contract addresses
- Set up Firebase configuration
- Implement wallet connection and contract interaction
- Create user interfaces for all system roles

This architecture provides a secure, transparent, and efficient platform for emergency relief operations, combining the benefits of blockchain technology with the flexibility of traditional web technologies.
