# Backend Route Analysis - RacerFS

Dokumentasi analisis controller yang ada di `backend/src/routes`

---

## Ringkasan Eksekutif

Terdapat **3 controller** dengan total **17 endpoints**:

1. **File Controller** - 8 endpoints (Kompleksitas: Tinggi)
2. **Snippet Controller** - 4 endpoints (Kompleksitas: Sedang)  
3. **User Controller** - 5 endpoints (Kompleksitas: Sedang)

---

## 1. File Controller

**Path:** `backend/src/routes/file/controller.ts`
**Kompleksitas:** Tinggi (190 baris, 8 endpoints)

### Dependencies
- `PermissionGlobalBridge` - Validasi permission dan ownership
- `FileBridgeModules` - Business logic layer
- `FileDbModules` - Database operations
- `FileRawModules` - DTO validation
- `FileDbinioModules` - MinIO storage operations

### Endpoints

| Method | Route | Fungsi | Auth Type | Line |
|--------|-------|--------|-----------|------|
| GET | `/file/list` | Mendapatkan daftar file user | Account Token + Access Token | 18-36 |
| GET | `/file/download-url` | Generate presigned URL untuk download | Account Token + Access Token | 38-61 |
| GET | `/file/upload-url` | Generate presigned URL untuk upload | Account Token | 63-81 |
| POST | `/file/confirm-upload` | Konfirmasi setelah upload ke MinIO | Account Token | 83-103 |
| PATCH | `/file/rename` | Rename file | Account Token + Access Token | 105-123 |
| DELETE | `/file/delete` | Hapus file | Account Token + Access Token | 125-142 |
| POST | `/file/generate-access-token` | Generate token untuk sharing | Account Token | 144-154 |
| DELETE | `/file/delete-access-token` | Hapus access token | Account Token | 156-167 |
| PATCH | `/file/set-visibility` | Set file public/private | Account Token | 169-189 |

### Fitur Utama
- **Dual Authentication System**: Menggunakan `authorization` (account token) dan `access-token` (sharing token)
- **File Sharing**: Access token temporary untuk share file ke user lain
- **MinIO Integration**: Presigned URLs untuk upload/download yang aman
- **Visibility Control**: File bisa di-set public atau private

### Pola Arsitektur
```typescript
// Pattern yang digunakan:
1. Validate DTO (headers, query, body)
2. Check permission (isOwnerAction / isValidAccountToken)
3. Execute business logic (bridge/db layer)
4. Return standardized response (SuccessResponse)
```

### Code References
- File list: `backend/src/routes/file/controller.ts:18-36`
- Download URL: `backend/src/routes/file/controller.ts:38-61`
- Upload URL: `backend/src/routes/file/controller.ts:63-81`
- Confirm upload: `backend/src/routes/file/controller.ts:83-103`
- Rename: `backend/src/routes/file/controller.ts:105-123`
- Delete: `backend/src/routes/file/controller.ts:125-142`
- Generate access token: `backend/src/routes/file/controller.ts:144-154`
- Delete access token: `backend/src/routes/file/controller.ts:156-167`
- Set visibility: `backend/src/routes/file/controller.ts:169-189`

### Observasi
- Controller paling kompleks dengan 8 endpoints
- Sistem sharing file yang sophisticated dengan access token
- Security best practice dengan presigned URLs
- Console.log statements masih ada (debugging artifacts)

---

## 2. Snippet Controller

**Path:** `backend/src/routes/snippet/controller.ts`
**Kompleksitas:** Sedang (75 baris, 4 endpoints)

### Dependencies
- `PermissionGlobalBridge` - Validasi account token
- `SnippetRawModules` - DTO validation
- `SnippetDbModules` - Database operations

### Endpoints

| Method | Route | Fungsi | Auth Type | Line |
|--------|-------|--------|-----------|------|
| GET | `/snippet/list` | Mendapatkan semua snippet user | Account Token | 15-23 |
| POST | `/snippet/create` | Buat snippet baru | Account Token | 25-48 |
| DELETE | `/snippet/delete` | Hapus snippet by alias | Account Token | 50-60 |
| PATCH | `/snippet/edit` | Update command di snippet | Account Token | 62-74 |

### Fitur Utama
- **Simple CRUD**: Standard Create, Read, Update, Delete operations
- **Alias-based Identification**: Menggunakan `alias` sebagai unique identifier
- **Account-scoped**: Setiap user hanya bisa manage snippet miliknya
- **Command Storage**: Menyimpan command/code snippets untuk reuse

### Pola Arsitektur
```typescript
// Pattern yang digunakan:
1. Validate DTO (headers, query, body)
2. Extract user_id dari account token
3. Execute database operation
4. Return standardized response
```

### Code References
- List snippets: `backend/src/routes/snippet/controller.ts:15-23`
- Create snippet: `backend/src/routes/snippet/controller.ts:25-48`
- Delete snippet: `backend/src/routes/snippet/controller.ts:50-60`
- Edit snippet: `backend/src/routes/snippet/controller.ts:62-74`

### Observasi
- Controller paling sederhana dan straightforward
- Tidak ada sistem sharing atau access token
- Clean CRUD implementation
- Cocok untuk menyimpan command shortcuts

---

## 3. User Controller

**Path:** `backend/src/routes/user/controller.ts`
**Kompleksitas:** Sedang (57 baris, 5 endpoints)

### Dependencies
- `UserBridgeModules` - Business logic untuk user operations
- `SessionBridgeModules` - Session management untuk OTP
- `UserDbModules` - Database operations
- `JwtService` - JWT token generation

### Endpoints

| Method | Route | Fungsi | Auth Type | Status | Line |
|--------|-------|--------|-----------|--------|------|
| POST | `/user/register` | Initiate registration (kirim OTP) | None | Working | 18-23 |
| POST | `/user/login` | Initiate login (kirim OTP) | None | Working | 25-30 |
| POST | `/user/verify-otp` | Verify OTP untuk login/register | Session-based | Working | 32-38 |
| DELETE | `/user/delete` | Delete account | Unknown | Empty | 40-43 |
| GET | `/user/create-test-account` | Create test account | None | Dev only | 45-55 |

### Fitur Utama
- **Passwordless Authentication**: OTP-based login/register via email
- **Session-based Flow**: Menggunakan `sessionId` untuk track OTP verification
- **Email-only**: Tidak perlu password, hanya email
- **JWT Token**: Generate JWT setelah OTP verified

### Authentication Flow
```
1. POST /user/register atau /user/login
   Input: { email }
   Output: { sessionId }
   Action: Kirim OTP ke email

2. POST /user/verify-otp
   Input: { sessionId, otp }
   Output: { token }
   Action: Verify OTP, return JWT token

3. Use JWT token di Authorization header untuk endpoint lain
```

### Code References
- Register: `backend/src/routes/user/controller.ts:18-23`
- Login: `backend/src/routes/user/controller.ts:25-30`
- Verify OTP: `backend/src/routes/user/controller.ts:32-38`
- Delete account: `backend/src/routes/user/controller.ts:40-43` (Empty)
- Test account: `backend/src/routes/user/controller.ts:45-55` (Dev endpoint)

### Issues & Warnings

#### Critical Issues
1. **Empty Delete Endpoint** (`controller.ts:40-43`)
   ```typescript
   @Delete("delete")
   async deleteAccount() {
       // Empty implementation
   }
   ```
   - Endpoint ada tapi tidak ada implementasi
   - Perlu implementasi untuk delete user data dan cleanup

2. **Test Endpoint in Production** (`controller.ts:45-55`)
   ```typescript
   @Get("create-test-account")
   async createTestAccount() {
       const createEmail = await this.dbUser.createNewEmail("ammaar@gmail.com")
       // ... hardcoded test email
   }
   ```
   - Hardcoded email: `ammaar@gmail.com`
   - Endpoint ini seharusnya dihapus atau di-guard dengan environment check
   - Security risk jika di-deploy ke production

#### Security Recommendations
- Rate limiting untuk OTP endpoints (prevent brute force)
- OTP expiration validation
- Maximum retry attempts untuk OTP
- Email verification untuk prevent spam registration

---

## Pola Arsitektur Umum

Semua controller mengikuti pattern yang konsisten:

### 2. Input Validation
Semua input divalidasi menggunakan DTO:
```typescript
const headerData = await this.rawModule.validateSourceDTO(HeaderDTO, headers)
const queryData = await this.rawModule.validateSourceDTO(QueryDTO, query)
const bodyData = await this.rawModule.validateSourceDTO(BodyDTO, body)
```

### 3. Permission Checking
```typescript
// Check if user is owner
const {isOwner, accountToken_user_id} = await this.permissionBridge.isOwnerAction(
    authorization, 
    accessToken,
    {throwError: false}
)

// Validate account token
const {user_id} = this.permissionBridge.isValidAccountToken(authorization)
```

### 4. Standardized Response
```typescript
return SuccessResponse(message, data)
```

---

## Token System

### Account Token (JWT)
- Digenerate setelah login/register berhasil
- Digunakan di header `authorization`
- Mengidentifikasi user yang sedang login
- Berlaku untuk semua endpoint yang memerlukan auth

### Access Token (File Sharing)
- Digenerate untuk sharing file temporary
- Digunakan di header `access-token`
- Memberikan akses ke file specific tanpa login
- Bisa di-delete kapan saja oleh owner

---

## Rekomendasi Perbaikan

### High Priority
1. Implementasi `deleteAccount()` endpoint di User Controller
2. Remove atau protect `create-test-account` endpoint
3. Tambahkan rate limiting untuk OTP endpoints

### Medium Priority
4. Remove console.log statements di File Controller
5. Add comprehensive error handling
6. Add request/response logging middleware

### Low Priority
7. Add API documentation (Swagger/OpenAPI)
8. Add endpoint response caching where applicable
9. Add metrics/monitoring untuk track endpoint usage

---

## Summary

### Controller Complexity Ranking
1. **File Controller** (Tinggi) - 8 endpoints, dual auth, MinIO integration
2. **User Controller** (Sedang) - 5 endpoints, OTP flow, session management
3. **Snippet Controller** (Sedang) - 4 endpoints, simple CRUD

### Architecture Strengths
- Konsistensi pattern di semua controller
- Clear separation of concerns (Controller → Bridge → DB)
- Type-safe dengan DTO validation
- Standardized response format
- Security-conscious (permission checking, presigned URLs)

### Architecture Weaknesses
- Missing implementation (delete account)
- Test code in production
- No rate limiting
- Console.log statements
- Hardcoded values

---

**Last Updated:** 2026-07-23
**Analyzed By:** OpenCode AI Assistant
