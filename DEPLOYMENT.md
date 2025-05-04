# Secret Echo Deployment Guide

This guide details how to deploy the Secret Echo application using Vercel for the frontend and Render for the backend.

## Deploying the Backend to Render

1. **Sign up for Render**:
   - Go to [Render.com](https://render.com/) and create an account
   - Connect your GitHub account

2. **Create a New Web Service**:
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Choose the repository containing your Secret Echo project

3. **Configure the Web Service**:
   - Name: `secret-echo-backend`
   - Root Directory: `backend` (important!)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

4. **Add Environment Variables**:
   - Click "Environment" tab and add the following variables:
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (Render will override this, but include it anyway)
     - `JWT_SECRET`: (generate a long, random string)
     - `MONGODB_URI`: (your MongoDB Atlas connection string)

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for the deployment to complete
   - Note the URL provided (e.g., `https://secret-echo-backend.onrender.com`)

## Deploying the Frontend to Vercel

1. **Sign up for Vercel**:
   - Go to [Vercel.com](https://vercel.com/) and create an account
   - Connect your GitHub account

2. **Import the Repository**:
   - Click "Add New..." -> "Project"
   - Select your Secret Echo repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: `frontend` (important!)

3. **Add Environment Variables**:
   - Click "Environment Variables" and add:
     - `NEXT_PUBLIC_API_URL`: (your Render backend URL)
     - `NEXT_PUBLIC_SOCKET_URL`: (your Render backend URL)

4. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete

## Post-Deployment Configuration

1. **Update CORS in Backend**:
   - If your Vercel domain wasn't included in the CORS configuration:
   - Go to Render → secret-echo-backend → Environment
   - Add your Vercel domain to the allowed origins

2. **Test the Connection**:
   - Visit your Vercel app URL
   - Register an account
   - Test the real-time messaging features

## Troubleshooting

1. **WebSocket Connection Issues**:
   - Check browser console for errors
   - Ensure CORS is correctly configured in the backend
   - Verify your Socket.io URLs are correct

2. **MongoDB Connection Issues**:
   - Ensure your MongoDB Atlas IP allowlist includes Render's IPs
   - Check Render logs for connection errors

3. **Frontend Can't Connect to Backend**:
   - Verify environment variables are correctly set in Vercel
   - Check that backend is running properly
   - Make sure APIs are correctly formatted (/api/auth, etc.)

## Maintenance Notes

- **Free Tier Limitations**:
  - Render free tier may "sleep" after inactivity
  - The first request might be slow (30-60 seconds) after inactivity
  - For a fully production-ready solution, consider upgrading to paid plans

- **Monitoring**:
  - Both Vercel and Render provide basic logs and metrics
  - Check dashboards regularly for service health 