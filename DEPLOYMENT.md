# Vercel Deployment Guide

This guide will help you deploy both the frontend and backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database**: Set up a MySQL database (PlanetScale, Railway, or similar)

## Backend Deployment

### 1. Database Setup

- Set up a MySQL database (recommended: PlanetScale)
- Get your database connection string

### 2. Deploy Backend to Vercel

1. **Connect Repository**:

   - Go to Vercel Dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Select the `backend` folder

2. **Configure Build Settings**:

   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `./`
   - **Install Command**: `npm install`

3. **Environment Variables**:
   Add these in Vercel dashboard:

   ```
   DATABASE_URL=mysql://username:password@host:port/database_name
   JWT_SECRET=your_secure_jwt_secret_here
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployment URL

## Frontend Deployment

### 1. Update Environment Variables

1. **Create `.env` file** in frontend directory:
   ```env
   VITE_API_BASE=https://your-backend-domain.vercel.app
   VITE_NEWUSER=https://your-backend-domain.vercel.app/users/register
   VITE_LOGIN=https://your-backend-domain.vercel.app/users/login
   VITE_LOGOUT=https://your-backend-domain.vercel.app/users/logout
   VITE_PROFILE=https://your-backend-domain.vercel.app/users/profile
   VITE_UPDATE_PROFILE=https://your-backend-domain.vercel.app/users/update-profile
   VITE_NEWORDER=https://your-backend-domain.vercel.app/orders
   VITE_ORDERS=https://your-backend-domain.vercel.app/orders
   VITE_ORDERS_BY_USERID=https://your-backend-domain.vercel.app/orders/user/
   VITE_UPLOAD_URL=https://your-backend-domain.vercel.app/uploads/
   ```

### 2. Deploy Frontend to Vercel

1. **Connect Repository**:

   - Go to Vercel Dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder

2. **Configure Build Settings**:

   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**:
   Add the same environment variables as in the `.env` file

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

## Post-Deployment

### 1. Update CORS in Backend

After getting your frontend URL, update the backend CORS configuration:

```javascript
// In backend/index.js
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.vercel.app", "http://localhost:5173"]
        : "http://localhost:5173",
    credentials: true,
  })
);
```

### 2. Redeploy Backend

- Go to your backend project in Vercel
- Click "Redeploy" to apply CORS changes

## Database Setup

### PlanetScale (Recommended)

1. **Create Database**:

   - Sign up at [planetscale.com](https://planetscale.com)
   - Create a new database
   - Get your connection string

2. **Run Migrations**:
   - The backend will automatically sync the database on startup
   - Tables will be created automatically

### Alternative: Railway

1. **Create Database**:
   - Sign up at [railway.app](https://railway.app)
   - Create a new MySQL database
   - Get your connection string

## Environment Variables Reference

### Backend Variables

```env
DATABASE_URL=mysql://username:password@host:port/database_name
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app
PORT=3000
```

### Frontend Variables

```env
VITE_API_BASE=https://your-backend-domain.vercel.app
VITE_NEWUSER=https://your-backend-domain.vercel.app/users/register
VITE_LOGIN=https://your-backend-domain.vercel.app/users/login
VITE_LOGOUT=https://your-backend-domain.vercel.app/users/logout
VITE_PROFILE=https://your-backend-domain.vercel.app/users/profile
VITE_UPDATE_PROFILE=https://your-backend-domain.vercel.app/users/update-profile
VITE_NEWORDER=https://your-backend-domain.vercel.app/orders
VITE_ORDERS=https://your-backend-domain.vercel.app/orders
VITE_ORDERS_BY_USERID=https://your-backend-domain.vercel.app/orders/user/
VITE_UPLOAD_URL=https://your-backend-domain.vercel.app/uploads/
```

## Troubleshooting

### Common Issues

1. **CORS Errors**:

   - Ensure CORS_ORIGIN is set correctly
   - Check that frontend URL is included in backend CORS configuration

2. **Database Connection**:

   - Verify DATABASE_URL is correct
   - Check database credentials
   - Ensure database is accessible from Vercel

3. **Build Errors**:

   - Check Node.js version (should be >= 18)
   - Verify all dependencies are installed
   - Check for syntax errors in code

4. **Environment Variables**:
   - Ensure all variables are set in Vercel dashboard
   - Check variable names match exactly
   - Verify no extra spaces or quotes

### Health Check

Test your backend deployment:

```
https://your-backend-domain.vercel.app/health
```

Should return:

```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity
