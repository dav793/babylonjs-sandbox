# Babylon JS Sandbox

## Requirements
* Docker 20.10.20

## Installation

1. **Make sure Docker is installed and running**

    [Get Docker](https://docs.docker.com/get-docker/).

2. **Clone repo**

    ```bash
    git clone https://github.com/dav793/babylonjs-sandbox.git
    ``` 

3. **Copy config files and set environment vars**

    Mac OS / Linux:
    ```bash
    cp -n .env.template .env
    ```

    Windows:
    ```cmd
    if not exist .env copy .env.template .env
    if not exist .env.bat copy .env.bat.template .env.bat
    ```

4. **Add execution perms for bash scripts**

    Skip this step if running on Windows.

    Mac OS / Linux:
    ```bash
    chmod u+x *.sh
    ```

5. **Create docker volume if not exists**

    Mac OS/Linux:
    ```bash
    source .env && docker volume create --driver local --opt type=none --opt device=${WORKING_DIR} --opt o=bind ${VOLUME_NAME}
    ```

    Windows:
    ```cmd
    call .env.bat
    docker volume create --driver local --opt type=none --opt device=%WORKING_DIR% --opt o=bind %VOLUME_NAME%
    ```

6. **Install dependencies**

    Mac OS / Linux / Windows:
    ```bash
    docker compose --env-file .env -f docker-threejs-sandbox/docker-compose.install.yml up
    ```

    Docker service will spawn and install dependencies in your volume. The service will stop and remove itself when finished. 

    If it doesn't work the first time, don't panic. Docker does that, just delete node_modules and keep trying!
    If it still doesn't work, you may need to:
    * Add the line `tail -f /dev/null` to the relevant install bash script to keep the container open.
    * Open a shell in the container.
    * Remove `node_modules` and `package-lock.json`.
    * Run `npm install`.

7. **Done** 

    See [Run](#run).

## Uninstall

Mac OS / Linux / Windows:
```bash
docker container rm babylonjs-sandbox
docker image rm babylonjs-sandbox
```

## Run

Mac OS / Linux / Windows:
```bash
docker compose --env-file .env -f babylon-docker/docker-compose.yml up
```

## Environment

Set var `ENVIRONMENT` in `.env` file to either `production` or `development`.

## Utilities

* Open shell on container `babylonjs-sandbox`:

    ```bash
    docker exec -it babylonjs-sandbox /bin/sh
    ```

* Idle run (keep containers open):

    ```bash
    docker compose --env-file .env -f babylon-docker/docker-compose.keep-open.yml up
    ```

    What it does: Changes instance of `command` in `docker-compose.yml` to `[ "tail", "-f", "/dev/null" ]`.
    