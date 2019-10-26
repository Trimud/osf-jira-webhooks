## Introduction

Use *Github Webhooks* to transition JIRA tickets statuses

## Dependencies

* [@octokit/webhooks](https://github.com/octokit/webhooks.js)
* [JavaScript JIRA API for node.js](https://jira-node.github.io/)
* [Simple Node Logger](https://github.com/darrylwest/simple-node-logger)
* [TypeScript](https://www.typescriptlang.org/)
* Yarn (or) NPM

### Local Development
* Dotenv
* [Eventsource](https://github.com/EventSource/eventsource)
* Nodemon

## Install, Build, Run

Install node package dependencies:

`$ yarn`

Build:

`$ yarn run build`

Run ExpressJS server:

`$ yarn start`

Run ExpressJS development server:

`$ yarn dev`

Watch ts files for changes and rebuild them:

`$ yarn watch`

## TODO

- Delete old log files
- Read config from Github repo