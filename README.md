# recipe-app-backend
A simple CRUD Node/Express/MongoDb REST API server for recipes. Can be used as backend for [this client](https://github.com/hjkar1/recipe-app-frontend).

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


## Deploying to Heroku
A Heroku account is required to deploy this app to Heroku.

Deploying with [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli):

1. Run `heroku create` in the project root folder to create a new Heroku remote.

2. Use `npm run deploy` to deploy the app.

3. Set the environment variables needed in production (production database URI and secret for JWTs):
```
heroku config:set MONGODB_URI=your-database-URI
heroku config:set SECRET=your-secret
```

Steps 1 and 3 are needed only on the first deploy. After the app is deployed to Heroku you can deploy a new version by using `npm run deploy`.
