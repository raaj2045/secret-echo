# Secret Echo Backend API

Backend API for the "Secret Echo" application, a 1-to-1 real-time messaging platform with simulated AI responses.

## Technologies Used

- **Node.js & Express**: Web server and API framework
- **MongoDB & Mongoose**: Database and ODM
- **Socket.io**: Real-time bidirectional communication
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Jest**: Testing framework with 99%+ coverage
- **Express Rate Limit**: Request limiting middleware

## Features

- **User Authentication**
  - User registration and login
  - JWT-based access tokens
  - Password hashing with bcrypt
  - Protected routes middleware

- **Real-time Messaging**
  - Direct 1-to-1 message delivery
  - Message persistence
  - AI response generation
  - Typing indicators

- **Message History**
  - Retrieve user message history
  - Mark messages as read
  - Delete messages

## Setup

### Prerequisites

- Node.js v18+
- MongoDB (local instance or Atlas)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/secret-echo.git
   cd secret-echo/backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/secret-echo
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

### Running the Application

#### Development Mode
```
npm run dev
```

#### Production Mode
```
npm start
```

#### Running Tests
```
npm test
```

## API Documentation

### Authentication

#### Register a new user
- **POST** `/api/auth/register`
- **Body**: `{ username, email, password }`
- **Response**: `{ token, user: { id, username, email } }`

#### Login
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ token, user: { id, username, email } }`

#### Get current user
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer TOKEN`
- **Response**: `{ user: { id, username, email } }`

### Messages

#### Get user messages
- **GET** `/api/messages`
- **Headers**: `Authorization: Bearer TOKEN`
- **Response**: `{ messages: [{ id, sender, content, createdAt, isRead }] }`

#### Send message
- **POST** `/api/messages`
- **Headers**: `Authorization: Bearer TOKEN`
- **Body**: `{ content, receiver }`
- **Response**: `{ message: { id, sender, content, createdAt, isRead } }`

#### Mark messages as read
- **PUT** `/api/messages/read`
- **Headers**: `Authorization: Bearer TOKEN`
- **Body**: `{ messageIds: [id1, id2, ...] }`
- **Response**: `{ success: true, count: n }`

#### Delete message
- **DELETE** `/api/messages/:id`
- **Headers**: `Authorization: Bearer TOKEN`
- **Response**: `{ success: true }`

## Architecture

The backend follows a modular architecture with clear separation of concerns:

### Directory Structure
```
backend/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API route definitions
├── socket/          # Socket.io handlers
├── tests/           # Jest tests
│   ├── controllers/ # Controller tests
│   ├── middleware/  # Middleware tests 
│   └── utils/       # Utility tests
└── utils/           # Utility functions
```

### Models
- **User**: Authentication and profile data
- **Message**: Chat messages with sender, receiver, content, and read status

### Controllers
- **authController**: Handles user registration, login, and profile data
- **messageController**: Manages message creation, retrieval, and updates

### Socket Implementation
The application uses Socket.io for real-time features:
- Direct messaging between user and AI
- Typing indicators
- Connection management
- Authentication with JWT

### AI Response System
The AI responder generates replies based on user input:
- Pattern-based response selection
- Fallback responses for unmatched patterns
- Direct 1-to-1 message delivery
- Simulated typing indicators

## Security Features

- **JWT Authentication**: All protected routes require a valid JWT token
- **Password Hashing**: User passwords are hashed using bcrypt
- **Rate Limiting**: API endpoints are protected from brute force attacks
- **Input Validation**: All user inputs are validated
- **Error Handling Middleware**: Centralized error handling

## Testing

The backend has comprehensive test coverage (99%+) using Jest:
- **Unit Tests**: Controllers, middleware, utilities
- **Integration Tests**: API endpoints and database interactions
- **Security Tests**: Authentication and authorization
- **Error Handling Tests**: Validation of error responses

Run tests with code coverage report:
```
npm test -- --coverage
```

## Error Handling

The application uses a centralized error handling middleware that:
- Formats error responses consistently
- Handles different types of errors (validation, authentication, etc.)
- Sets appropriate HTTP status codes
- Provides helpful error messages in development
- Sanitizes error details in production 