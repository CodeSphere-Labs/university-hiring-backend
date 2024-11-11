# 🏫 Organization Registration and Invitation System

A Prisma-based backend system that supports registration of organizations (companies and universities) and allows for user invitations to streamline the registration process.

## 📋 Features
- **Organization Registration**: Allows companies and universities to register and manage information.
- **User Management**: Assigns roles and relationships within each organization.
- **Invitation System**: Allows organization admins to generate unique, one-time registration links for new members.

## 📂 Project Structure
- **Prisma Models**:
  - **Organization**: Stores basic info about companies/universities.
  - **User**: Stores user details, including hashed passwords and assigned roles.
  - **Invitation**: Handles unique tokens for user invitations with expiration settings.
- **Enums**:
  - **OrganizationType**: Defines organization types (`COMPANY`, `UNIVERSITY`).
  - **Role**: Defines user roles (`ADMIN`, `STAFF`, `STUDENT`).

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** for the database
- **Prisma CLI**

### Installation
1. **Clone the repository**:
    ```bash
    git clone https://github.com/CodeSphere-Labs/university-hiring-backend.git
    cd university-hiring-backend
    ```

2. **Install dependencies**:
    ```bash
    yarn
    ```

3. **Setup environment variables**: Rename `.env.example` to `.env` and update the `DATABASE_URL` with your PostgreSQL connection string.

4. **Run Prisma migrations**:
    ```bash
    npx prisma migrate dev --name init
    ```

5. **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```

6. **Start the application**:
    ```bash
    yarn dev
    ```

### Environment Variables
Make sure you have the following in your `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
