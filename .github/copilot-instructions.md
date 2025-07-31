Dependencies, library and file structure prompt

#  Node.js Restaurant Backend API — Project Guidelines

This document defines the project structure, required modules, dependencies, and API design guidelines for building a restaurant backend system using Node.js and Express with **PostgreSQL**.

---

##  Tech Stack & Dependencies

This is a backend-only Node.js REST API for a restaurant platform.

###  Main Stack:
- **Node.js (v18+)**
- **Express.js** — Web framework
- **PostgreSQL** — Relational database
- **Sequelize** — ORM for PostgreSQL
- **Dotenv** — Environment configuration
- **Cors** — Cross-origin access
- **Multer** — (Optional) File upload middleware
- **JWT + bcrypt** — For authentication
- **Nodemailer** — For email notifications (optional)
- **GeoJSON support** (PostGIS extension) — For location-based filtering

###  Testing (Optional):
- **Jest** or **Mocha/Chai**

###  Payment Integration (Optional):
- Use **Stripe** test API for payment module (if implemented)

---

##  File Structure Convention

backend/
├── controllers/ # Business logic per module
│ ├── restaurant.controller.js
│ ├── food.controller.js
│ └── ...
├── models/ # Sequelize models
│ ├── restaurant.model.js
│ ├── food.model.js
│ └── ...
├── migrations/ # Sequelize migration files
├── seeders/ # Sample data (optional)
├── routes/ # API endpoints per module
│ ├── restaurant.routes.js
│ ├── food.routes.js
│ └── ...
├── middlewares/ # Auth, validation, error handling
├── config/ # DB connection, environment
│ ├── config.js # Sequelize DB config
├── utils/ # Reusable utilities
├── app.js # Express app entry point
├── server.js # Main server file (connects DB and app)
├── .env # Env variables (e.g., DB credentials)
└── README.md

##  Best Practices

To ensure high-quality, scalable, and maintainable code, follow these practices:

###  Code Structure
- Organize logic into `controllers`, `services`, `models`, and `routes`
- Avoid placing business logic directly in route handlers
- Keep files small and focused on a single responsibility
- Use a consistent naming convention (e.g., camelCase for files and folders)

###  Environment Management
- Store secrets and config in a `.env` file
- Never hardcode credentials, secrets, or keys
- Use `dotenv` to load environment variables safely

###  RESTful API Standards
- Follow REST naming: `GET /foods`, `POST /orders`, `DELETE /users/:id`
- Use proper HTTP status codes:
  - `200 OK` – success
  - `201 Created` – resource created
  - `400 Bad Request` – validation or client error
  - `401 Unauthorized` – missing or invalid token
  - `404 Not Found` – missing data
  - `500 Internal Server Error` – unexpected failure
- Use plural nouns for routes: `/users`, `/orders`, `/restaurants`

###  Authentication & Security
- Use `bcrypt` to hash passwords before storing
- Use `JWT` for secure authentication
- Implement role-based access control (RBAC)
- Sanitize all inputs to avoid SQL injection or XSS
- Set CORS policies properly to restrict origin access

###  Error Handling
- Use centralized error-handling middleware
- Always wrap async/await with `try-catch`
- Log errors with meaningful messages for debugging
- Return structured errors:  
  ```json
  {
    "success": false,
    "message": "Detailed error message"
  }


