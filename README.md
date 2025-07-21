# Nexnode Real Estate API

Foundational backend infrastructure for building comprehensive real estate solutions with modern web technologies.

##  Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
nexnode.vercel.app

 Tech Stack
Express.js - Web framework
MongoDB - Database
Redis - Caching
TypeScript - Language
JWT - Authentication
Socket.io - Real-time communication
Rollbar - Error tracking

 Key Features
User authentication with multi-factor auth
Real estate property management
Google OAuth integration
Rate limiting and security features
Email and SMS notifications


### 2. API Documentation (api-docs.md)


##  Authentication Flow Overview

### Complete User Journey Map

**New User Path:**
1. **Registration Form** → **Email Verification** → **Dashboard Access**
2. **Form Validation** → **API Call** → **OTP Delivery** → **OTP Verification** → **Success State**

**Returning User Path:**
1. **Login Form** → **2FA Verification** → **Dashboard Access**
2. **Credential Check** → **OTP Generation** → **OTP Verification** → **JWT  Token** → **Protected Routes**

### State Management Strategy

**Authentication States to Track:**
- `UNAUTHENTICATED` - No user session
- `REGISTERING` - Registration in progress
- `PENDING_EMAIL_VERIFICATION` - Awaiting email verification
- `LOGGING_IN` - Login credentials submitted
- `PENDING_2FA` - Awaiting 2FA verification
- `AUTHENTICATED` - Full access granted
- `SESSION_EXPIRED` - Token expired, needs refresh


**User Data to Store:**
- Authentication status
- User profile information
- JWT token and expiration
- Current step in authentication flow
- Temporary user ID for 2FA
- Error messages and validation states

### baseUrl = /api/v1/

### Registration Flow
1. `POST {{baseUrl}}/auth/register` → Get user ID
2. `POST {{baseUrl}}/auth/verify-email` → Account activated
3. Redirect to login

**Required Fields:**
- **Full Name**: Minimum 3 characters, maximum 100 characters
- **Email Address**: Valid email format, case-insensitive
- **Password**: Complex validation rules
- **Phone Number**: Optional, international format
- **Role**: CLIENT or ADMIN (default: CLIENT)


**Password Validation Rules:**
- Minimum 8 characters length
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- Special characters allowed: @$!%*?&,.
- Must not match common passwords

##  Email Verification Implementation

### Verification Process Overview

**User Experience Flow:**
1. User receives email with 6-digit OTP code
2. User enters OTP in verification form
3. Frontend validates OTP format
4. API verifies OTP and activates account
5. User redirects to login or dashboard

###  Resend OTP
**Endpoint:** `POST {{baseUrl}}/auth/resend-otp`


##  User Login & 2FA Process

### Login Flow
1. `POST {{baseUrl}}/auth/login` → Get user ID for 2FA
2. `POST {{baseUrl}}/auth/verify-login-otp` → Get JWT token
3. Store token, redirect to dashboard


### Two-Step Login Flow

**Step 1: Credential Authentication**
- User submits email and password
- API validates credentials and user status
- API sends 2FA OTP to user's email
- Frontend receives user ID and OTP expiration time

**Step 2: 2FA Verification**
- User enters 6-digit OTP from email
- API verifies OTP and completes login
- Frontend receives JWT token and user data
- User gains access to protected routes



###  Google OAuth Integration

### Google OAuth Flow Overview
**Endpoint:** `POST {{baseUrl}}/auth/google-login`

**User Experience:**
1. User clicks "Sign in with Google" button
2. Google OAuth popup opens
3. User selects Google account and grants permissions
4. Google returns ID token to frontend
5. Frontend sends ID token to API
6. API validates token and creates/authenticates user
7. User receives JWT token and accesses dashboard



##  Password Management

### Password Reset Flow

### Password Reset Flow
1. `POST {{baseUrl}}/auth/request-password-reset` → OTP sent
2. `POST {{baseUrl}}/auth/verify-password-reset` → Verify OTP
3. `POST {{baseUrl}}/auth/reset-password` → Password updated


**User Experience Journey:**
1. **Forgot Password**: User clicks forgot password link
2. **Email Entry**: User enters email address
3. **OTP Delivery**: System sends reset OTP to email
4. **OTP Verification**: User enters OTP code
5. **New Password**: User creates new secure password
6. **Confirmation**: Password successfully updated


###  Logout

**Endpoint:** `POST {{baseUrl}}/auth/logout`




###  Get User Profile (Protected Route)

**Endpoint:** `GET {{baseUrl}}/auth/profile`




## Error Handling Strategy

### Comprehensive Error Management

**Error Categories:**
- **Validation Errors**: Form field validation failures
- **Authentication Errors**: Credential or token issues
- **Network Errors**: Connection or timeout problems
- **Rate Limiting**: Too many requests errors
- **Server Errors**: Internal server problems

### Error Response Format

**Standard Error Structure:**
All API errors follow consistent format with:
- Success flag (false)
- Error object with code, message, status
- Optional details for specific field errors
- Timestamp and request path information

**Error Code Mapping:**
- **400**: Bad request, validation errors
- **401**: Unauthorized, authentication required
- **403**: Forbidden, insufficient permissions
- **404**: Not found, resource doesn't exist
- **409**: Conflict, duplicate resource
- **429**: Too many requests, rate limited
- **500**: Internal server error

##  Security Implementation

### Client-Side Security Best Practices

**Token Storage Security:**
- **Secure Storage**: Use httpOnly cookies when possible
- **Storage Encryption**: Encrypt sensitive data in localStorage
- **Token Expiration**: Implement automatic token cleanup
- **XSS Protection**: Sanitize all user inputs

**Request Security:**
- **HTTPS Only**: All API requests over secure connections
- **CSRF Protection**: Include CSRF tokens in state-changing requests
- **Header Validation**: Proper Content-Type and Authorization headers
- **Input Sanitization**: Clean all user inputs before API submission

### Authentication Security Measures

**Password Security:**
- **Client Validation**: Match server-side password requirements
- **Secure Transmission**: Never log or cache passwords
- **Password Masking**: Proper input field types
- **Strength Indicators**: Visual feedback for password strength

**Session Security:**
- **Automatic Logout**: Implement idle timeout
- **Concurrent Sessions**: Handle multiple session scenarios
- **Session Validation**: Regular token validity checks
- **Secure Logout**: Complete session cleanup
