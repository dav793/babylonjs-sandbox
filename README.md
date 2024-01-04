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
    chmod u+x ./client/*.sh
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

## Install Docker on Ubuntu

See [https://docs.docker.com/desktop/install/ubuntu/](https://docs.docker.com/desktop/install/ubuntu/) for reference.

1. Add Docker's official GPG key:
    ```bash
    sudo apt-get update
    sudo apt-get install ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    ```

2. Add the repository to Apt sources:
    ```bash
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    ```

3. Download DEB package
    ```bash
    curl -O https://desktop.docker.com/linux/main/amd64/docker-desktop-4.26.1-amd64.deb
    ```

4. Install the package
    ```bash
    sudo apt-get update
    sudo apt-get install ./docker-desktop-4.26.1-amd64.deb
    ```

5. Remove the package
    ```bash
    rm ./docker-desktop-4.26.1-amd64.deb
    ```

6. Run Docker Desktop
    ```bash
    systemctl --user start docker-desktop
    ```

## Install dependencies manually

1. Install NVM:
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    ```

1. Install Nodejs version 18:
    ```bash
    nvm install 18
    ```

3. Start using Nodejs version 18:
    ```bash
    nvm use 18
    ```

4. Install global npm packages:
    ```bash
    npm install -g goldilogs
    npm install -g @angular/cli@^16.2.5
    npm install -g typescript@~5.1.3
    ```

5. Install project dependencies:
    ```bash
    cd client
    npm install
    ```

