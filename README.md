# recipe-app-backend
A simple CRUD Node/Express/MongoDb REST API server for recipes. Backend for [this client](https://github.com/hjkar1/recipe-app-frontend).

## Prerequisites
You need to have npm and Node.js installed to run this app on your computer.

A MongoDb database is needed to run this app. You can use an external database service or a local database (for development or testing). Different databases can be used in production, development and testing environments.

## Installing
Clone the project and install dependencies:
```
git clone https://github.com/hjkar1/recipe-app-backend 
cd recipe-app-backend
npm install
```

## Environment variables
Create a **.env** file in the project root folder.

Define following variables in the **.env** file:
- URIs for the MongoDb databases used in production, development and testing.
- Secret used in generating JSON web tokens for authorization.
- The port used by the API server when developing on localhost.

```
MONGODB_URI='your-production-database-URI'

TEST_MONGODB_URI='your-testing-database-URI'

DEV_MONGODB_URI='your-development-database-URI'

SECRET=your-secret

PORT=3001
```
## Development
Use `npm run watch` to start the server on localhost. The server uses port 3001. The database configured for development environment is used.

## Using ESLint
Use `npm run lint` to run ESLint.

## Testing
All tests are API integration tests. They use the database configured for test environment. Initializing the tests will clear the database.

Use `npm test` to run the tests.