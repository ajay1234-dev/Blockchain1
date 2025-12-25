# Emergency & Disaster Relief Stablecoin System - Firestore Database Schema

## Overview

The Firestore database serves as the off-chain backend for the Emergency & Disaster Relief Stablecoin System. It stores user profiles, emergency events, transactions, and other metadata that complement the on-chain smart contracts.

## Collections Schema

### 1. users

**Description**: Stores user profiles for all system participants (donors, beneficiaries, vendors, operators)

**Document Structure**:

```
users/{userId}
{
  "uid": "string",           // Firebase Auth UID
  "email": "string",         // User's email
  "displayName": "string",   // User's display name
  "role": "string",          // "donor", "beneficiary", "vendor", "operator", "admin"
  "ethereumAddress": "string", // Associated Ethereum address
  "createdAt": "timestamp",  // Account creation time
  "updatedAt": "timestamp",  // Last update time
  "isActive": "boolean",     // Account status
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "organization": "string", // For donors/vendors
    "location": {
      "lat": "number",
      "lng": "number",
      "address": "string"
    },
    "verificationStatus": "string" // "pending", "verified", "rejected"
  }
}
```

### 2. emergency_events

**Description**: Stores information about emergency/disaster events

**Document Structure**:

```
emergency_events/{eventId}
{
  "id": "string",            // Event ID
  "name": "string",          // Event name
  "description": "string",   // Detailed description
  "status": "string",        // "active", "inactive", "completed"
  "targetFunding": "number", // Target funding amount in USD
  "currentFunding": "number", // Current funding amount in USD
  "raisedFunds": "number",   // Amount raised in ERS tokens
  "location": {
    "lat": "number",
    "lng": "number",
    "address": "string",
    "region": "string"
  },
  "category": "string",      // "natural_disaster", "conflict", "health_crisis", etc.
  "organizer": "string",     // UID of event organizer
  "startDate": "timestamp",  // Event start date
  "endDate": "timestamp",    // Event end date (if applicable)
  "createdAt": "timestamp",  // Creation timestamp
  "updatedAt": "timestamp",  // Last update
  "metadata": {
    "images": ["string"],    // URLs to related images
    "documents": ["string"]  // URLs to related documents
  }
}
```

### 3. beneficiaries

**Description**: Stores detailed information about beneficiaries

**Document Structure**:

```
beneficiaries/{beneficiaryId}
{
  "userId": "string",        // Reference to users collection
  "ethereumAddress": "string", // Beneficiary's Ethereum address
  "eventId": "string",       // Associated emergency event
  "status": "string",        // "registered", "approved", "active", "inactive"
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "age": "number",
    "gender": "string",
    "familySize": "number",
    "specialNeeds": "string" // Medical conditions, disabilities, etc.
  },
  "location": {
    "lat": "number",
    "lng": "number",
    "address": "string"
  },
  "reliefPackage": {
    "totalAmount": "number", // Total ERS allocated
    "remainingAmount": "number", // Remaining ERS balance
    "categories": {
      "food": {
        "allocated": "number",
        "spent": "number",
        "remaining": "number"
      },
      "medicine": {
        "allocated": "number",
        "spent": "number",
        "remaining": "number"
      },
      "shelter": {
        "allocated": "number",
        "spent": "number",
        "remaining": "number"
      }
    }
  },
  "distributionHistory": [
    {
      "eventId": "string",
      "amount": "number",
      "timestamp": "timestamp",
      "distributor": "string", // UID of person who distributed
      "transactionHash": "string" // Ethereum transaction hash
    }
  ],
  "verificationStatus": "string", // "pending", "verified", "rejected"
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 4. vendors

**Description**: Stores information about approved vendors

**Document Structure**:

```
vendors/{vendorId}
{
  "userId": "string",        // Reference to users collection
  "ethereumAddress": "string", // Vendor's Ethereum address
  "businessName": "string",  // Business/legal name
  "businessType": "string",  // "grocery", "pharmacy", "construction", etc.
  "licenseInfo": {
    "licenseNumber": "string",
    "issueDate": "timestamp",
    "expiryDate": "timestamp"
  },
  "location": {
    "lat": "number",
    "lng": "number",
    "address": "string"
  },
  "services": ["string"],    // Categories of services provided
  "verificationStatus": "string", // "pending", "verified", "rejected"
  "rating": "number",        // Average rating (0-5)
  "totalTransactions": "number", // Number of transactions completed
  "whitelisted": "boolean",  // Whether vendor is currently whitelisted
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 5. transactions

**Description**: Records all transactions (both on-chain and off-chain events)

**Document Structure**:

```
transactions/{transactionId}
{
  "id": "string",            // Transaction ID
  "type": "string",          // "donation", "distribution", "spending", "refund"
  "from": {
    "type": "string",        // "donor", "contract", "beneficiary"
    "id": "string"           // UID or address of sender
  },
  "to": {
    "type": "string",        // "beneficiary", "vendor", "contract"
    "id": "string"           // UID or address of recipient
  },
  "amount": "number",        // Amount in ERS tokens
  "amountUSD": "number",     // Amount in USD (for reference)
  "category": "string",      // "food", "medicine", "shelter", etc.
  "eventId": "string",       // Associated emergency event
  "description": "string",   // Transaction description
  "ethereumTxHash": "string", // Ethereum transaction hash
  "status": "string",        // "pending", "completed", "failed", "refunded"
  "timestamp": "timestamp",  // Transaction time
  "metadata": {
    "proofOfPurchase": "string", // URL to receipt/image
    "vendorSignature": "string", // Vendor's signature or confirmation
    "beneficiarySignature": "string" // Beneficiary's confirmation
  },
  "createdBy": "string"      // UID of user who initiated transaction
}
```

### 6. donations

**Description**: Tracks donations from donors to the system

**Document Structure**:

```
donations/{donationId}
{
  "id": "string",            // Donation ID
  "donorId": "string",       // Reference to donor in users collection
  "ethereumAddress": "string", // Donor's Ethereum address
  "amount": "number",        // Amount donated in ETH/USD
  "amountERS": "number",     // Amount minted in ERS tokens
  "currency": "string",      // "ETH", "USD", "other"
  "eventId": "string",       // Optional: specific event to donate to
  "anonymous": "boolean",    // Whether donation is anonymous
  "message": "string",       // Optional message from donor
  "ethereumTxHash": "string", // Ethereum transaction hash
  "status": "string",        // "pending", "completed", "failed"
  "timestamp": "timestamp",
  "metadata": {
    "paymentMethod": "string", // "crypto", "fiat", etc.
    "receiptUrl": "string"    // URL to donation receipt
  }
}
```

### 7. audit_logs

**Description**: Comprehensive audit trail for compliance and transparency

**Document Structure**:

```
audit_logs/{logId}
{
  "id": "string",            // Log ID
  "action": "string",        // "user_registration", "fund_distribution", "vendor_approval", etc.
  "actor": {
    "type": "string",        // "user", "system", "contract"
    "id": "string"           // Actor ID
  },
  "target": {
    "collection": "string",  // Collection affected
    "documentId": "string"   // Document ID affected
  },
  "details": {
    "oldValue": "object",    // Previous state (if applicable)
    "newValue": "object",    // New state (if applicable)
    "parameters": "object"   // Action parameters
  },
  "ethereumTxHash": "string", // Associated Ethereum transaction (if any)
  "ipAddress": "string",     // Actor's IP address
  "timestamp": "timestamp",
  "severity": "string"       // "info", "warning", "critical"
}
```

## Security Rules

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Emergency events - read allowed for all, write only for operators/admins
    match /emergency_events/{eventId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['operator', 'admin']);
    }

    // Beneficiaries - read allowed for operators/admins, beneficiaries can read their own
    match /beneficiaries/{beneficiaryId} {
      allow read: if request.auth != null &&
        (request.auth.uid == get(/databases/$(database)/documents/beneficiaries/$(beneficiaryId)).data.userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['operator', 'admin']);
      allow create, update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['operator', 'admin'];
    }

    // Vendors - read allowed for all, write only for operators/admins
    match /vendors/{vendorId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['operator', 'admin'];
    }

    // Transactions - read for users involved, write only for operators/admins
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['operator', 'admin'];
    }

    // Donations - read allowed for all, write only for authenticated users (for their own)
    match /donations/{donationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        request.auth.uid == get(/databases/$(database)/documents/donations/$(donationId)).data.donorId;
    }

    // Audit logs - read/write only for admins
    match /audit_logs/{logId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Indexes

The following composite indexes should be created for optimal query performance:

1. `emergency_events`: status + createdAt (descending)
2. `beneficiaries`: eventId + status
3. `transactions`: eventId + timestamp (descending)
4. `transactions`: to.id + type + timestamp (descending)
5. `donations`: donorId + timestamp (descending)
6. `vendors`: services + verificationStatus
