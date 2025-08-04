# Copilot Instructions for This Codebase

## Architecture Overview
- This project is a full-stack web application with a React/Vite frontend and a Node.js/Express backend.
- Backend (`backend/`):
  - Main entry: `backend/index.js` (Express server setup)
  - User management: `backend/Controllers/users.js` (user creation, image upload, login)
  - Routes: `backend/Routes/users.js` (RESTful endpoints for user CRUD and login)
  - Database: Sequelize ORM, models in `backend/models/`
  - File uploads: Multer for profile images, stored in `backend/uploads/profiles/`
- Frontend (`frontend/`):
  - Main entry: `frontend/src/main.jsx` (React/Vite)
  - Pages: `frontend/src/pages/` (e.g., `Login.jsx`, `Signup.jsx`)
  - Components: `frontend/src/components/` (e.g., `Navbar.jsx`)
  - Static assets: `frontend/public/`

## Developer Workflows
- **Backend:**
  - Start server: `npx nodemon backend/index.js` (auto-restarts on changes)
  - Install dependencies: `npm install` in `backend/`
  - Database: Sequelize, configured in `backend/util/db.js`
- **Frontend:**
  - Start dev server: `npm run dev` in `frontend/`
  - Install dependencies: `npm install` in `frontend/`
  - Environment variables: use `.env` files in both frontend and backend

## Project-Specific Patterns
- **User Creation & Image Upload:**
  - Use `usersController.newUser` (or `createUser`) with Multer middleware for file uploads
  - Images are processed with Sharp and saved as WebP in `uploads/profiles/{userId}/profile.webp`
  - Image path is returned as `/uploads/profiles/{userId}/profile.webp` for frontend display
- **Login:**
  - `usersController.loginUser` handles authentication
  - No session or localStorage logic; frontend simply alerts on success
- **Routes:**
  - RESTful conventions: `/new` (create), `/getall` (list), `/delete/:id` (delete), `/login` (auth)
- **Error Handling:**
  - API responses use `{ success, message, ... }` JSON format
  - Frontend displays alerts for success/failure

## Integration Points
- **Frontend/Backend Communication:**
  - Use Axios for API calls
  - Profile images are accessed via backend static route `/uploads`
- **External Dependencies:**
  - Backend: Express, Sequelize, Multer, Sharp, Bcrypt
  - Frontend: React, Vite, Axios, Lucide-react (icons)

## Examples
- To create a user with image:
  ```js
  usersRouter.post("/new", usersController.uploadMiddleware, usersController.newUser);
  ```
- To display a user avatar:
  ```jsx
  <img src={`http://localhost:3000${user.profile_image}`} ... />
  ```

## Key Files
- `backend/Controllers/users.js` — user logic, image upload
- `backend/Routes/users.js` — API endpoints
- `frontend/src/pages/Login.jsx` — login logic
- `frontend/src/pages/Signup.jsx` — signup logic
- `frontend/src/components/Navbar.jsx` — avatar display

---

If any section is unclear or missing, please provide feedback to improve these instructions.
