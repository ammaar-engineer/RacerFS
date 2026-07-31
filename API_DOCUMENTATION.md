# RacerFS API Documentation

**Base URL**: `http://localhost:3000`  
**API Version**: 1.0  
**Swagger UI**: `/api/docs`

---

## Response Format

Semua endpoint menggunakan format response yang konsisten:

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "errorCode": "",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "data": null
}
```

---

## Authentication

### Token Types

1. **Account Token (JWT)** - Untuk autentikasi user
   - Header: `authorization`
   - Didapat dari: `POST /user/verify-otp`

2. **Access Token** - Untuk file sharing
   - Header: `access-token`
   - Format: `at_xxxxx`
   - Didapat dari: `POST /token/generate-access-token`

---

## API Endpoints

## User Routes (`/user`)

### 1. Request OTP for Register
```
POST /user/register
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "data": {
    "sessionId": "sess_abc123"
  }
}
```

---

### 2. Request OTP for Login
```
POST /user/login
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "data": {
    "sessionId": "sess_abc123"
  }
}
```

---

### 3. Verify OTP
```
POST /user/verify-otp
```

**Body:**
```json
{
  "sessionId": "sess_abc123",
  "otp": "123456"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cara pakai:**
1. Request OTP via `/register` atau `/login`
2. Cek email untuk OTP code
3. Verify OTP dengan `sessionId` yang didapat
4. Simpan `token` untuk request selanjutnya

---

### 4. Delete Account
```
DELETE /user/delete
```

**Headers:**
- `authorization`: JWT token

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Notes:**
- User hanya bisa delete akun sendiri
- Semua file milik user akan terhapus dari storage

---

### 5. Create Test Account (Development Only)
```
GET /user/create-test-account
```

**Headers:**
- `account-test`: email untuk test account

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Token Routes (`/token`)

### 1. Generate Access Token
```
POST /token/generate-access-token
```

**Headers:**
- `authorization`: JWT token

**Response:**
```json
{
  "data": {
    "access_token": "at_abc123xyz"
  }
}
```

**Cara pakai:**
- Generate access token untuk share file dengan user lain
- User lain bisa akses file kamu dengan access token ini

---

### 2. Delete Access Token
```
DELETE /token/delete-access-token
```

**Headers:**
- `authorization`: JWT token

**Body:**
```json
{
  "token": "at_abc123xyz"
}
```

---

## File Routes (`/file`)

### 1. Get File List
```
GET /file/list
```

**Headers:**
- `authorization`: JWT token
- `access-token`: Access token

**Response:**
```json
{
  "data": {
    "files": [
      {
        "id": 1,
        "name": "photo.png",
        "size": 204800,
        "file_type": ".png",
        "is_public": false,
        "file_key": "uuid-string",
        "uploaded_at": "2026-01-01T00:00:00.000Z",
        "user_id": 1
      }
    ]
  }
}
```

**Cara pakai:**
- Jika owner: return semua file
- Jika bukan owner: return hanya file public atau yang dishare

---

### 2. Get Upload URL
```
GET /file/upload-url?file-name=photo.png&file-size=204800
```

**Headers:**
- `authorization`: JWT token

**Query:**
- `file-name`: Nama file
- `file-size`: Ukuran file (bytes)

**Response:**
```json
{
  "data": {
    "url": "https://minio.example.com/bucket",
    "formData": {
      "key": "uuid-file-key",
      "policy": "...",
      "x-amz-algorithm": "AWS4-HMAC-SHA256",
      "x-amz-credential": "...",
      "x-amz-date": "...",
      "x-amz-signature": "..."
    },
    "file_key": "uuid-file-key"
  }
}
```

---

### 3. Confirm Upload
```
POST /file/confirm-upload
```

**Headers:**
- `authorization`: JWT token

**Body:**
```json
{
  "file-name": "photo.png",
  "file-key": "uuid-file-key",
  "file-size": "204800",
  "status": "SUCCESS"
}
```

**Cara pakai upload file:**
1. Request upload URL dari endpoint `/file/upload-url`
2. Upload file ke S3/MinIO menggunakan `formData` yang didapat
3. Confirm upload dengan status `SUCCESS` atau `FAILED`

---

### 4. Get Download URL
```
GET /file/download-url?file-name=photo.png
```

**Headers:**
- `authorization`: JWT token
- `access-token`: Access token

**Query:**
- `file-name`: Nama file

**Response:**
```json
{
  "data": {
    "url": "https://s3.amazonaws.com/bucket/file?signature=..."
  }
}
```

**Cara pakai:**
- Use presigned URL untuk direct download dari S3
- URL valid untuk waktu terbatas (biasanya 15 menit)

---

### 5. Rename File
```
PATCH /file/rename
```

**Headers:**
- `authorization`: JWT token
- `access-token`: Access token

**Body:**
```json
{
  "file-name": "old-name.txt",
  "new-name": "new-name.txt"
}
```

---

### 6. Delete File
```
DELETE /file/delete
```

**Headers:**
- `authorization`: JWT token

**Body:**
```json
{
  "file-name": "photo.png"
}
```

**Notes:**
- File akan dihapus dari database dan storage

---

### 7. Set File Visibility
```
PATCH /file/set-visibility
```

**Headers:**
- `authorization`: JWT token

**Body:**
```json
{
  "file-name": "photo.png",
  "is_public": true
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "photo.png",
    "is_public": true,
    // ... file details
  }
}
```

---

### 8. Get Storage Info
```
GET /file/storage-info
```

**Headers:**
- `authorization`: JWT token

**Response:**
```json
{
  "data": {
    "used": 1048576,
    "total": 5368709120,
    "file_count": 10
  }
}
```

**Notes:**
- `used` dan `total` dalam bytes

---

## Snippet Routes (`/snippet`)

### 1. Get Snippet List
```
GET /snippet/list
```

**Headers:**
- `authorization`: JWT token

**Response:**
```json
{
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

### 2. Create Snippet
```
POST /snippet/create
```

**Headers:**
- `authorization`: JWT token

**Body:**
```json
{
  "alias": "gs",
  "command": "git status",
  "description": "Shows git status"
}
```

**Notes:**
- `description` field optional
- `alias` harus unique per user

---

### 3. Edit Snippet
```
PATCH /snippet/edit?alias=gs
```

**Headers:**
- `authorization`: JWT token

**Query:**
- `alias`: Alias snippet yang akan diedit

**Body:**
```json
{
  "command": "git status --short"
}
```

---

### 4. Delete Snippet
```
DELETE /snippet/delete?alias=gs
```

**Headers:**
- `authorization`: JWT token

**Query:**
- `alias`: Alias snippet yang akan dihapus

---

## Payment Routes (`/payment`)

### 1. Buy Storage
```
GET /payment/buy-storage
```

**Headers:**
- `authorization`: JWT token

**Response:**
```json
{
  "message": "Added 100mb+ to storage"
}
```

**Notes:**
- Placeholder untuk payment integration
- Saat ini langsung menambah 100MB tanpa payment verification

---

## Usage Flow Examples

### Flow 1: Register & Login
```bash
# 1. Register
POST /user/register
Body: {"email": "user@example.com"}
→ Response: {"sessionId": "sess_xxx"}

# 2. Verify OTP
POST /user/verify-otp
Body: {"sessionId": "sess_xxx", "otp": "123456"}
→ Response: {"token": "eyJhbGc..."}

# 3. Simpan token untuk request selanjutnya
```

### Flow 2: Upload File
```bash
# 1. Get upload URL
GET /file/upload-url?file-name=photo.png&file-size=204800
Header: authorization: <token>
→ Response: {url, formData, file_key}

# 2. Upload ke S3/MinIO
POST <url>
Form-data: Use formData from step 1 + file

# 3. Confirm upload
POST /file/confirm-upload
Header: authorization: <token>
Body: {file-name, file-key, file-size, status: "SUCCESS"}
```

### Flow 3: File Sharing
```bash
# 1. Owner generate access token
POST /token/generate-access-token
Header: authorization: <owner_token>
→ Response: {"access_token": "at_xyz"}

# 2. Share "at_xyz" dengan user lain

# 3. User lain akses file
GET /file/list
Headers:
  authorization: <their_token>
  access-token: at_xyz
→ Response: {files: [...]}
```

### Flow 4: Snippet Management
```bash
# 1. Create snippet
POST /snippet/create
Body: {alias: "gs", command: "git status"}

# 2. List snippets
GET /snippet/list

# 3. Edit snippet
PATCH /snippet/edit?alias=gs
Body: {command: "git status --short"}

# 4. Delete snippet
DELETE /snippet/delete?alias=gs
```

---

## Client Implementation Notes

### Error Handling
- Selalu check field `success` di response
- Display `message` untuk user feedback
- Log `errorCode` untuk debugging

### File Upload Best Practice
- Validate file size sebelum request upload URL
- Implement upload progress indicator
- Handle upload failure dengan retry mechanism
- Always confirm upload status

### Token Management
- Store JWT token secara aman
- Jangan expose token di URL atau logs
- Implement token refresh jika expired

### Testing
- Use Swagger UI di `/api/docs` untuk test manual
- Create test account via `/user/create-test-account` untuk development
- Use Postman/Insomnia untuk automated testing

---

**Last Updated**: 2026-07-31
