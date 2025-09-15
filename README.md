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
- run migrations
```bash
$ npm run migration:up
```

## MailerService. Sender account
- `Development` Create test email account (Ethereal)
```bash
$ npm run ethereal:mailer-test-account
```
- `Production` Get refresh token of Google account
```bash
$ npm run google:mailer-refresh-token
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

## Environment Variables

| Variable                                   | Description                                                       | Default | Required |
|:-------------------------------------------|:------------------------------------------------------------------|:--------|:--------:|
| `PORT`                                     | App port                                                          | 5000    |    ❌     |
| `POSTGRES_USER`                            | Postgres DB user                                                  | -       |    ✅     |
| `POSTGRES_PASSWORD`                        | Postgres DB password                                              | -       |    ✅     |
| `POSTGRES_DB`                              | Postgres DB name                                                  | -       |    ✅     |
| `POSTGRES_PORT`                            | Postgres DB port                                                  | -       |    ✅     |
| `POSTGRES_HOST`                            | Postgres DB host                                                  | -       |    ✅     |
| `JWT_SECRET`                               | JWT secret key                                                    | -       |    ✅     |
| `JWT_ACCESS_TOKEN_EXPIRATION_TIME`         | Expiration time of access JWT                                     | -       |    ✅     |
| `JWT_REFRESH_TOKEN_EXPIRATION_TIME`        | Expiration time of refresh JWT                                    | -       |    ✅     |
| `EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME` | Expiration time of email verification JWT                         | -       |    ✅     |
| `BCRYPT_HASH_SALT`                         | bcrypt salt rounds                                                | -       |    ✅     |
| `GOOGLE_EMAIL`                             | Email of Google account. For production.                          | -       |    ✅     |
| `GOOGLE_MAILER_CLIENT_ID`                  | Google OAuth2 client id (desktop app client). For production.     | -       |    ✅     |
| `GOOGLE_MAILER_CLIENT_SECRET`              | Google OAuth2 client secret (desktop app client). For production. | -       |    ✅     |
| `GOOGLE_MAILER_REFRESH_TOKEN`              | Refresh token of Google account. For production.                  | -       |    ✅     |
| `ETHEREAL_EMAIL`                           | Email of Ethereal test account. For development.                  | -       |    ✅     |
| `ETHEREAL_PASSWORD`                        | Password of Ethereal test account. For development.               | -       |    ✅     |
