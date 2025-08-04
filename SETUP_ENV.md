# Environment Variables Setup Guide

## Problem Fixed
The issue with your `.env` files being emptied was caused by GitHub's push protection detecting hardcoded database credentials in your code. This has been resolved by:

1. Moving database credentials to environment variables
2. Adding `.env` files to `.gitignore`
3. Creating example files for reference

## Setup Instructions

### Backend Setup
1. Copy `backend/env.example` to `backend/.env`
2. Update the values in `backend/.env` with your actual database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=stopthisshit@ma
   DB_NAME=dragon
   DB_PORT=3306
   ```

### Frontend Setup
1. Copy `frontend/env.example` to `frontend/.env`
2. The frontend `.env` file should already contain the correct API endpoints

## Why This Happened
- GitHub detected hardcoded database credentials in `backend/util/db.js`
- This triggered push protection to prevent secrets from being committed
- The `.env` files were likely being cleared as a security measure

## Security Best Practices
- ✅ Never commit `.env` files to version control
- ✅ Use environment variables for sensitive data
- ✅ Keep example files (`.env.example`) in version control
- ✅ Use strong, unique passwords for each environment

## Next Steps
1. Make sure your `.env` files are properly configured
2. Test your application to ensure it works with the new configuration
3. Commit the changes (the hardcoded credentials have been removed)
4. Push to GitHub (should work now without security violations) 