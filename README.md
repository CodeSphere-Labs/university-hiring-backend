# 🎓 University Management System API

## 📋 Overview
A comprehensive API system designed for managing university-related processes, including student registration, invitation management, and organizational structure handling.

## ✨ Key Features
- 👥 User Management
  - Multiple user roles (Admin, Staff, University Staff, Student)
  - Profile management with skills tracking
  - Student portfolio management

- 📨 Invitation System
  - Create and manage invitations
  - Role-based invitation creation
  - Automatic expiration handling
  - Email notifications
  - Advanced filtering and search capabilities

- 🏢 Organization Management
  - Multi-organization support
  - Group management within organizations
  - Hierarchical structure

- 🎯 Skills Management
  - Skill categorization
  - Multi-language support (Russian/English)
  - User skill tracking

- 📚 Student Projects
  - Project portfolio management
  - GitHub integration
  - Technology stack tracking

## 🛠 Technical Stack
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Email Service**: Integrated email notifications
- **Validation**: Class-validator & class-transformer

## 📝 API Documentation

### 🔐 Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/refresh` - Refresh access token

### 📨 Invitation Management
- `GET /invitations` - List all invitations with filtering
- `POST /invitations/create-invitation` - Create new invitation
- `POST /invitations/confirm-invitation` - Confirm invitation
- `PATCH /invitations/refresh-invitation` - Update invitation
- `DELETE /invitations/:id` - Delete invitation

### 👥 User Management
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile
- `GET /users/skills` - Get user skills

### 👨‍🎓 Student Features
- `POST /students/projects` - Add student project
- `GET /students/projects` - Get student projects
- `DELETE /students/projects/:id` - Delete project

## 🔍 Query Parameters
### Invitation Filtering
- `filter`: 'createdByMe' | 'all'
- `status`: 'all' | 'accept' | 'wait' | 'expired'
- `search`: Search by email
- `page`: Pagination page number
- `limit`: Items per page

## 🔒 Security
- JWT-based authentication
- Role-based access control
- Request validation
- Error handling with custom error codes

## 💡 Features Highlights
- Real-time email notifications
- Automatic invitation expiration
- Case-insensitive search
- Pagination support
- Comprehensive error handling
- Data transformation interceptors

## 🚀 Getting Started

### Prerequisites
```bash
node >= 14.x
npm >= 6.x
postgresql >= 12
```

### Installation
```bash
# Clone the repository
git clone https://github.com/CodeSphere-Labs/university-hiring-backend.git

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npm run prisma:migrate

# Start the application
npm run start:dev
```

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-jwt-secret"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email"
SMTP_PASSWORD="your-password"
```

## 📈 Future Improvements
- [ ] Add WebSocket support for real-time notifications
- [ ] Implement file upload for student projects
- [ ] Add analytics dashboard
- [ ] Enhance search capabilities
- [ ] Add batch operations for invitations

## 👏 Acknowledgments
- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- All contributors who participated in this project
