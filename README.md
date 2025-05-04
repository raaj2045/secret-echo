# Secret Echo

A real-time 1-to-1 messaging application with simulated AI responses, built with a MERN stack.

## Overview

Secret Echo is a full-stack messaging application that simulates conversations with an AI assistant. It features a responsive React frontend, an Express backend, and real-time communication via Socket.io. The application is designed for 1-to-1 conversations between users and the AI.

![Screenshot: Secret Echo](https://via.placeholder.com/800x450?text=Secret+Echo+Screenshot)

## Features

- **User Authentication**
  - JWT-based login and registration
  - Secure password hashing with bcrypt
  - Protected routes
  - Rate limiting for auth endpoints

- **Real-time Messaging**
  - Instant message delivery
  - Typing indicators
  - Optimistic UI updates
  - Chat history persistence
  - Local storage fallback when offline

- **AI Response System**
  - Pattern-based AI responses
  - Simulated typing delay
  - Fallback responses
  - Direct 1-to-1 communication

- **Modern UI**
  - Responsive design
  - Dark mode support
  - Loading indicators
  - Toast notifications

- **Production Ready**
  - Comprehensive test coverage (99%+)
  - Error handling
  - Rate limiting
  - Secure authentication
  - Socket reconnection with fallbacks

## Project Structure

The project is divided into two main parts:

- **Frontend**: Next.js application with React components and hooks
- **Backend**: Express.js REST API with Socket.io integration

```
secret-echo/
├── frontend/           # Next.js React application
│   ├── app/            # Application code
│   │   ├── (auth)/     # Authentication pages
│   │   ├── (chat)/     # Chat pages
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React contexts
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
│
└── backend/            # Express.js API
    ├── controllers/    # Request handlers
    ├── middleware/     # Express middleware
    ├── models/         # Mongoose models
    ├── routes/         # API route definitions
    ├── socket/         # Socket.io setup
    ├── tests/          # Unit tests (99%+ coverage)
    └── utils/          # Utility functions
```

## Architecture Diagram

The following diagram illustrates the overall architecture of the Secret Echo application:

![Architecture Diagram](./docs/images/architecture-diagram.png)

## Technologies Used

### Frontend
- Next.js 15.x (React 19.x)
- Tailwind CSS
- Socket.io Client
- Axios
- JWT Decode
- React Hot Toast

### Backend
- Node.js
- Express
- MongoDB Atlas (Cloud Database)
- Socket.io
- JSON Web Tokens
- bcrypt
- Express Rate Limit
- Jest (testing)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/secret-echo.git
   cd secret-echo
   ```

2. Install backend dependencies
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

4. Set up environment variables
   - Create `.env` file in the backend directory
   - Create `.env.local` file in the frontend directory
   - See example files for required variables

### Running the Application

1. Start the backend server
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Docker Setup

You can also run the entire application using Docker:

1. Make sure you have Docker and Docker Compose installed on your system

2. Create a `.env` file in the root directory with your environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_PORT=3001
   BACKEND_PORT=5000
   NODE_ENV=development
   ```
   (See `docs/env.example` for a template)

3. Build and start all services:
   ```
   docker-compose up
   ```

4. Access the application at http://localhost:3001

5. For production deployment:
   ```
   NODE_ENV=production docker-compose -f docker-compose.yml up -d
   ```

6. To stop all containers:
   ```
   docker-compose down
   ```

## Architecture Decisions

### Authentication Flow
The application uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests via Axios interceptors. The AuthContext manages the global authentication state. Rate limiting is applied to auth endpoints for security.

### Real-time Communication
Socket.io is used for real-time message delivery and typing indicators. The server maintains a list of connected users, and messages are sent directly to the specific user's room. Socket connections include reconnection logic for better reliability.

### AI Response System
AI responses are generated using a pattern-matching system. User messages are analyzed for keywords, and appropriate responses are selected from predefined categories. If no pattern matches, a fallback response is used. The system includes delays to simulate realistic typing behavior.

### Database Schema
The application uses MongoDB with Mongoose for data persistence. The main collections are:
- Users: Authentication and profile information
- Messages: Chat history with sender, receiver, and content

### Testing Approach
The backend has comprehensive unit test coverage (99%+) using Jest. Tests cover:
- Controllers (auth, messages)
- Middleware (error handling, authentication)
- Utilities (AI responder)
- Socket functionality

## Performance Optimizations

- Debounced localStorage writes for message history
- Optimistic UI updates for message sending
- Efficient socket message handling
- Simplified code with removal of unused features
- Direct 1-to-1 messaging without unnecessary broadcasting

## Trade-offs and Limitations

- **AI Response System**: The pattern-based AI responses are simulated and have limited understanding capabilities compared to advanced models like GPT.
- **Scalability**: The current implementation is designed for moderate user loads. For high-scale deployments, additional considerations would be needed:
  - Database sharding or read replicas
  - Load balancing for the Socket.io connections
  - Redis for shared socket state in multi-server deployments
- **Offline Support**: While the application stores messages locally when offline, full offline functionality is limited.
- **Authentication**: Uses simple JWT tokens without refresh token mechanism, which means longer sessions require re-authentication.
- **Message History**: There's no pagination implemented for very long conversations, which could affect performance with extensive chat histories.
- **Testing**: While backend test coverage is extensive (99%+), frontend component testing is more limited.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 