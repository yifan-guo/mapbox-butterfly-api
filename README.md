# 🦋 Butterfly critique

Butterfly critique is an API designed for butterfly enthusiasts. So far, it's an [`express`](https://expressjs.com/)-based API that stores butterflies and users.

Data persistence is through a JSON-powered database called [`lowdb`](https://github.com/typicode/lowdb).

Validation is built using an assertion library called [`@mapbox/fusspot`](https://github.com/mapbox/fusspot).

## Task

Butterfly critique is already a pretty great API, but we think it would be even better if it let users critique butterflies. Your task is to create new API endpoints that:

1. Allow a user to rate butterflies on a scale of 0 through 5
1. Allow retrieval of a list of a user's rated butterflies, sorted by rating

You should also provide a small **write-up** that explains the decisions (for instance, the HTTP verbs for new endpoints) and trade-offs you made. If you add any new dependencies, spend some time talking about why you chose them.

You are free to refactor or improve any code you think should be refactored, but please include a note about such changes in your write-up. Any changes you make should be scoped and explained as though you are opening a pull request against an existing codebase used in a production API service.

If you have any questions or concerns, please do not hesitate to contact us!

### What we're looking for

* Your code should be extensible and reusable
* Your code should be well tested
* Your code should be tidy and adhere to conventions
* Your changes should be well-scoped and explained in the write-up
* Your write-up should be thoughtful and coherent

❗️ Note: please do not write your name anywhere in your solution, since this prevents us from evaluating it anonymously. If you use git, please remember to remove the `.git` directory before submitting your solution.

### Scoring rubric

Points are awarded in the following categories:

Communication in the write-up (2 points)
Endpoint design (6 points)
Database design (2 points)
Testing (3 points)
Tidiness, refactoring, and adherence to conventions (1 point)

The maximum possible score is 14.

## Developing

### Requirements

* Node v18.x
* npm v10.x

### Setup

Install dependencies with:

```sh
npm ci
```

Butterfly critique uses lowdb to manage a JSON database. You can find the [lowdb@1.0.0 docs here](https://github.com/typicode/lowdb/tree/v1.0.0#readme). If you need to recreate the butterflies database, you can run:

```sh
npm run init-db
```

### Running

To run the application locally:

```sh
npm start
```

You should see a message that the application has started:

```sh
Butterfly API started at http://localhost:8000
```

You can manually try out the application using `curl`:

```sh
# GET a butterfly
curl http://localhost:8000/butterflies/H7hhcEWLDsxyHN0cnDrBV

# POST a new butterfly
curl -X POST -d '{"commonName":"Brimstone", "species":"Gonepteryx rhamni", "article":"https://en.wikipedia.org/wiki/Gonepteryx_rhamni"}' -H 'content-type: application/json' http://localhost:8000/butterflies

# GET a user
curl http://localhost:8000/users/-9aAFuyNIkpSzRMNux2BQ
```

**For developing**, you can run the application with auto-restarts on code changes using:

```sh
npm run watch
```

### Testing

This project uses [`jest`](https://jestjs.io/) as its testing framework.
If you are unfamiliar with `jest`, check out its [documentation](https://jestjs.io/docs/en/getting-started).

This project has `eslint` and a custom config [`@mapbox/eslint-config-mapbox`](https://www.npmjs.com/package/@mapbox/eslint-config-mapbox) setup for code linting.

To run the linter and all tests:

```sh
npm test
```

**For developing**, you can run `jest` with auto-restarts using:

```sh
npm run test-watch
```
