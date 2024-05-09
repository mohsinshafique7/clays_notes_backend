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

Sure, here's a formatted version for the README.md file, grouped by controllers and service:

### Accounts Controller:

#### Delete:

- Should delete a sleep record by ID.
- Should raise an error if the record is not found.

#### findOne:

- Should return a single account record by ID.

#### findAll:

- Should return all sleep records with pagination.

#### update:

- Should raise an error if the record is not found.
- Should update the record if found.

#### create:

- Should create a new record.
- Should raise an error if the record already exists and sleep hours exceed 24.
- Should update the record if it already exists.

### AccountsService Test Cases:

#### Create:

- Should create a new account.
- Should raise an error if database operation fails.

#### Find All:

- Should return all accounts with pagination.
- Should raise an error if database operation fails.

#### FindOne:

- Should return a single account by ID.
- Should raise an error if database operation fails.

#### Exists:

- Should return true if the account exists.
- Should raise an error if database operation fails.

#### Find By Name:

- Should return an account by name.
- Should raise an error if database operation fails.

#### Update:

- Should update an account.
- Should raise an error if database operation fails.

#### Delete:

- Should delete an account.
- Should raise an error if database operation fails.

### SleepRecordsService Test Cases:

#### Update:

- Should update a sleep record.
- Should raise an error if the database operation fails.

#### Create:

- Should create a new sleep record.
- Should raise an error if the database operation fails.

#### Get By Date:

- Should return a sleep record for a specific date and account ID.
- Should raise an error if the database operation fails.
- Should return an empty array if no records are found for the specified date and account ID.

#### Find All:

- Should return sleep records with pagination.
- Should return empty data if no records are found.
- Should raise an error if the database operation fails.

#### FindOne:

- Should return a single sleep record by ID.
- Should return an empty object if no record is found.
- Should raise an error if the database operation fails.

#### Find By Account ID And Date:

- Should return sleep records for a specific account ID and date.
- Should return empty data if no records are found.
- Should raise an error if the database operation fails.

#### Remove:

- Should remove a sleep record.
- Should raise an error if the database operation fails.

### Sleep Records Controller:

#### delete:

- Should delete a sleep record by ID.
- Should raise a 404 error if the record is not found.

#### findOne:

- Should return a single sleep record by ID.

#### getLastSevenDaysRecords:

- Should return the sleep records for the last seven days.

#### findAll:

- Should return all sleep records with pagination.

#### update:

- Should raise an error if the record is not found.
- Should raise an error if sleep hours exceed the total hours saved in the database.
- Should update the sleep record if found.

#### create:

- Should raise an error if sleep hours exceed the total hours saved in the database.
- Should create a new sleep record if it does not exist.

### Sleep Records Service:

#### Update:

- Should update a sleep record.
- Should raise an error if the database operation fails.

#### Create:

- Should create a new sleep record.
- Should raise an error if the database operation fails.

#### getByDate:

- Should return a sleep record for a specific date and account ID.
- Should raise an error if the database operation fails.
- Should return an empty array if no records are found for the specified date and account ID.

#### findAll:

- Should return sleep records with pagination.
- Should return empty data if no records are found.
- Should raise an error if the database operation fails.

#### findOne:

- Should return a single sleep record by ID.
- Should return an empty object if no record is found.
- Should raise an error if the database operation fails.

#### findByAccountIdAndDate:

- Should return sleep records for a specific account ID and date.
- Should return empty data if no records are found.
- Should raise an error if the database operation fails.

#### Remove:

- Should remove a sleep record.
- Should raise an error if the database operation fails.

### AppController End-to-End (E2E) Test Cases:

#### GET /

- Should return "Hello World!" with status code 200.

#### Save:

- Should return status code 400 with error message if request body is empty.
- Should return status code 400 with error messages if required keys are missing in the request body.
- Wrong formatting test and date test:
- Should return status code 400 with error messages for invalid data formats.
- Should return status code 400 with error message if the date is in the future.
- Should save a new record and return status code 200 with the saved record data.
- Should update the record if the same name is entered and return status code 200 with the updated record message.
- Should return status code 400 with error message if sleep hours exceed 24 hours.

#### Get All:

- Should return status code 200 with all records.

#### Get Single:

- Should return status code 200 with a single record.

#### Update:

- Return Error if record not found:
- Should return status code 400 with error message if the record is not found.
- Success Update:
- Should update the record and return status code 200 with success message and updated record data.

#### Delete:

- Return Error if record not found:
- Should return status code 404 with error message if the record is not found.

### Sleep Controller End-to-End (E2E) Test Cases:

#### Sleep Record:

#### Create ERROR TESTING:

- Should return status code 400 with error messages if required keys are missing in the request body.
- Wrong formatting and date test:
- Should return status code 400 with error messages for invalid data formats.
- Should return status code 400 with error message if the date is in the future or sleep hours exceed 24 hours.
- Success Save Record:
- Should save a new sleep record and return status code 200 with success message.

#### Last Seven:

- Should return status code 200 with sleep records for the last seven days.

#### Get Single:

- Should return status code 200 with a single sleep record.

#### Update:

- Return Error if record not found:
- Should return status code 400 with error message if the record is not found.
- Success Update:
- Should update the sleep record and return status code 200 with success message and updated rows count.

#### Delete:

- Return Error if record not found:
- Should return status code 404 with error message if the sleep record is not found.
