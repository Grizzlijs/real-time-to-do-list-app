# Railway Deployment Guide

This guide provides step-by-step instructions for deploying the Todo List application on Railway.com.

## Deployment Steps

### 1. Frontend Deployment

1. Create a new Railway service
2. Connect to your GitHub repository
3. Set the Dockerfile path to `client/Dockerfile`
4. Add the following environment variable:
   ```
   RAILWAY_DOCKERFILE_PATH=client/Dockerfile
   ```
5. Add the Socket URL environment variable:
   ```
   REACT_APP_SOCKET_URL=https://your-backend-url.railway.app
   ```
   Replace `your-backend-url.railway.app` with your actual backend service URL

### 2. Backend Deployment

1. Create another Railway service
2. Connect to the same GitHub repository 
3. Set the Dockerfile path to `server/Dockerfile`
4. Add the following environment variable:
   ```
   RAILWAY_DOCKERFILE_PATH=server/Dockerfile
   ```
5. Configure your backend environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-frontend-url.railway.app
   ```
   Replace `your-frontend-url.railway.app` with your actual frontend service URL or custom domain
   
6. The PostgreSQL connection variables should be automatically linked if you're using Railway's PostgreSQL plugin.

### 3. Database Setup

1. Add the PostgreSQL plugin to your Railway project
2. Link it to your backend service
3. Run the database initialization SQL:
   - Navigate to the PostgreSQL plugin in Railway
   - Use the SQL Editor tab
   - Copy and paste the contents of `server/db_setup.sql`
   - Execute the SQL to create your tables

## Important Notes

1. **Railway Automatic Variables**: Railway automatically provides database connection variables when you link a PostgreSQL plugin with names like `PGUSER`, `PGPASSWORD`, etc. Our server is configured to use these variables.

2. **Frontend Rebuilds**: When changing the `REACT_APP_SOCKET_URL`, you need to trigger a new build of the frontend service for the changes to take effect. You can do this by either:
   - Making a small change to the repository and pushing it
   - Using Railway's "Redeploy" button in the service dashboard

3. **Environment Variable Naming**: Railway will automatically expose environment variables set in the dashboard to your container. Make sure the names match exactly what your application expects.

4. **Custom Domains**: If you set up custom domains in Railway, remember to update the corresponding environment variables:
   - Update `CLIENT_URL` in the backend service
   - Update `REACT_APP_SOCKET_URL` in the frontend service and trigger a rebuild

## Troubleshooting

If your deployment encounters issues:

1. **Check the logs**: Railway provides detailed logs for each service
2. **Verify environment variables**: Make sure all required environment variables are set correctly
3. **Check for build errors**: Look for any errors during the build process
4. **Restart the service**: Sometimes simply restarting the service can resolve issues
