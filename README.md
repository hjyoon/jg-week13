# jg-week13

The goal of this project is to focus on developing essential skills for implementing core features in web services through hands-on practice, building a solid foundation for real-world applications.

## Getting Started

Follow these instructions to get your copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before starting, ensure you have the following software installed:

- Node.js (tested with version 20.18.0)
- npm (comes with Node.js)
- MongoDB
- Ansible

Additionally, set up Git to use the provided hooks by running:

```bash
git config core.hooksPath ./hooks
```

This command ensures that the custom Git hooks in the hooks directory are used, which may include tasks like code formatting, linting, or pre-commit checks.

### Installation

1. Clone the repository.

   ```bash
   git clone https://github.com/hjyoon/jg-week13.git
   ```

2. Navigate to the project directory.

   ```bash
   cd jg-week13
   ```

3. Install the required npm packages.

   ```bash
   npm install
   ```

4. Set up your environment variables.

   Copy the example environment file and customize it as needed.

   ```bash
   cp .env.example .env
   ```

5. Insert seed data into database.

   ```bash
   npm run seed:all
   ```

6. Start the server.

   ```bash
   npm run start:local
   ```

Your server should now be running and accessible at http://localhost:3000/.

## Usage

### API Documentation

For detailed information about the API endpoints and how to use them, refer to the API documentation available at:

```bash
http://localhost:3000/api-docs
```

### Seed Data

The project includes seed data to initialize the database with sample users, posts, and comments.

#### Initialize Test Data

Run the following command to insert all seed data:

```bash
npm run seed:all
```

This will populate your MongoDB database with sample data, which is useful for testing and development purposes.

## Testing

Our project uses automated end-to-end (E2E) tests to simulate real-world usage scenarios, ensuring that the entire application behaves as expected from the user's perspective.

### Running E2E Tests

To run the E2E tests, follow the steps below to execute these tests:

```bash
npm run test
```

When you run this command, the test framework will simulate actions that mimic those of actual users interacting with the application through its API endpoints.

## Deployment

To deploy this project to a remote server, you can use the `deploy.sh` script provided in the repository. Before running the deployment script, you need to customize it according to your SSH configurations and project paths.

### Deploying with deploy.sh

1. Customize SSH Configurations:

   Ensure that your SSH configurations are set up correctly for the remote server you intend to deploy to. You may need to configure your `~/.ssh/config` file with the appropriate host, user, and key information.

2. Customize the `deploy.sh` Script:

   Replace `~/git/jg-week13` with the path to your project on the remote server.

3. Run the Deployment Script:

   Execute the `deploy.sh` script with the appropriate SSH host alias.

   ```bash
   ./deploy.sh your-ssh-alias
   ```

   Replace `your-ssh-alias` with the alias defined in your SSH config that corresponds to the remote server.

### Running the Application with run.sh

The `run.sh` script is used to start the application in different environments (production, development, or local). This script provides an interactive mode as well as command-line options for flexibility.

#### Script Overview

The `run.sh` script performs the following actions:

- Installs npm packages.
- Checks for `pm2` (Process Manager 2), installing it globally if not found.
- Starts or reloads the application using `pm2`, based on the specified mode.
- Offers the option to force restart all processes.
- Resets the `pm2` logs for the application.

#### Script Usage

You can run the script in interactive mode or by providing command-line options.

##### Interactive Mode

Simply run:

```bash
./run.sh
```

The script will prompt you to input the desired mode and whether to force restart:

```bash
Input environment, p (= production) || d (= development) || l (= local):
```

Enter `p`, `d`, or `l` to select the environment.

##### Command-Line Options

You can also specify options directly:

```bash
./run.sh -m production -f
```

##### Options

`-m`, `--mode MODE`: Set the mode (`production`, `dev`, or `local`).
`-f`, `--force-restart`: Force restart all processes.
`--help`: Display help information.

##### Examples

Start in production mode:

```bash
./run.sh -m production
```

Start in development mode and force restart:

```bash
./run.sh --mode=dev --force-restart
```
