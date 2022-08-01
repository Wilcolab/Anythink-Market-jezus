# Welcome to the Anythink Market repo

To start the app use Docker. It will start both frontend and backend, including all the relevant dependencies, and the db.

Please find more info about each part in the relevant Readme file ([frontend](frontend/readme.md) and [backend](backend/README.md)).

## Development

When implementing a new feature or fixing a bug, please create a new pull request against `main` from a feature/bug branch and add `@vanessa-cooper` as reviewer.

## First setup

Follow below steps to install and run the repo on a new machine

**Pre-requisites**

install docker & docker-compose.

You can verify docker is ready by running the following commands in your terminal
```
 docker -v
 docker-compose -v
```

**Step 1 :** Clone this repo

```
git clone https://github.com/ObelusFamily/Anythink-Market-jezus.git
```

**Step 2 :** cd to project root directory

```
cd Anythink-Market-jezus/
```

**Step 3 :** Run docker compose

```
docker-compose up
```
