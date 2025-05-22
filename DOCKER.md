# Docker Setup for Railway Deployment

This guide will help you deploy the Real-Time To-Do List Application on [Railway](https://railway.app).

## Railway Deployment Options

You have multiple options for deploying your application on Railway:

### Option 1: Deploy as Separate Services (Recommended)

This approach deploys the client, server, and database as separate services on Railway.

1. **Database Service**:
   - Add a PostgreSQL plugin from Railway's dashboard
   - Railway will automatically provision a PostgreSQL database and provide connection details

2. **Backend Service**:
   - Create a new service in Railway
   - Connect your GitHub repository
   - Set the Dockerfile path to `server/Dockerfile` 
   - Set the following environment variables:
     ```
     NODE_ENV=production
     PORT=5000
     CLIENT_URL=https://your-frontend-service.railway.app
     ```
   - The PostgreSQL variables will be automatically linked if you use the Railway PostgreSQL plugin

3. **Frontend Service**:
   - Create another service in Railway
   - Connect the same GitHub repository
   - Set the Dockerfile path to `client/Dockerfile`
   - Set the `REACT_APP_SOCKET_URL` environment variable to your backend service URL
     (e.g., `https://your-backend-service.railway.app`)
   - **Important**: When changing this variable, you must trigger a new build for changes to take effect

### Option 2: Deploy as a Single Service

This approach deploys the client and server as a single service, with a separate database.

1. **Database Service**:
   - Add a PostgreSQL plugin as described above

2. **Combined Client/Server Service**:
   - Create a new service in Railway
   - Connect your GitHub repository
   - Set the Dockerfile path to the root `Dockerfile`
   - Configure the environment variables as listed in Option 1's Backend Service
   
## Important Considerations

1. **Database Initialization**:
   - The first time you deploy, you'll need to initialize your database schema
   - You can use Railway's PostgreSQL plugin to execute the SQL statements in `server/db_setup.sql`

2. **Environment Variables**:
   - Railway automatically injects PostgreSQL connection details that you can use in your application
   - These get mapped to environment variables like `PGUSER`, `PGPASSWORD`, etc.
   - Make sure your server's db connection is configured to read from these environment variables

3. **Custom Domains**:
   - Railway allows you to set up custom domains for your services
   - If you use a custom domain, update the `CLIENT_URL` environment variable accordingly

4. **Persistent Storage**:
   - Railway PostgreSQL plugin handles persistent storage for your database

## Monitoring & Logs

Railway provides built-in monitoring and logging capabilities:

- View logs from the Railway dashboard
- Monitor service health and resource usage
- Set up alerts for service downtime or high resource usage

## Updating Your Deployment

When you push changes to your GitHub repository, Railway will automatically rebuild and redeploy your services.

## Troubleshooting

### 502 Bad Gateway Errors

If you're seeing a 502 Bad Gateway error when accessing your frontend application, check the following:

1. **Backend Connectivity**: Make sure your backend service is running correctly. Check Railway logs for any errors.

2. **Environment Variables**: Ensure the `REACT_APP_SOCKET_URL` environment variable is set correctly in your frontend service.
   - It should be the full URL of your backend service (e.g., `https://your-backend-service.railway.app`)
   - Make sure there are no trailing slashes
   - If using a custom domain, use that URL

3. **CORS Configuration**: Check that the backend's `CLIENT_URL` environment variable is set correctly to allow requests from your frontend.

4. **Railway Service Health**: Check the Railway dashboard to make sure both services are healthy and running.

### WebSocket Connection Errors

If real-time features aren't working:

1. **Check Browser Console**: Look for WebSocket connection errors in your browser's developer console.

2. **Secure WebSockets**: If your frontend is served over HTTPS, your WebSocket connection must use WSS (secure WebSockets). Make sure the `REACT_APP_SOCKET_URL` starts with `https://` not `http://`.

3. **Network Rules**: Railway should automatically handle WebSocket connections, but verify there are no network rules blocking WebSocket traffic.

### Database Connection Issues

If your backend can't connect to the database:

1. **Environment Variables**: Verify that the PostgreSQL environment variables from Railway are correctly connected to your backend service.

2. **Database Initialization**: Make sure your database schema has been properly initialized with the necessary tables.
