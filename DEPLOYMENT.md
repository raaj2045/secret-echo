# Secret Echo Deployment Guide

This guide details how to deploy the Secret Echo application using Vercel for both frontend and backend.

## Deploying the Backend to Vercel

1. **Sign up for Vercel**:
   - Go to [Vercel.com](https://vercel.com/) and create an account
   - Connect your GitHub account

2. **Import the Repository**:
   - Click "Add New..." -> "Project"
   - Select your Secret Echo repository
   - Configure the project:
     - Framework Preset: Other
     - Root Directory: `backend` (important!)
     - Build Command: `npm install`
     - Output Directory: Leave empty
     - Development Command: `npm run dev`

3. **Add Environment Variables**:
   - Click "Environment Variables" and add:
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: (generate a long, random string)
     - `MONGODB_URI`: (your MongoDB Atlas connection string)

4. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete
   - Note the URL provided (e.g., `https://secret-echo-backend.vercel.app`)

## Deploying the Frontend to Vercel

1. **Return to Vercel Projects**:
   - Go to your Vercel dashboard

2. **Import the Repository Again**:
   - Click "Add New..." -> "Project"
   - Select the same repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: `frontend` (important!)

3. **Add Environment Variables**:
   - Click "Environment Variables" and add:
     - `NEXT_PUBLIC_API_URL`: (your backend Vercel URL)
     - `NEXT_PUBLIC_SOCKET_URL`: (your backend Vercel URL)

4. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete

## Vercel Configuration Files

The project contains two important configuration files for Vercel:

1. **backend/vercel.json**: Configures the Node.js backend service
   - Routes API requests to the correct handlers
   - Sets up build commands for the backend

2. **frontend/vercel.json**: Configures the Next.js frontend application
   - Specifies framework and build commands
   - Manages output directory

## Post-Deployment Configuration

1. **Update CORS in Backend**:
   - If needed, update CORS settings in the backend
   - Your backend automatically allows requests from all Vercel domains

2. **Test the Connection**:
   - Visit your frontend Vercel URL
   - Register an account
   - Test the real-time messaging features

## Troubleshooting

1. **WebSocket Connection Issues**:
   - Note that Vercel is primarily for HTTP, not WebSockets
   - Socket.io will automatically fall back to HTTP long-polling
   - For optimal WebSocket performance, consider a dedicated WebSocket provider

2. **MongoDB Connection Issues**:
   - Ensure your MongoDB Atlas IP allowlist allows connections from anywhere (0.0.0.0/0)
   - Check Vercel Function logs for connection errors

3. **Frontend Can't Connect to Backend**:
   - Verify environment variables are correctly set
   - Check that backend is running properly
   - Make sure APIs are correctly formatted (/api/auth, etc.)

## Maintenance Notes

- **Vercel Free Tier Limitations**:
  - Serverless functions timeout after 10 seconds
  - Limited execution time per function
  - Cold starts may cause initial request delays
  - Suitable for demonstrations and low-traffic applications

- **Monitoring**:
  - Vercel provides logs and basic analytics
  - Check Vercel dashboard regularly for service health 