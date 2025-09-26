Loyalty App (NestJS)

A NestJS loyalty-management backend using MongoDB (Mongoose) and Firebase Authentication (email/password + phone OTP).
This single-file README contains everything you need to run, test, develop, secure, and push this project. Copy-paste the whole file into README.md in your repo root.
Table of contents

Requirements

Quick start (local)

Clone & branch workflow

Install dependencies

Environment variables (.env)

Firebase emulator config (optional)

Start emulator and Mongo

Start Nest app

Swagger UI

Auth & OTP (emulator) — curl examples

API examples (curl)

Database notes & migration tips

Docker / docker-compose (optional)

Git & GitHub — push safely

CI / Testing / Health checks

Security & best practices

Troubleshooting checklist

Contributing


Requirements

Node.js 18+ recommended

npm or yarn

MongoDB (local or remote)

Firebase CLI (npm i -g firebase-tools) for local emulator (optional)

jq for easy JSON parsing (optional, helpful)

(Optional) Docker & docker-compose

Quick start (local)
Clone & branch workflow
git clone git@github.com:uday-kalluri/NestJSProjects.git
cd NestJSProjects/loyalty-app   # adjust if repo differs
git checkout -b feat/local-setup

Install dependencies
npm install
# or
yarn install

Environment variables (.env)

Create .env from .env.example (do not commit .env).

.env.example (copy into repo as .env.example):

PORT=3000
MONGO_URI=mongodb://localhost:27017/loyalty_app
JWT_SECRET=supersecret
JWT_EXPIRES=1h

# Firebase (emulator)
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_PROJECT_ID=fir-auth-local
FIREBASE_WEB_API_KEY=fake-api-key

# (Production only) path to service account JSON for firebase-admin
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json


IMPORTANT: Never commit real serviceAccountKey.json or .env values.

Firebase emulator config (optional)

If you will use the Auth emulator, put a minimal firebase.json in project root:

firebase.json

{
  "emulators": {
    "auth": { "port": 9099 },
    "ui": { "enabled": true, "port": 4000 }
  }
}

Start emulator and Mongo

Start MongoDB (local) however you normally do. Example (macOS, Homebrew):

brew services start mongodb-community@6.0


Start Firebase Auth emulator:

firebase emulators:start --only auth
# Open emulator UI: http://localhost:4000


If you get No emulators to start, make sure firebase.json exists in the folder you run the command from.

Start Nest app

Export emulator env (same shell) before starting Nest so firebase-admin talks to emulator:

export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_PROJECT_ID=fir-auth-local
npm run start:dev


App runs at http://localhost:3000 by default.

Swagger UI

Enable Swagger in src/main.ts (example included below). After app start, open:

http://localhost:3000/docs


Use the Authorize button to paste Bearer <your_jwt> for protected endpoints.

Swagger snippet to add to main.ts:

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Loyalty API')
      .setDescription('Loyalty app APIs')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jwt')
      .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, doc);
    app.getHttpAdapter().get('/api-json', (req, res) => res.json(doc));
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

Auth & OTP (emulator) — curl examples
Create / sign up user (emulator)
curl -s -X POST "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key" \
 -H "Content-Type: application/json" \
 -d '{"email":"sandbox@example.com","password":"test1234","returnSecureToken":true}' | jq .

Email sign-in (emulator)
curl -s -X POST "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key" \
 -H "Content-Type: application/json" \
 -d '{"email":"sandbox@example.com","password":"test1234","returnSecureToken":true}' | jq .

Phone OTP flow (emulator)

Request sessionInfo:

SESSION=$(curl -s -X POST "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=fake-api-key" \
 -H "Content-Type: application/json" \
 -d '{"phoneNumber":"+15551234567","recaptchaToken":"ignored"}' | jq -r .sessionInfo)
echo $SESSION


Find SMS code in emulator UI: http://localhost:4000 → Auth → recent requests (the UI shows the code, often 123456 in examples).

Sign in and get idToken:

IDTOKEN=$(curl -s -X POST "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d "{\"sessionInfo\":\"${SESSION}\",\"code\":\"123456\"}" | jq -r .idToken)
echo $IDTOKEN


Exchange idToken with your Nest endpoint for app JWT:

curl -s -X POST http://localhost:3000/auth/firebase-login -H "Content-Type: application/json" \
 -d "{\"idToken\":\"${IDTOKEN}\"}" | jq .

API examples (curl)

Get current user's loyalty:

curl -H "Authorization: Bearer ${APP_TOKEN}" http://localhost:3000/loyalties/me | jq .


Admin list (needs admin JWT):

curl -H "Authorization: Bearer ${ADMIN_TOKEN}" "http://localhost:3000/loyalties?skip=0&limit=50" | jq .


Server-side OTP endpoints (if implemented):

curl -X POST http://localhost:3000/auth/send-otp -H "Content-Type: application/json" \
 -d '{"phoneNumber":"+15551234567"}' | jq .

curl -X POST http://localhost:3000/auth/verify-otp -H "Content-Type: application/json" \
 -d '{"sessionInfo":"<SESSION>","code":"123456"}' | jq .

Database notes & migration tips

Ensure userId in loyalties collection is an ObjectId, not string. If some docs store userId as string, convert them:

Mongo shell:

use loyalty_app;
db.loyalties.find().forEach(doc => {
  if (typeof doc.userId === "string") {
    db.loyalties.updateOne({_id: doc._id}, {$set: { userId: ObjectId(doc.userId) }});
  }
});


Indexes recommended: firebaseUid, email (sparse), username (unique), userId (for loyalties).

When running $lookup aggregations, ensure the joined fields are the same type (ObjectId ↔ ObjectId). If not, use pipeline $addFields + $toObjectId or convert DB docs.

CI / Testing / Health checks

Unit tests: npm run test

E2E: npm run test:e2e (if configured)

CI: add GitHub Actions to run lint/tests on PR.

Health checks using @nestjs/terminus:

GET /health — readiness (DB, Firebase, external)

GET /health/live — liveness (basic)

(Implement health module per Terminus docs; see earlier snippets.)
