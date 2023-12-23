# nx-quickstart

A CLI for generating nx monorepo just with one comand.

## Features

1. Full integration with NX
2. Nest.js and Next.js out of the box
3. You choose ORM library, now package have integtation with Prisma but we have in plan to add also typeORM
4. Typesafe rest via ts-rest
5. Validation of env out of the box
6. If you prefer to use `shadcn-ui`, now `nx-quickstart` have fully integration with this ui library

## Usage

1. Generate a nx project template this will install all necessary dependencies and promts your preferences.

```bash
npx nx-quickstart@latest
```

2. Provide necessary database env variable

   - TypeORM

     ```env
     DB_HOST=
     DB_USER=
     DB_PASSWORD=
     DB_NAME=
     ```

   - Prisma

   ```env
     DATABASE_PRISMA_URL=
   ```

3. Run development server

```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:4200/. Happy coding!

# License

Licensed under the [MIT license](LICENSE)
