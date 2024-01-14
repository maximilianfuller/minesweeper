# minesweeper
Competitive Minesweeper!

Good luck!

### Infrastructure
The server is deployed on [Heroku](https://dashboard.heroku.com/) to https://mine-sweeper.herokuapp.com/

The backend is a NodeJS server running TypeScript and Express.

### Development
#### Requirements
* Recommended to use a Node version manager like [nvm](https://github.com/nvm-sh/nvm) to install the following:
  * [node](https://nodejs.org/en/)
  * [npm](https://www.npmjs.com/)
* For deploying the server:
  * [heroku cli](https://devcenter.heroku.com/articles/heroku-cli)

#### Run Tests
```
$ npm test
```
#### Local Deployment
**TODO**: Setup the `heroku local` deploy with hot reloads so we don't need two local deploy options.

To run a local version of the app that reloads when files are changed run: `npm run dev`

To run local version of the app deployed that mimics the heroku deployment run: `heroku local`
* Add local environment variables to `.env` in the root directory. This file is gitignored and is appropriate for storing secrets.

### Production Deployment
To access/deploy the heroku app, you must be added as a collaborator in heroku. This requires you to setup a heroku account.

The app is deployed by pushing changes to a `heroku` remote git repo that runs on a heroku server. Add the git remote repo locally:
```
$ git remote add heroku https://git.heroku.com/minesweeperduel.git
```

Verify that the remote has been added properly:
```
$ git remote -v
heroku	https://git.heroku.com/minesweeperduel.git (fetch)
heroku	https://git.heroku.com/minesweeperduel.git (push)
origin	git@github.com:maximilianfuller/minesweeper.git (fetch)
origin	git@github.com:maximilianfuller/minesweeper.git (push)
```

Push your local copy of the `main` branch to the remote origin to deploy:
```
$ git push heroku main
```

The updated app should now be running at: https://minesweeperduel.herokuapp.com/

#### Environment Variables
Environment variables are made available to the deployed heroku dynos by setting "Config Vars" in the [application settings](https://dashboard.heroku.com/apps/minesweeperduel/settings). Secret values should be added here, never commited to the codebase.
