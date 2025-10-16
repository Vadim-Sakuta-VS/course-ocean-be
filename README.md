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
| `APP_URL`                                  | App url                                                           | -       |    ✅     |
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
| `GOOGLE_AUTH_CLIENT_ID`                    | Google OAuth2 client id (web app client)                          | -       |    ✅     |
| `GOOGLE_AUTH_CLIENT_ID`                    | Google OAuth2 client secret (web app client)                      | -       |    ✅     |
| `GITHUB_AUTH_CLIENT_ID`                    | Github OAuth2 client id                                           | -       |    ✅     |
| `GITHUB_AUTH_CLIENT_SECRET`                | Github OAuth2 client secret                                       | -       |    ✅     |
| `EXTERNAL_AUTH_UI_SUCCESS_URL`             | Url of FE app when auth is successful                             | -       |    ✅     |
| `EXTERNAL_AUTH_UI_ERROR_URL`               | Url of FE app when auth is failed                                 | -       |    ✅     |
| `SUPER_ADMIN_EMAIL`                        | Email for creating admin                                          | -       |    ❌     |
| `SUPER_ADMIN_PASSWORD`                     | Password hash for creating admin                                  | -       |    ❌     |
| `CLOUDFLARE_R2_ACCESS_KEY_ID`              | Cloudflare access key id                                          | -       |    ✅     |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY`          | Cloudflare secret access key                                      | -       |    ✅     |
| `CLOUDFLARE_R2_PUBLIC_BUCKET`              | Cloudflare bucket name for public content                         | -       |    ✅     |
| `CLOUDFLARE_R2_PRIVATE_BUCKET`             | Cloudflare bucket name for public content                         | -       |    ✅     |
| `CLOUDFLARE_R2_ENDPOINT`                   | Cloudflare API endpoint                                           | -       |    ✅     |
| `CLOUDFLARE_R2_PUBLIC_DOMAIN`              | Public domain connected to public bucket                          | -       |    ✅     |
