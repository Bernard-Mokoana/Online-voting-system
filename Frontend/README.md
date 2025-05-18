# Online Voting System - Frontend

This is the frontend application for the Online Voting System, built with React, Vite, and Tailwind CSS.

## Features

- Modern, responsive UI
- User authentication
- Role-based access control
- Election management
- Candidate management
- Voting interface
- Results visualization
- Real-time updates
- Form validation
- Error handling
- Loading states

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd Frontend
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

- Set the API base URL
- Configure other environment variables as needed

## Development

Start the development server:

```bash
npm run dev
```

The application will start on `http://localhost:5173` by default.

## Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API configuration and endpoints
├── components/       # Reusable UI components
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── layouts/         # Layout components
├── pages/           # Page components
├── styles/          # Global styles
├── utils/           # Utility functions
└── App.jsx          # Root component
```

## Components

### Authentication

- `LoginRegister.jsx` - Login and registration form
- `ForgotPassword.jsx` - Password reset request form
- `ResetPassword.jsx` - Password reset form

### User

- `Profile.jsx` - User profile management
- `VotingHistory.jsx` - User's voting history

### Election

- `ElectionList.jsx` - List of elections
- `ElectionDetails.jsx` - Election details and voting
- `ElectionForm.jsx` - Create/edit election form
- `Results.jsx` - Election results visualization

### Admin

- `Dashboard.jsx` - Admin dashboard
- `UserManagement.jsx` - User management interface
- `ElectionManagement.jsx` - Election management interface
- `CandidateManagement.jsx` - Candidate management interface

## API Integration

The frontend uses a centralized API configuration in `src/api/axios.js` that includes:

- Base URL configuration
- Request/response interceptors
- Token management
- Error handling
- Request/response logging

## Styling

The application uses:

- Tailwind CSS for utility-first styling
- Custom components for complex UI elements
- Responsive design for all screen sizes
- Dark mode support

## Testing

Run tests:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
