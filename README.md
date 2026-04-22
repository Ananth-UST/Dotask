# Task Manager Microservices

A production-style microservices application built with Node.js, Express, PostgreSQL, and React.

## Architecture

* **frontend**: React application (Vite on port 3000)
* **api-gateway**: Express gateway routing API calls (port 4000)
* **auth-service**: Handles user registration, login, JWT issuance (port 4001, `auth_db`)
* **user-service**: Handles user profiles (port 4002, `user_db`)
* **task-service**: Handles CRUD for tasks (port 4003, `task_db`)
* **postgres**: Dockerized PostgreSQL instance (port 5432)

Each service has its own `package.json`, `.env`, and `server.js` matching standard microservices independent repository patterns. They independently manage their schemas locally on startup.

## Local Setup Instructions

### 1. Start the Database
From the root `/task-manager` directory, start the Postgres container (this will also automatically create the `auth_db`, `user_db`, and `task_db` databases via `init-scripts/init.sql`).
```bash
docker-compose up -d
```

### 2. Install Dependencies
Open multiple terminal windows and run `npm install` in all service directories:
```bash
cd api-gateway && npm install
cd ../auth-service && npm install
cd ../user-service && npm install
cd ../task-service && npm install
cd ../frontend && npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` in each of the backend service folders.
```bash
cp api-gateway/.env.example api-gateway/.env
cp auth-service/.env.example auth-service/.env
cp user-service/.env.example user-service/.env
cp task-service/.env.example task-service/.env
```

### 4. Run the Services
Run `npm run dev` in each of the backends and the gateway.
For example, inside `/api-gateway`: `npm run dev`
Inside `/auth-service`: `npm run dev`
Inside `/user-service`: `npm run dev`
Inside `/task-service`: `npm run dev`

### 5. Run the Frontend
Inside the `frontend` folder:
```bash
npm run dev
```

Visit `http://localhost:3000` to interact with the system.

## Important Microservice Design Patterns Implemented
- **Independent Schema Ownership**: Node.js services connect to their dedicated databases and create their tables dynamically.
- **Gateway Pattern**: Frontend only communicates with Gateway. Internally, Gateway proxies to services and calls `auth-service` to validate JWT.
- **Stateless Configuration**: All URLs, ports, and credentials are configuration-driven (`.env`).
