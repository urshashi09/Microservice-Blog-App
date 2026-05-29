# Microsevice Blog App

Modern event-driven blogging platform built with Next.js, Node.js microservices, PostgreSQL, MongoDB, Redis, RabbitMQ, and Google Gemini.

VibeLogs separates user management, authoring workflows, and read-heavy blog delivery into independent services. The Author service owns blog writes and publishes cache invalidation events through RabbitMQ. The Blog service owns public reads, uses Redis for cache-aside performance, and reacts to invalidation events so readers see fresh content without coupling write requests to cache work.

## Architecture

```mermaid
graph TD
    FE[Next.js Frontend]

    US[User Service :6001]
    AS[Author Service :5000]
    BS[Blog Service :7000]

    PG[(PostgreSQL / Neon)]
    MDB[(MongoDB)]
    RD[(Redis)]
    RMQ[[RabbitMQ]]
    GEMINI[Google Gemini]
    CLOUD[Cloudinary]

    FE -->|Auth and profiles| US
    FE -->|Create, edit, delete posts| AS
    FE -->|Browse and read posts| BS

    US --> MDB
    US --> CLOUD
    AS --> PG
    AS --> GEMINI
    AS --> RMQ
    BS --> PG
    BS --> RD
    RMQ --> BS
```

## Services

| Service | Purpose |
| --- | --- |
| `frontend` | Next.js App Router UI, auth flow, blog browsing, editor screens |
| `backend/services/user` | Registration, login, Google auth, profiles, profile images |
| `backend/services/author` | Blog write operations and Gemini-assisted writing tools |
| `backend/services/blog` | Blog reads, search/category filters, comments, saves, Redis caching |

## Key Features

- Event-driven cache invalidation with RabbitMQ after blog create, update, and delete operations.
- Redis cache-aside reads for blog lists and individual blog pages.
- Google Gemini support for title improvement, description generation, and content polishing.
- JWT authentication across services.
- Cloudinary image upload support.
- Independent Dockerfiles for each backend service.
- TypeScript across frontend and backend.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Jodit editor
- Backend: Node.js, Express, TypeScript
- Data: PostgreSQL/Neon for blog data, MongoDB for user data
- Infrastructure: Redis, RabbitMQ, Docker
- Integrations: Google Gemini, Google OAuth, Cloudinary

## Project Structure

```text
.
+-- frontend/
|   +-- src/app/
|   +-- src/components/
|   +-- src/context/
+-- backend/services/
    +-- author/
    +-- blog/
    +-- user/
```

## Environment Variables

Create `.env` files inside the service folders that need them. Do not commit real `.env` files.

### Frontend

`frontend/.env.local`

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### User Service

`backend/services/user/.env`

```env
PORT=6001
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Author Service

`backend/services/author/.env`

```env
PORT=5000
DB_URI=postgresql://...
JWT_SECRET=your-jwt-secret
CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GEMINI_API_KEY=your-gemini-api-key
RABBITMQ_URL=amqp://user:password@host:5672/vhost
```

### Blog Service

`backend/services/blog/.env`

```env
PORT=7000
DB_URI=postgresql://...
JWT_SECRET=your-jwt-secret
REDIS_URI=redis://localhost:6379
RABBITMQ_URL=amqp://user:password@host:5672/vhost
USER_SERVICE=http://localhost:6001
```

## Run Locally

Install and run each app from its own directory.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### Backend Services

Open one terminal per service:

```bash
cd backend/services/user
npm install
npm run dev
```

```bash
cd backend/services/author
npm install
npm run dev
```

```bash
cd backend/services/blog
npm install
npm run dev
```

You also need running Redis and RabbitMQ instances for cache and messaging features.

## Docker

Each backend service has its own Dockerfile.

```bash
docker build -t user-service ./backend/services/user
docker build -t author-service ./backend/services/author
docker build -t blog-service ./backend/services/blog
```

Example run:

```bash
docker run --env-file backend/services/author/.env -p 5000:5000 author-service
```

Repeat with each service's `.env` file and port mapping.

## Validation

Backend builds:

```bash
cd backend/services/user && npm run build
cd backend/services/author && npm run build
cd backend/services/blog && npm run build
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## Notes

- `.env`, build output, dependencies, and Next.js output are ignored by Git.
- Keep production secrets in your deployment provider, not in the repository.
- The frontend currently defines backend base URLs in `frontend/src/context/AppContext.tsx`; update those values if switching between local and deployed services.
