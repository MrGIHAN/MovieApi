# Security Guidelines

This document outlines the security measures implemented in the Movie Streaming Platform and best practices for maintaining security.

## 🔒 Security Features Implemented

### Authentication & Authorization
- **JWT Authentication**: Stateless authentication using JSON Web Tokens
- **Refresh Tokens**: Separate refresh tokens for secure token renewal
- **Role-based Access Control**: Admin and User roles with appropriate permissions
- **Password Hashing**: BCrypt password hashing with salt

### Input Validation
- **Request Validation**: Jakarta Bean Validation annotations on all DTOs
- **SQL Injection Prevention**: Parameterized queries through JPA
- **Path Traversal Protection**: Filename sanitization and path validation
- **File Upload Security**: File type and size restrictions

### Error Handling
- **Global Exception Handler**: Centralized error handling without sensitive data exposure
- **Structured Error Responses**: Consistent error format for API responses
- **Security Logging**: Comprehensive logging of security events

### Configuration Security
- **Environment Variables**: All sensitive configuration externalized
- **Profile-based Security**: Development endpoints restricted to non-production profiles
- **CORS Configuration**: Configurable CORS policies
- **Security Headers**: Appropriate HTTP security headers

## 🛡️ Security Best Practices

### Environment Setup
1. **Use Environment Variables**: Never commit secrets to version control
2. **Strong JWT Secrets**: Use secrets at least 512 bits for HS512 algorithm
3. **Database Credentials**: Use separate database users with minimal privileges
4. **HTTPS**: Always use HTTPS in production

### Password Security
- Minimum 8 characters for user passwords
- BCrypt hashing with automatic salt generation
- No password storage in logs or error messages

### File Security
- Videos stored outside web root
- Path traversal protection
- File type validation
- Access control on file streaming

### API Security
- Rate limiting (recommended for production)
- Request size limits
- Authentication required for sensitive endpoints
- Admin-only endpoints properly protected

## 🚨 Security Checklist for Production

### Infrastructure
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure firewall rules
- [ ] Set up database access restrictions
- [ ] Enable database SSL/TLS
- [ ] Configure reverse proxy (nginx/Apache)

### Application Configuration
- [ ] Set `SPRING_PROFILES_ACTIVE=production`
- [ ] Use strong, unique JWT secrets
- [ ] Configure secure database credentials
- [ ] Set appropriate CORS origins
- [ ] Enable security headers
- [ ] Configure logging levels appropriately

### Monitoring & Maintenance
- [ ] Set up security monitoring
- [ ] Configure log aggregation
- [ ] Regular security updates
- [ ] Backup strategy implementation
- [ ] Incident response plan

## 🔧 Environment Variables

### Required Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your-very-long-secure-jwt-secret-key-at-least-512-bits-long
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/moviedb
DB_USERNAME=your_db_username
DB_PASSWORD=your_secure_db_password

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Other Security Settings
SPRING_PROFILES_ACTIVE=production
```

### Optional Security Enhancements
```bash
# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Session Timeout
SESSION_TIMEOUT=1800

# File Upload Limits
MAX_FILE_SIZE=50MB
MAX_REQUEST_SIZE=50MB
```

## 🚨 Known Security Considerations

### Current Limitations
1. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for enhanced security)
2. **Rate Limiting**: Not implemented (recommended for production)
3. **Account Lockout**: No automatic account lockout on failed attempts
4. **Password Complexity**: Basic requirements (consider stronger policies)

### Recommended Enhancements
1. Implement rate limiting with Redis
2. Add account lockout mechanisms
3. Implement session management
4. Add two-factor authentication
5. Regular security audits
6. Implement Content Security Policy (CSP)

## 📞 Reporting Security Issues

If you discover a security vulnerability, please:
1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [security@yourdomain.com]
3. Provide detailed information about the vulnerability
4. Allow reasonable time for response before public disclosure

## 🔄 Security Updates

This security documentation should be reviewed and updated:
- When adding new features
- After security audits
- When dependencies are updated
- At least quarterly

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Review Status**: ✅ Reviewed