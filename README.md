# BinBaboon

BinBaboon is a web application that displays files in hexadecimal and allows bookmarking bytes to make sense of binary data.

# Getting started

To get started:

1. Pull code from GitHub repo into a folder
2. Open the folder in VS Code
3. Install recommended extensions
4. Run `npm ci` to install dependencies
5. Run `npm start` to start the dev server and load the web app in the browser

Run `npm run build` to build

Run `npm test` to run all tests

Run `npm run test:coverage` to run all tests and generate coverage report. Coverage report will be generated in the terminal as well as in _coverage_ directory. Open _index.html_ in _coverage_ directory to view code coverage.

# Branches

## main

Releases are made from `main` branch. Commits are never directly committed to this branch. Commits are made in `develop` and `develop` is then merged to this branch when a new release is needed.

## develop

All the development happens in the `develop` branch. For a new release, the `develop` branch is merged to the `main` branch.

# References

[React](https://reactjs.org/docs/getting-started.html)

[The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

[JEST](https://jestjs.io/docs/getting-started)
