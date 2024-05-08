# Cynomi Interview Assignment - Backend

This repository contains a NestJS backend solution for the Cynomi assignment.

## Dependencies

- **joi**: "^17.13.1"
- **moment**: "^2.30.1"
- **pg**: "^8.11.5"
- **reflect-metadata**: "^0.1.13"
- **swagger-ui-express**: "^5.0.0"
- **typeorm**: "^0.3.20"

## Documentation

API documentation is available at [http://localhost:5000/api-docs/](http://localhost:5000/api-docs/).

## Testing

Unit tests are implemented using Jest, and end-to-end tests are completed using Supertest.

## Running the Application

To run the application, use the following command:

```bash
docker-compose up
```

## Environment Variables

The application utilizes environment variables for configuration, including `PORT` and `NODE_ENV` (test|production). Depending on the `NODE_ENV`, databases are connected accordingly.

## Data Model

- **Account**: Includes fields `id`, `name`, and `gender`.
- **Sleep Record**: Includes fields `accountId`, `date`, and `sleepHours`. Both have a one-to-many relationship, and cascade delete is enabled.

## CRUD Operations

CRUD operations for `Account` and `Sleep Record` are implemented and accessible via [http://localhost:5000/api-docs/](http://localhost:5000/api-docs/).

## Validations

Validations are implemented using JOI:

- `name`: Alphabet and space characters only, should not be empty.
- `date`: Format 'YYYY-MM-DD', future dates not allowed.
- `gender`: Must be 'male', 'female', or 'other'.
- `sleepHours`: Cannot exceed 24 hours in a day, minimum value is 1.

## Pagination

GET requests are paginated for improved performance.

## Test Coverage

Test coverage report can be found in `coverage/icov-report/index.html`.

## Test Files

- **E2E Tests**: Located in the `test` folder.
- **Unit Tests**: Located in the same directory as the file being tested.
