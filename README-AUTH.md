# API Authentication Setup

This project uses JWT (JSON Web Token) authentication to protect all CMS API routes.

## Quick Setup

### Step 1: Generate a Token

Run the token generation script:

```bash
cd Learning_shala_project
node src/scripts/generate-token.js
```

This will output a token that looks like:
```
NEXT_PUBLIC_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Add Token to Frontend

Copy the token and add it to your frontend `.env.local` file:

```env
NEXT_PUBLIC_JWT_TOKEN=your-generated-token-here
```

### Step 3: Restart Services

Restart your backend and frontend servers for the changes to take effect.

## How It Works

1. **Token Generation**: The script generates a JWT token with:
   - User ID: 1
   - Role: "admin"
   - Expiration: Set by `JWT_ACCESS_EXPIRES_IN` (default: 7 days)

2. **Backend Protection**: All CMS routes are protected with `authMiddleware` which:
   - Checks for `Authorization: Bearer <token>` header
   - Validates the token signature
   - Attaches user info to request

3. **Frontend Usage**: The frontend automatically:
   - Reads token from `NEXT_PUBLIC_JWT_TOKEN` environment variable
   - Falls back to `localStorage.getItem("token")` if env variable is not set
   - Adds token to all API requests as `Authorization: Bearer <token>`

## Environment Variables

### Backend (.env)
```env
JWT_ACCESS_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRES_IN=7d  # Optional, default is 7 days
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_JWT_TOKEN=your-generated-token-here
```

## Token Expiration

Tokens expire based on `JWT_ACCESS_EXPIRES_IN`. When a token expires:
1. Generate a new token using the script
2. Update `NEXT_PUBLIC_JWT_TOKEN` in `.env.local`
3. Restart the frontend

## Alternative: Login-Based Authentication

If you prefer login-based authentication:
1. Use the existing `/cms/users/login` endpoint
2. Store the token in localStorage (automatic)
3. The frontend will use localStorage token instead of env variable

## Security Notes

- Keep `JWT_ACCESS_SECRET` secure and never commit it to version control
- Rotate tokens periodically for production
- Use strong secrets (minimum 32 characters recommended)

