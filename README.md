🚀 AlloMedia - Home Delivery Service 🏠🚚
AlloMedia is a powerful Single Page Application (SPA) designed for home delivery services. It allows users to register, order products, and manage deliveries efficiently. The application supports various roles, including customers, delivery drivers, and managers, each with their own specific functionalities.

✨ Features
🔐 User Registration and Authentication
JWT-based authentication with two-factor authentication (2FA).
Secure user registration with password hashing and salt.
🛂 Role-Based Access Control
Customers: Browse and order products.
Delivery Drivers: View assigned deliveries and update delivery status.
Managers: Manage users, products, and oversee deliveries.
🛒 Product Ordering & Delivery Management
Customers can place orders for home delivery.
Delivery drivers are notified about new orders and manage deliveries.
Managers can monitor and manage orders and deliveries.
🛡️ Security
JWT for secure token-based authentication.
Two-factor authentication (2FA).
Strong password policy enforced using Joi.
🛠️ Tech Stack
Backend: Node.js, Express.js
Database: MongoDB
Authentication: JWT, bcrypt, Two-Factor Authentication (2FA)
Testing: Jest/Mocha
Front-End: (Optional for future development - Angular/React)
📝 Prerequisites
Before you begin, make sure you have the following installed:

Node.js (v16 or higher)
MongoDB (Local or Cloud instance)
npm (or yarn)
⚙️ Installation
Clone the repository:

bash
Copier le code
git clone https://github.com/meedGhoufrane/Authentification_JWT.git
cd Authentification_JWT
Install dependencies:

bash
Copier le code
npm install
Set up environment variables:

Create a .env file in the root directory and add the following:

bash
Copier le code
MYSQL_HOST=localhost
DB_URI=URI
MYSQL_USER=root
MYSQL_PORT=3306
MYSQL_PASSWORD=
JWTPRIVATEKEY=test_jwt_private_key
SALT=10
PORT=5000
Set up MongoDB:

Ensure MongoDB is running locally or provide a valid connection string in the .env file.

Run the application:

bash
Copier le code
npm start
(Optional) Run tests:

bash
Copier le code
npm test
🛠️ API Endpoints
User Registration and Authentication
POST /api/users – Register a new user
POST /api/auth – Authenticate an existing user
Role-Based Actions
Customers: Place orders
Delivery Drivers: View and update assigned deliveries
Managers: Manage products, users, and orders
