# RacerFS Backend Documentation

## Overview

RacerFS Backend adalah REST API yang dibangun dengan NestJS untuk mengelola file storage, autentikasi user, snippet commands, dan sistem payment. Backend menggunakan pola OTP-based authentication dan menyediakan sistem file sharing dengan access tokens.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Storage**: S3-compatible (MinIO/AWS S3)
- **Authentication**: JWT + OTP via Email
- **Documentation**: Swagger/OpenAPI

## Base URL

```
http://localhost:<PORT>/
```

---

## Architecture

### Directory Structure

```
backend/src/
├── routes/           # Controllers (API Endpoints)
│   ├── file/
│   ├── user/
│   ├── snippet/
│   └── payments/
├── services/         # Business Logic
├── validation/       # DTO & Validators
├── global_services/  # Shared Services (JWT, Token)
└── utilities/        # Helper Functions
```

### Design Patterns

- **DTO Validation**: Semua input divalidasi menggunakan `DtoUtilites.validateSourceDTO()`
- **Service Layer**: Business logic terpisah dari controller
- **Consistent Response**: Menggunakan `SuccessResponse()` utility
- **Token-based Auth**: JWT untuk user authentication, custom token untuk file sharing

---

## Authentication

### Token Types

1. **Account Token (JWT)**
   - Digunakan untuk autentikasi user
   - Header: `authorization`
   - Payload: `{ user_id, type: "account_token" }`

2. **Access Token (Custom)**
   - Digunakan untuk file sharing
   - Header: `access-token`
   - Generated per-file, bisa direvoke

### Authentication Flow

```mermaid
sequenceDiagram
    User->>API: POST /user/register {email}
    API->>User: {sessionId}
    User->>Email: Get OTP Code
    User->>API: POST /user/verify-otp {sessionId, otp}
    API->>User: {token: JWT}
    User->>API: Requests with Authorization: JWT
```

---

## API Endpoints

## 1. User Management (`/user`)

### `POST /user/register`

Request OTP untuk registrasi akun baru.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP Has been sent to your email",
  "errorCode": "",
  "data": {
    "sessionId": "sess_abc123xyz"
  }
}
```

---

### `POST /user/login`

Request OTP untuk login.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP Has been sent to your email",
  "errorCode": "",
  "data": {
    "sessionId": "sess_abc123xyz"
  }
}
```

---

### `POST /user/verify-otp`

Verifikasi OTP dan dapatkan JWT token.

**Request Body:**
```json
{
  "sessionId": "sess_abc123xyz",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "errorCode": "",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `DELETE /user/delete`

Hapus akun user beserta semua file.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Account deleted successfully",
  "errorCode": "",
  "data": null
}
```

⚠️ **Security Note**: Endpoint ini tidak memerlukan JWT token, hanya email. Pertimbangkan untuk menambahkan autentikasi tambahan di production.

---

### `GET /user/create-test-account`

**[TESTING ONLY]** Buat akun test tanpa OTP.

**Headers:**
```
account-test: test@example.com
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Account for test and token",
  "errorCode": "",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

⚠️ **Warning**: Disable endpoint ini di production environment!

---

## 2. File Management (`/file`)

### `GET /file/list`

Ambil daftar file milik user.

**Headers:**
```
authorization: Bearer <jwt_token>
access-token: <optional_access_token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "File list retrieved successfully",
  "errorCode": "",
  "data": {
    "files": [
      {
        "id": 1,
        "name": "photo.png",
        "size": 204800,
        "is_public": false,
        "file_key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "uploaded_at": "2026-01-01T00:00:00.000Z",
        "user_id": 1
      }
    ]
  }
}
```

---

### `GET /file/get-presigned-upload`

Dapatkan presigned URL untuk upload file ke storage.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
filename: photo.png
filesize: 204800
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Presigned URL generated",
  "errorCode": "",
  "data": {
    "upload_url": "https://s3.example.com/bucket/...",
    "file_key": "uuid-generated-key",
    "expires_in": 3600
  }
}
```

**Flow:**
1. Request presigned URL dari backend
2. Upload file langsung ke S3 menggunakan presigned URL
3. Call `/file/confirm-upload` setelah upload selesai

---

### `POST /file/confirm-upload`

Konfirmasi bahwa upload file sudah selesai dan simpan metadata ke database.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "file_key": "uuid-generated-key"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "File upload confirmed",
  "errorCode": "",
  "data": {
    "file": {
      "id": 1,
      "name": "photo.png",
      "file_key": "uuid-generated-key",
      "uploaded_at": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

---

### `GET /file/download`

Dapatkan presigned URL untuk download file.

**Headers:**
```
authorization: Bearer <jwt_token>
access-token: <optional_for_shared_files>
```

**Query Parameters:**
```
file_key: uuid-generated-key
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Download URL generated",
  "errorCode": "",
  "data": {
    "download_url": "https://s3.example.com/bucket/...",
    "expires_in": 3600
  }
}
```

**Features:**
- Support file milik sendiri (dengan JWT)
- Support shared file (dengan access-token)

---

### `DELETE /file/delete`

Hapus multiple files sekaligus.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "file_keys": [
    "uuid-key-1",
    "uuid-key-2"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Files deleted successfully",
  "errorCode": "",
  "data": {
    "deleted_count": 2
  }
}
```

---

### `PATCH /file/rename`

Ubah nama file.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "file_key": "uuid-key",
  "new_name": "new_photo.png"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "File renamed successfully",
  "errorCode": "",
  "data": {
    "file": {
      "id": 1,
      "name": "new_photo.png",
      "file_key": "uuid-key"
    }
  }
}
```

---

### `PATCH /file/set-visibility`

Set file menjadi public atau private.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "file_key": "uuid-key",
  "visibility": true
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "File visibility updated",
  "errorCode": "",
  "data": {
    "file": {
      "id": 1,
      "is_public": true,
      "file_key": "uuid-key"
    }
  }
}
```

---

### `POST /file/generate-access-token`

Generate token untuk sharing file.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "file_key": "uuid-key"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Access token generated",
  "errorCode": "",
  "data": {
    "access_token": "at_xyz123abc",
    "file_key": "uuid-key",
    "expires_at": "2026-02-01T00:00:00.000Z"
  }
}
```

**Use Case:**
User A ingin share file ke User B tanpa harus share JWT token mereka. User A generate access token, kirim token tersebut ke User B, lalu User B bisa download file dengan access token.

---

### `DELETE /file/delete-access-token`

Revoke/hapus access token.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "access_token": "at_xyz123abc"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Access token deleted",
  "errorCode": "",
  "data": null
}
```

---

### `GET /file/storage-info`

Dapatkan informasi storage user.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Storage info retrieved successfully",
  "errorCode": "",
  "data": {
    "used": 1048576,
    "total": 5368709120,
    "file_count": 10
  }
}
```

**Info:**
- `used`: bytes terpakai
- `total`: total storage yang dimiliki user
- `file_count`: jumlah file yang diupload

---

## 3. Snippet Management (`/snippet`)

Snippet adalah command shortcuts yang bisa disimpan user untuk mempercepat workflow CLI mereka.

### `GET /snippet/list`

Ambil semua snippet milik user.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Snippet list retrieved successfully",
  "errorCode": "",
  "data": {
    "snippets": [
      {
        "id": 1,
        "alias": "gs",
        "description": "Shows git status",
        "command": "git status",
        "user_id": 1,
        "created_at": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### `POST /snippet/create`

Buat snippet baru.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "alias": "gs",
  "command": "git status",
  "description": "Shows git status"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Snippet created successfully",
  "errorCode": "",
  "data": {
    "snippet": {
      "id": 1,
      "alias": "gs",
      "description": "Shows git status",
      "command": "git status",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

---

### `DELETE /snippet/delete`

Hapus snippet berdasarkan alias.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
alias: gs
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Snippet 'gs' deleted successfully",
  "errorCode": "",
  "data": null
}
```

---

### `PATCH /snippet/edit`

Update command dari snippet.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
alias: gs
```

**Request Body:**
```json
{
  "command": "git status --short"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Snippet 'gs' updated successfully",
  "errorCode": "",
  "data": {
    "snippet": {
      "id": 1,
      "alias": "gs",
      "description": "Shows git status",
      "command": "git status --short",
      "user_id": 1,
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 4. Payment (`/payment`)

### `GET /payment/buy-storage`

Tambah 100MB storage ke akun user.

**Headers:**
```
authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Added 100mb+ to storage",
  "errorCode": "",
  "data": null
}
```

**Notes:**
- Hardcoded 100MB (104857600 bytes)
- Belum ada payment gateway integration
- Webhook/callback endpoint belum diimplementasi

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message here",
  "errorCode": "ERROR_CODE",
  "data": null
}
```

### Common Error Codes

- `401`: Unauthorized (invalid/expired token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource tidak ditemukan)
- `400`: Bad Request (validation error)
- `500`: Internal Server Error

---

## Security Considerations

### ✅ Good Practices

1. **JWT Authentication**: Digunakan untuk sebagian besar endpoint
2. **DTO Validation**: Input validation pada semua endpoint
3. **File Access Control**: User hanya bisa akses file mereka sendiri
4. **Access Token System**: File sharing tanpa expose JWT
5. **Storage Quota**: Ada pengecekan storage sebelum upload

### ⚠️ Security Concerns

1. **Test Account Endpoint** (`/user/create-test-account`)
   - Tidak ada authentication
   - Sebaiknya disable di production atau tambahkan secret key

2. **Delete Account Endpoint** (`/user/delete`)
   - Tidak require JWT token, hanya email
   - Potential account deletion by knowing someone's email
   - **Recommendation**: Require JWT token + password/OTP confirmation

3. **OTP System**
   - Pastikan rate limiting untuk prevent brute force
   - Set expiry time untuk OTP
   - Limit jumlah request OTP per email

4. **Presigned URLs**
   - Set expiration time yang reasonable
   - Monitor untuk prevent abuse

---

## File Upload Flow

```mermaid
sequenceDiagram
    participant Client
    participant Backend
    participant S3

    Client->>Backend: GET /file/get-presigned-upload?filename=x&filesize=y
    Backend->>Backend: Check storage quota
    Backend->>S3: Generate presigned URL
    Backend->>Client: {upload_url, file_key}
    
    Client->>S3: PUT file to upload_url
    S3->>Client: 200 OK
    
    Client->>Backend: POST /file/confirm-upload {file_key}
    Backend->>Backend: Save metadata to DB
    Backend->>Client: {file info}
```

---

## File Sharing Flow

```mermaid
sequenceDiagram
    participant UserA
    participant Backend
    participant UserB

    UserA->>Backend: POST /file/generate-access-token {file_key}
    Backend->>UserA: {access_token}
    
    UserA->>UserB: Share access_token
    
    UserB->>Backend: GET /file/download?file_key=x<br/>Header: access-token
    Backend->>Backend: Validate access token
    Backend->>UserB: {download_url}
    
    Note over UserA,Backend: Optional: Revoke access
    UserA->>Backend: DELETE /file/delete-access-token
```

---

## Development Guidelines

### Adding New Endpoints

1. Create DTO in `src/validation/`
2. Add validation logic
3. Create/update service in `src/services/`
4. Add controller method with Swagger decorators
5. Update this documentation

### Testing Endpoints

Use the test account endpoint for quick testing:

```bash
# Create test account
curl -X GET http://localhost:3000/user/create-test-account \
  -H "account-test: test@example.com"

# Use the returned token
TOKEN="<returned_jwt_token>"

# Test authenticated endpoints
curl -X GET http://localhost:3000/file/list \
  -H "authorization: Bearer $TOKEN"
```

---

## Deployment Checklist

- [ ] Disable `/user/create-test-account` endpoint
- [ ] Secure `/user/delete` endpoint (require JWT + confirmation)
- [ ] Set up rate limiting untuk OTP endpoints
- [ ] Configure CORS properly
- [ ] Set up environment variables
- [ ] Configure S3/MinIO credentials
- [ ] Set JWT secret key
- [ ] Set up email service (SMTP)
- [ ] Configure proper logging
- [ ] Set up monitoring & alerting
- [ ] Add database backup strategy
- [ ] Implement proper error tracking (Sentry, etc)

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/racerfs

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d

# Storage (S3/MinIO)
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=racerfs-files
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Default Storage Quota
DEFAULT_STORAGE_BYTES=5368709120  # 5GB
```

---

## API Testing with cURL

### Complete Flow Example

```bash
# 1. Register
RESPONSE=$(curl -X POST http://localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}')
SESSION_ID=$(echo $RESPONSE | jq -r '.data.sessionId')

# 2. Get OTP from email, then verify
TOKEN=$(curl -X POST http://localhost:3000/user/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"otp\":\"123456\"}" \
  | jq -r '.data.token')

# 3. Get presigned upload URL
UPLOAD_DATA=$(curl -X GET "http://localhost:3000/file/get-presigned-upload?filename=test.txt&filesize=1024" \
  -H "authorization: Bearer $TOKEN")
UPLOAD_URL=$(echo $UPLOAD_DATA | jq -r '.data.upload_url')
FILE_KEY=$(echo $UPLOAD_DATA | jq -r '.data.file_key')

# 4. Upload file to S3
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: text/plain" \
  --data "Hello World"

# 5. Confirm upload
curl -X POST http://localhost:3000/file/confirm-upload \
  -H "authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"file_key\":\"$FILE_KEY\"}"

# 6. List files
curl -X GET http://localhost:3000/file/list \
  -H "authorization: Bearer $TOKEN"

# 7. Generate sharing token
ACCESS_TOKEN=$(curl -X POST http://localhost:3000/file/generate-access-token \
  -H "authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"file_key\":\"$FILE_KEY\"}" \
  | jq -r '.data.access_token')

# 8. Download file (as another user)
DOWNLOAD_URL=$(curl -X GET "http://localhost:3000/file/download?file_key=$FILE_KEY" \
  -H "access-token: $ACCESS_TOKEN" \
  | jq -r '.data.download_url')
curl -X GET "$DOWNLOAD_URL"
```

---

## Swagger Documentation

Swagger UI tersedia di:

```
http://localhost:3000/api/docs
```

Semua endpoint sudah terdokumentasi dengan:
- `@ApiOperation` - Deskripsi endpoint
- `@ApiTags` - Grouping endpoint
- `@ApiHeader` - Required headers
- `@ApiBody` - Request body schema
- `@ApiQuery` - Query parameters
- `@ApiResponse` - Response examples

---

## Change Log

### Latest Changes (Commit: 925c2e0)
- Added Swagger documentation to all backend routes
- Standardized API response format
- Added comprehensive endpoint descriptions

### Previous Changes (Commit: 0debb0f)
- Modified system active logic
- Developed file options for CLI
- Fixed important backend issues

---

## Contributing

Saat menambahkan fitur baru:

1. Follow existing patterns (DTO validation, service layer, etc)
2. Add Swagger documentation
3. Update BACKEND_DOCS.md
4. Write tests (unit & integration)
5. Update environment variables documentation jika perlu

---

## Contact & Support

For issues or questions:
- Repository: [RacerFS GitHub](link-to-repo)
- Developer: ammaar-engineer

---

**Last Updated**: 2026-07-27  
**Version**: 1.0.0  
**Maintained by**: ammaar-engineer
