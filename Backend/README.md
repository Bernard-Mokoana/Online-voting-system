# Online Voting System - Backend

This is the backend service for the Online Voting System, built with Node.js, Express, and PostgreSQL.

## Features

- User authentication and authorization
- Role-based access control (Admin, Voter)
- Election management
- Candidate management
- Voting system
- Results tracking
- Audit logging
- Rate limiting
- Email verification (TODO)
- Password reset functionality (TODO)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd Backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

- Set your database credentials
- Generate a secure JWT secret
- Configure other environment variables as needed

5. Create the database:

```bash
createdb online_voting_system
```

6. Run database migrations:

```bash
npm run migrate
```

## Development

Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

## API Documentation

### Authentication Endpoints

#### Register User

- **POST** `/api/auth/register`
- **Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "idNumber": "ID123456",
  "password": "securePassword123",
  "dateOfBirth": "1990-01-01",
  "phoneNumber": "1234567890"
}
```

- **Response:** `201 Created`

```json
{
  "message": "User registered successfully"
}
```

#### Login

- **POST** `/api/auth/login`
- **Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

- **Response:** `200 OK`

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "voter"
  }
}
```

#### Forgot Password

- **POST** `/api/auth/forgot-password`
- **Request Body:**

```json
{
  "email": "john@example.com"
}
```

- **Response:** `200 OK`

```json
{
  "message": "Password reset instructions sent to your email"
}
```

#### Reset Password

- **POST** `/api/auth/reset-password/:token`
- **Request Body:**

```json
{
  "password": "newSecurePassword123"
}
```

- **Response:** `200 OK`

```json
{
  "message": "Password reset successfully"
}
```

### User Endpoints

#### Get Profile

- **GET** `/api/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "idNumber": "ID123456",
  "dateOfBirth": "1990-01-01",
  "phoneNumber": "1234567890",
  "role": "voter",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Update Profile

- **PUT** `/api/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "9876543210",
  "currentPassword": "oldPassword",
  "newPassword": "newPassword"
}
```

- **Response:** `200 OK`

```json
{
  "message": "Profile updated successfully"
}
```

### Election Endpoints

#### Create Election

- **POST** `/api/elections`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "title": "Student Council Election",
  "description": "Annual student council election",
  "startDate": "2024-03-01T00:00:00Z",
  "endDate": "2024-03-02T00:00:00Z",
  "candidates": [
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "idNumber": "ID789012",
      "party": "Independent",
      "position": "President",
      "imageUrl": "https://example.com/jane.jpg"
    }
  ]
}
```

- **Response:** `201 Created`

```json
{
  "message": "Election created successfully",
  "electionId": 1
}
```

#### Get Election Results

- **GET** `/api/votes/results/:electionId`
- **Response:** `200 OK`

```json
{
  "election": {
    "id": 1,
    "title": "Student Council Election",
    "description": "Annual student council election",
    "startDate": "2024-03-01T00:00:00Z",
    "endDate": "2024-03-02T00:00:00Z",
    "status": "active"
  },
  "candidates": [
    {
      "id": 1,
      "firstName": "Jane",
      "lastName": "Smith",
      "party": "Independent",
      "position": "President",
      "voteCount": 150,
      "votePercentage": 75.5
    }
  ],
  "totalVotes": 150
}
```

### Vote Endpoints

#### Cast Vote

- **POST** `/api/votes`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "electionId": 1,
  "candidateId": 1
}
```

- **Response:** `200 OK`

```json
{
  "message": "Vote recorded successfully"
}
```

#### Get Voting History

- **GET** `/api/votes/history`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

```json
[
  {
    "createdAt": "2024-03-01T12:00:00Z",
    "electionTitle": "Student Council Election",
    "candidateFirstName": "Jane",
    "candidateLastName": "Smith",
    "candidateParty": "Independent"
  }
]
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized

```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "message": "Unauthorized access"
}
```

### 404 Not Found

```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

## Rate Limiting

- Login: 5 attempts per 15 minutes
- Registration: 3 attempts per hour
- Voting: 1 vote per day
- General API: 100 requests per 15 minutes

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- XSS protection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
