# keyword-scrapping-backend

Google keyword scrapping backend

## Installation

1. Start DB, Redis

```shell
docker compose up -d
```

2. Install dependencies

```shell
npm ci
```

3. Create `.env` file in root directory based on `.env.example`

4. Run the service for development

```bash
npm run start:local
```

## Tests

### Unit test

Run unit test follow below command

```bash
npm run test:cov
npm run test
```
