# Online Voting System

A secure and modern online voting system built with React, Node.js, and PostgreSQL.

## Overview

This project provides a complete solution for conducting online elections, featuring:

- Secure user authentication and authorization
- Role-based access control (Admin, Voter)
- Election management and creation
- Candidate management
- Real-time voting system
- Results tracking and visualization
- Audit logging
- Email verification
- Password reset functionality

## Project Structure

```
.
├── Frontend/         # React frontend application
├── Backend/          # Node.js backend server
└── README.md         # This file
```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd Backend
```

2. Install dependencies:

```bash
npm install
```

3. Create and configure environment variables:

```bash
cp .env.example .env
```

4. Create the database:

```bash
createdb online_voting_system
```

5. Run database migrations:

```bash
npm run migrate
```

6. Start the development server:

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create and configure environment variables:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

The frontend application will start on `http://localhost:5173`.

## Features

### Authentication

- User registration and login
- Email verification
- Password reset
- JWT-based authentication
- Session management

### User Management

- Profile management
- Role-based access control
- Voting history
- Account deletion

### Election Management

- Create and manage elections
- Set election parameters
- Manage candidates
- Track election status
- View results

### Voting System

- Secure vote casting
- Vote verification
- Real-time results
- Audit logging
- Prevention of double voting

### Admin Features

- User management
- Election management
- Candidate management
- System monitoring
- Reports generation

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure password reset flow
- Email verification

## API Documentation

The API documentation is available in the backend README file. It includes detailed information about:

- Authentication endpoints
- User management endpoints
- Election management endpoints
- Voting endpoints
- Admin endpoints

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Testing

### Backend Tests

```bash
cd Backend
npm test
```

### Frontend Tests

```bash
cd Frontend
npm test
```

## Deployment

### Backend Deployment

1. Build the application:

```bash
cd Backend
npm run build
```

2. Start the production server:

```bash
npm start
```

### Frontend Deployment

1. Build the application:

```bash
cd Frontend
npm run build
```

2. Deploy the contents of the `dist` directory to your web server.

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
