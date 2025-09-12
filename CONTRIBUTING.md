# Contributing to Mu2Mi

Mu2Mi welcomes contributions from the community. There are many ways to get
involved!

## Provide Feedback

You might find things that can be improved while you are using Mu2Mi. You can
help by [submitting an issue](https://github.com/FelixNgFender/Mu2Mi/issues/new)
when:

- Mu2Mi crashes, or you encounter a bug that can only be resolved by refreshing
  the browser.
- An error occurs that is unrecoverable, causes data integrity problems or loss,
  or generally prevents you from using Mu2Mi.
- A new feature or an enhancement to an existing feature will improve the
  utility or usability of Mu2Mi.

Before creating a new issue, please confirm that an existing issue doesn't
already exist.

## Participate in the Community

You can engage with the community by:

- Helping other users on [Discord](https://discord.gg/7BkTD7RNRG).
- Improving documentation
- Participating in general discussions about open source, music, and AI
- Authoring new Mu2Mi features

## Contributing Code

You can contribute to Mu2Mi by:

- Enhancing current functionality
- Fixing bugs
- Adding new features and capabilities

Before starting your contribution, especially for core features, I encourage you
to reach out to me on [Discord](https://discord.gg/7BkTD7RNRG). This allows me
to ensure that your proposed feature aligns with the project's roadmap and
goals. Developers are the key to making Mu2Mi the best tool it can be, and I
value input from the community.

I look forward to working with you to improve Mu2Mi.

### Steps to Contribute Code

Follow the following steps to ensure your contribution goes smoothly.

1. Fork the repository to your GitHub account.
2. Clone the forked repository to your local machine.
3. Create a new branch for your feature or bug fix.
4. Commit your changes to your branch.
5. Push your changes to your fork on GitHub.
6. Create a pull request to the main repository.
7. Wait for the maintainers to review your pull request.
8. Make any necessary changes to your pull request.
9. Once your pull request is approved, it will be merged into the main
   repository.
10. Celebrate your contribution to Mu2Mi!

### Development Environment

#### Prerequisites

- Node.js v21.6.1
- Docker
- Docker Compose

#### Setting Up Your Development Environment

Mu2Mi is built with Next.js, PostgreSQL, Minio, and Redis. The development
environment is orchestrated with Docker Compose. To set up your development
environment:

1. Have the required dependencies installed on your machine and the repository
   cloned.
1. Create a `.env` file in the root directory of the project. Use the
   `.env.example` file as a template and fill out the values required. The
   `.env.example` file has some default values that you can use. Rate limiting,
   captcha, email, and analytics are disabled by default in development. You can
   view the [environment variable schema](src/config/env.ts) to see which are
   required for booting up the Next.js server.

```bash
cp .env.example .env
```

1. Run `make up` to start the development environment. _Quick tip: The
   `Makefile` and `compose.yaml` files are used to manage the development
   environment and contain other useful commands_.
1. Run `npm i` to install the project dependencies.
1. Run `npm run dev` to start the development server.
1. Visit `http://localhost:3000` in your browser to view the application.
1. Run `make down` to stop the development environment.
1. (Optional) Run `make clean` to remove all persistent Docker volumes and
   images.

#### Testing Track Processing Functionality

To test out track processing functionality that uses Replicate service, you will
need to have Replicate API token and webhook secret, which can be generated in
your Replicate account settings, configured as environment variables in your
`.env` file. And you will also need to set up tunnels using either
[ngrok](https://ngrok.com/) or
[localtunnel](https://localtunnel.github.io/www/). The two tunnels needed should
be set up for the following ports:

- 3000 (Next.js)
- 9000 (Minio)

Once the tunnels are set up, update these variables in your `.env`:

- `PROTOCOL` to `https`
- `HOST` to the Next.js tunnel URL
- `APP_PORT` to `443` for `https` connection
- `S3_ENDPOINT` to the Minio tunnel URL
- `S3_PORT` to `443` for `https` connection
- `S3_USE_SSL` to `true` for `https` connection

You may also need to restart the Next.js server to apply the changes.

### Codebase Overview

#### Data Access Layer

Exported functions in the `src/models` directory are ready to be consumed in
Route Handlers, Server Actions, and Server Components. They act as a data access
layer and interact with the database.

#### Data Fetching and Mutation

Server Components get their data from queries in `queries.ts` files, re-export
queries from `actions.ts` to get them inside the `'use server'` boundary, which
enables the use of `useQuery` and `useMutation` hooks in Client Components.
Route Handlers should be wrapped with `withErrorHandling` in
[the error module](src/lib/error.ts) to handle errors.

Server Actions in `actions.ts` files. Server Actions should be wrapped with
either `action` or `authAction` in
[the safe-action module](src/lib/safe-action.ts) to handle errors and add the
current user and session to the context.
