# JWT Authentication System

A secure authentication system implementing JWT (JSON Web Token) with access and refresh token management.

## Features

- **Secure Authentication**: Using JWT for stateless authentication
- **Token Management**: 
  - Short-lived access token for API authorization
  - Long-lived HTTP-only refresh token for session persistence
- **Auto Token Refresh**: Automatic refresh of expired access tokens
- **Protected Routes**: API endpoint protection using middleware
- **Security Best Practices**: 
  - HTTP-only cookies for refresh tokens
  - In-memory storage for access tokens (XSS protection)
  - Token expiration and validation

## Project Structure

```
├── client/                  # Frontend code
│   ├── index.html           # Main HTML file
│   ├── styles.css           # Styling
│   └── browser-app.js       # Client-side JavaScript
├── server/                  # Backend code
│   ├── controllers/
│   │   └── main.js          # Authentication controllers
│   ├── errors/
│   │   └── custom-error.js  # Error handling
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── routes/
│   │   └── main.js          # API routes
│   └── app.js               # Express server setup
├── .env                     # Environment variables (not in repo)
└── README.md                # This file
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm start
   ```

## How It Works

### Authentication Flow

1. **Login**:
   - User submits credentials
   - Server validates credentials
   - Server generates:
     - Access token (short-lived, 15s)
     - Refresh token (long-lived, 1 day)
   - Access token returned in response body
   - Refresh token set as HTTP-only cookie

2. **Protected API Requests**:
   - Client includes access token in Authorization header
   - Server validates token using middleware
   - If valid, request proceeds

3. **Token Refresh**:
   - When access token expires (403 response)
   - Client requests new access token using refresh endpoint
   - Server validates refresh token from cookie
   - If valid, new access token is issued

### Security Considerations

- Access tokens stored in memory (not localStorage)
- Refresh tokens in HTTP-only cookies (inaccessible to JavaScript)
- Short-lived access tokens minimize damage if compromised
- Secure and SameSite cookie flags in production

## API Endpoints

- **POST /api/v1/login**
  - Authenticates user and issues tokens
  - Request: `{ username, password }`
  - Response: `{ msg, accessToken }`

- **GET /api/v1/dashboard**
  - Protected route requiring authentication
  - Headers: `Authorization: Bearer <access_token>`
  - Response: `{ msg, secret }`

- **GET /api/v1/refresh**
  - Issues new access token using refresh token
  - Uses cookies for refresh token
  - Response: `{ accessToken }`

## Frontend Implementation

The frontend handles tokens by:
1. Storing access token in memory (variable)
2. Including it in the Authorization header for requests
3. Automatically refreshing on expiration
4. Redirecting to login when session is fully expired

## Development Notes

- In development, cookies use `secure: false`
- For production, set NODE_ENV=production to enable secure cookies
- Access token lifetime is set to 15s for testing - increase for production

## License

[MIT](LICENSE)