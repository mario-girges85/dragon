# Shipping Management System

A comprehensive shipping and delivery management system built with React, Node.js, and MySQL. Features Arabic language support, PDF generation, and real-time order tracking.

## 🚀 Features

- **User Management**: Registration, login, profile management
- **Order Management**: Create, track, and manage shipping orders
- **Arabic Support**: Full RTL layout and Arabic text rendering
- **PDF Generation**: Generate order details in A5 format with Arabic support
- **File Upload**: Package image upload functionality
- **Real-time Tracking**: Order status tracking and updates
- **Responsive Design**: Mobile-friendly interface
- **Admin Panel**: User management and system administration

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation
- **Axios** - HTTP client
- **jsPDF** - PDF generation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Multer** - File upload
- **bcrypt** - Password hashing

## 📁 Project Structure

```
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── util/           # Utility functions
│   │   └── assets/         # Static assets
│   ├── vercel.json         # Vercel configuration
│   └── package.json
├── backend/                 # Node.js backend
│   ├── Controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── util/              # Utility functions
│   ├── uploads/           # File uploads
│   ├── vercel.json        # Vercel configuration
│   └── package.json
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MySQL database
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shipping-management
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your database credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp env.example .env
   # Edit .env with your backend URL
   npm run dev
   ```

4. **Database Setup**
   - Create a MySQL database
   - Update database credentials in `backend/.env`
   - Tables will be created automatically on first run

## 🌐 Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Steps

1. **Backend Deployment**
   - Connect GitHub repository to Vercel
   - Set root directory to `backend`
   - Configure environment variables
   - Deploy

2. **Frontend Deployment**
   - Create new Vercel project
   - Set root directory to `frontend`
   - Update environment variables with backend URL
   - Deploy

## 📋 Environment Variables

### Backend (.env)
```env
DATABASE_URL=mysql://username:password@host:port/database_name
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app
PORT=3000
```

### Frontend (.env)
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

## 🔧 API Endpoints

### Authentication
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `POST /users/logout` - User logout
- `GET /users/profile` - Get user profile
- `PUT /users/update-profile` - Update user profile

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get specific order
- `GET /orders/user/:id` - Get user's orders
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

### Health Check
- `GET /health` - Server health status
- `GET /` - API information

## 📄 PDF Generation

The system includes advanced PDF generation with:
- **A5 Format**: Compact, professional layout
- **Arabic Support**: Proper RTL text rendering
- **Multiple Fonts**: Cairo, Noto Naskh Arabic, Amiri
- **Complete Order Details**: All order information included
- **Creator Information**: Order creator details with address

## 🌍 Arabic Language Support

- **RTL Layout**: Right-to-left text direction
- **Arabic Fonts**: Multiple Arabic font support
- **Date Formatting**: Arabic locale date formatting
- **Status Translations**: Arabic order status labels
- **PDF Rendering**: Proper Arabic text in PDFs

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **CORS Protection**: Cross-origin request protection
- **Input Validation**: Server-side data validation
- **File Upload Security**: Secure file handling

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive tablet layout
- **Desktop Optimization**: Full desktop experience
- **Touch-Friendly**: Mobile touch interactions

## 🧪 Testing

### Backend Health Check
```bash
curl https://your-backend-domain.vercel.app/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md).

For technical support:
1. Check the deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity

## 🔄 Updates

- **v1.0.0**: Initial release with basic functionality
- **v1.1.0**: Added PDF generation with Arabic support
- **v1.2.0**: Added A5 PDF format and creator address
- **v1.3.0**: Vercel deployment configuration 