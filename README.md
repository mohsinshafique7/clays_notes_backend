# Note Taking App

Welcome to the Note Taking App README! This application allows you to manage your notes with CRUD operations using a RESTful API built with NestJS, PostgreSQL for the database, and Docker Compose for easy setup. Swagger documentation is also provided for easy API exploration.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete notes.
- **Validation**: Input validation using Joi to ensure data integrity.
- **Database**: PostgreSQL database to persist notes data.
- **Dockerization**: Use Docker Compose to orchestrate and run the app with all dependencies.
- **Swagger Documentation**: API documentation available via Swagger UI at `http://localhost:5000/api-docs`.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **Joi**: Schema validation for JavaScript objects.
- **PostgreSQL**: A powerful, open-source object-relational database system.
- **Docker Compose**: Tool for defining and running multi-container Docker applications.
- **Swagger**: API documentation tool for OpenAPI specifications.

## Prerequisites

Make sure you have the following installed on your machine:

- Docker
- Docker Compose

## Getting Started

To get the Note Taking App up and running locally, follow these steps:

1. **Clone the repository**:

   ```bash
   https://github.com/mohsinshafique7/clays_notes_backend.git
   cd clays_notes_backend
   ```

2. **Set Environment Variables**:

      create .env as example.env

3. **Start the Application**:
4. Create network(if not exists before):
   ```bash
    docker network create app-network
   ```
5. Run docker container:

   ```bash
    docker-compose up
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

   This command will build and start the NestJS server and PostgreSQL database containers.

6. **Access the Application**:

   Once Docker Compose has successfully started the containers, you can access the Note Taking App:

   - API Endpoint: `http://localhost:5000`
   - Swagger Documentation: `http://localhost:5000/api-docs`

## API Documentation (Swagger)

### Available Endpoints

- **Create Note**:
  - Endpoint: `POST /api/notes`
  - Request Body: `{ "title": "Note Title", "description": "Note Description" }`
  - Response: `201 Created`

- **Get All Notes**:
  - Endpoint: `GET /api/notes`
  - Response: `200 OK`

- **Get Note by ID**:
  - Endpoint: `GET /api/notes/:id`
  - Response: `200 OK` or `404 Not Found`

- **Update Note**:
  - Endpoint: `PUT /api/notes/:id`
  - Request Body: `{ "title": "Updated Title", "description": "Updated Description" }`
  - Response: `200 OK` or `404 Not Found`

- **Delete Note**:
  - Endpoint: `DELETE /api/notes/:id`
  - Response: `204 No Content` or `404 Not Found`

## Development

To run the app in development mode without Docker, follow these steps:

1. Install dependencies:

   ```bash
   yarn
   ```

2. Start the server:

   ```bash
   yarn start:dev
   ```

3. Access the app at `http://localhost:5000`.