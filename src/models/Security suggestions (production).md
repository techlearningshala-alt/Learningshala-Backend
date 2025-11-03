Security suggestions (production)

Use HTTPS.

Use strong secrets for JWT.

Consider storing refresh tokens in Redis (for fast revocation).

Consider token rotation to mitigate replay.

Set SameSite, HttpOnly cookies if you plan to deliver refresh tokens via cookie.

Rate limit login endpoint to reduce brute-force attempts.

Log suspicious auth activity.