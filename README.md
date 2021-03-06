# BinBaboon

![Build](https://github.com/abhimanyusirohi/binbaboon/actions/workflows/node.js.yml/badge.svg)

BinBaboon is a web application that displays files in hexadecimal and allows bookmarking bytes to make sense of binary data.

It is written in Typescript and uses React with Material-UI components. Compiled as static client-side only application and hosted on GitHub Pages.

![BinBaboon](screenshot.png "BinBaboon")

# Blog

https://binbaboon.blogspot.com/

# Building

To get started:

1. Pull code from GitHub repo into a folder
2. Open the folder in VS Code
3. Run `npm ci` to install dependencies
4. Run `npm start` to start the dev server and load the web app in the browser

Run `npm run build` to build

Run `npm test` to run all tests

Run `npm run test:coverage` to run all tests and generate coverage report. Coverage report will be generated in the terminal as well as in _coverage_ directory. Open _index.html_ in _coverage_ directory to view code coverage.

# References

[React](https://reactjs.org/docs/getting-started.html)

[The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

[JEST](https://jestjs.io/docs/getting-started)

[Material UI](https://mui.com)
