# AnonApp API

The backend API for the AnonApp project (see [anonapp](https://github.com/MorganDilling/anon-app-client-prototype))

## Set up

Download and install postgresql. Create a database called `anonappprototype`.

### Install dependencies

```bash
$ pnpm install
```

Create a `.env` file in the root directory and add the following:

```
DATABASE_URL="postgresql://postgres@localhost:5432/anonappprototype"
API_PORT="31742"
```

## generate prisma client and migrate database

```bash
$ npx prisma migrate dev --name init
```

```bash
$ npx prisma generate
```

## Run

```bash
$ pnpm run dev
```