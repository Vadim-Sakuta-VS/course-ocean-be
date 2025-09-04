# CourseOcean BE

## Project setup

1) Install dependencies
```bash
$ npm install
```

2) Setup database
- Fill .env.local with varialbles
- Run docker container
```bash
$ docker-compose --env-file "../.env.local" up -d
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
