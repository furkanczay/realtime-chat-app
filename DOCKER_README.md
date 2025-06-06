# Docker Deployment Guide

This guide explains how to run the Realtime Chat application using Docker with the latest stable versions.

## Software Versions

- **Node.js**: 22 (Latest LTS)
- **PostgreSQL**: 17 (Latest stable)
- **Redis**: 7.4 (Latest stable)
- **Alpine Linux**: Latest for minimal image size

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

## Quick Start with Docker Compose

### 1. Development Setup

For development with external database services:

```bash
# Start only the database and Redis services
docker-compose -f docker-compose.dev.yml up -d

# Your app will connect to:
# - PostgreSQL: localhost:5433
# - Redis: localhost:6380
```

### 2. Full Production Setup

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd realtime-chat

# Copy and configure environment variables
cp .env.docker .env
# Edit .env file with your actual values

# Build and start all services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Your app will be available at http://localhost:3000
```

## Individual Docker Commands

### Building the Docker Image

```bash
# Build the image
docker build -t realtime-chat .

# Run the container (requires external database)
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e BETTER_AUTH_SECRET="your_secret" \
  realtime-chat
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Better Auth
BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Optional: Redis
REDIS_URL="redis://localhost:6379"
```

## Database Setup

### Running Migrations

```bash
# If using docker-compose
docker-compose exec app npx prisma migrate deploy

# If running container manually
docker exec -it <container-name> npx prisma migrate deploy
```

### Prisma Studio (Database GUI)

```bash
# If using docker-compose
docker-compose exec app npx prisma studio

# Access at http://localhost:5555
```

## File Structure

```
├── Dockerfile                 # Main application Docker image
├── docker-compose.yml         # Production setup with all services
├── docker-compose.dev.yml     # Development database services only
├── .dockerignore             # Files to exclude from Docker build
├── .env.docker               # Template for environment variables
└── init-db.sql               # Database initialization script
```

## Docker Image Details

### Multi-stage Build

The Dockerfile uses a multi-stage build process:

1. **deps**: Installs production dependencies
2. **builder**: Builds the Next.js application and custom server
3. **runner**: Creates the final production image

### Image Size Optimization

- Uses Alpine Linux base images
- Multi-stage build removes development dependencies
- Only includes necessary files in the final image

## Troubleshooting

### Common Issues

1. **Database Connection Issues**

   ```bash
   # Check if database is running
   docker-compose ps

   # Check database logs
   docker-compose logs db
   ```

2. **Port Conflicts**

   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000

   # Use different ports in docker-compose.yml
   ports:
     - "3001:3000"  # Changed from 3000:3000
   ```

3. **Permission Issues**

   ```bash
   # Check container logs
   docker-compose logs app

   # Rebuild with no cache
   docker-compose build --no-cache
   ```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
```

### Accessing Container Shell

```bash
# Access the app container
docker-compose exec app sh

# Access the database container
docker-compose exec db psql -U postgres -d realtime_chat
```

## Production Deployment

### Security Considerations

1. **Change Default Passwords**: Update all default passwords in production
2. **Use Secrets**: Consider using Docker secrets for sensitive data
3. **Network Security**: Use internal networks for service communication
4. **SSL/TLS**: Configure reverse proxy with SSL certificates

### Scaling

```bash
# Scale the application (if using load balancer)
docker-compose up -d --scale app=3
```

### Backup

```bash
# Backup database
docker-compose exec db pg_dump -U postgres realtime_chat > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U postgres realtime_chat
```

## Health Checks

The Docker setup includes health checks for:

- PostgreSQL database
- Application container (HTTP endpoint)

Monitor with:

```bash
docker-compose ps
```

## Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run any new migrations
docker-compose exec app npx prisma migrate deploy
```
