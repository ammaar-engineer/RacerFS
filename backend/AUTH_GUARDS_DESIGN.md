# Auth Guards & CurrentToken Decorator Design

## 🏗️ Architecture Overview

Sistem authentication menggunakan **Guard-based approach** dengan dua jenis token:

1. **Account Token (JWT)** - Untuk authenticated users
2. **Access Token (Database)** - Untuk file sharing tanpa login

## 📦 Components

### 1. Token Payload Types (`decorators/current-token.decorator.ts`)

```typescript
// Account token dari JWT
interface AccountTokenPayload {
  user_id: number;
  type: 'account_token';
}

// Access token dari database
interface AccessTokenPayload {
  token_id: number;
  user_id: number;
  type: 'file_access_token';
}

type TokenPayload = AccountTokenPayload | AccessTokenPayload;
```

### 2. Guards

#### AccountTokenAuthGuard (`middleware/account-token-auth.guard.ts`)
- Validates JWT dari header `Authorization`
- Extract `user_id` dari JWT payload
- Inject `AccountTokenPayload` ke `request.token`

#### AccessTokenAuthGuard (`middleware/access-token-auth.guard.ts`)
- Validates access token dari header `access-token`
- Query database untuk verify token exists
- Inject `AccessTokenPayload` ke `request.token`

### 3. Decorator (`decorators/current-token.decorator.ts`)

```typescript
@CurrentToken()              // Full payload
@CurrentToken('user_id')     // Extract user_id
@CurrentToken('token_id')    // Extract token_id (access token only)
```

## 🎯 Usage Patterns

### Pattern 1: Account Token Only (Private Endpoints)

```typescript
@Controller('file')
export class FileController {
  @UseGuards(AccountTokenAuthGuard)
  @Post('upload')
  async upload(@CurrentToken('user_id') userId: number) {
    // Only authenticated users can upload
    return await this.fileService.upload(userId, ...);
  }
}
```

**Headers required:**
```
Authorization: Bearer <jwt-token>
```

### Pattern 2: Access Token Only (Public Shared Files)

```typescript
@Controller('file')
export class FileController {
  @UseGuards(AccessTokenAuthGuard)
  @Get('shared')
  async getShared(@CurrentToken('user_id') userId: number) {
    // Anyone with access token can view shared files
    return await this.fileService.getSharedFiles(userId);
  }
}
```

**Headers required:**
```
access-token: at_abc123xyz
```

### Pattern 3: Dual Token Support (Both Account OR Access Token)

```typescript
import { UseGuards } from '@nestjs/common';

@Controller('file')
export class FileController {
  @UseGuards(AccountTokenAuthGuard, AccessTokenAuthGuard)
  @Get('list')
  async getFileList(@CurrentToken() token: TokenPayload) {
    // Check token type to determine access level
    if (token.type === 'account_token') {
      // Full access - owner can see all files
      return await this.fileService.getUserFiles(token.user_id);
    } else {
      // Limited access - only shared files
      return await this.fileService.getSharedFiles(token.user_id);
    }
  }
}
```

**Headers accepted (either one):**
```
Authorization: Bearer <jwt-token>
OR
access-token: at_abc123xyz
```

### Pattern 4: Custom Logic with Token Type

```typescript
@UseGuards(AccountTokenAuthGuard, AccessTokenAuthGuard)
@Get('download')
async download(
  @CurrentToken() token: TokenPayload,
  @Query('file') fileName: string,
) {
  // Type guard for TypeScript
  if (token.type === 'account_token') {
    // Owner download - full access
    return await this.fileService.getOwnerDownloadUrl(token.user_id, fileName);
  } else {
    // Shared download - verify access token has permission
    const accessToken = token as AccessTokenPayload;
    return await this.fileService.getSharedDownloadUrl(
      accessToken.token_id,
      fileName,
    );
  }
}
```

## 🔄 Request Flow

### Account Token Flow
```
Client Request
     ↓
Authorization: Bearer <jwt>
     ↓
AccountTokenAuthGuard
  ├─ Verify JWT signature
  ├─ Check type === 'account_token'
  └─ request.token = { user_id, type }
     ↓
@CurrentToken('user_id')
  └─ Extract user_id from request.token
     ↓
Controller Method
```

### Access Token Flow
```
Client Request
     ↓
access-token: at_abc123
     ↓
AccessTokenAuthGuard
  ├─ Query database for token
  ├─ Verify type === 'file_access_token'
  └─ request.token = { token_id, user_id, type }
     ↓
@CurrentToken('user_id')
  └─ Extract user_id from request.token
     ↓
Controller Method
```

## 🚦 Guard Behavior with Multiple Guards

When using multiple guards with `@UseGuards(Guard1, Guard2)`:
- Guards run in **parallel** (NOT sequential)
- **ANY guard success** = request proceeds
- **ALL guards fail** = 401 Unauthorized

This allows "OR" logic: account token **OR** access token.

## 🔐 Security Considerations

1. **Account Token** - Stateless (JWT), faster, for authenticated users
2. **Access Token** - Stateful (DB), slower, can be revoked, for sharing
3. **Principle**: Use AccountToken for user operations, AccessToken for shared resources
4. **Type Safety**: Always check `token.type` before accessing type-specific fields

## 📝 Migration from Old Pattern

### Before (Manual Validation)
```typescript
async getFileList(@Headers('authorization') authToken: string) {
  const { user_id } = this.tokenValidation.isValidAccountToken(authToken);
  // ...
}
```

### After (Guard + Decorator)
```typescript
@UseGuards(AccountTokenAuthGuard)
async getFileList(@CurrentToken('user_id') userId: number) {
  // ...
}
```

## ✅ Benefits

1. **Flexible** - Satu decorator untuk semua token types
2. **Type Safe** - TypeScript interfaces untuk setiap token type
3. **Reusable** - Guards bisa dicombine untuk different access patterns
4. **Clean** - Controller fokus ke business logic
5. **Testable** - Mock `request.token` untuk unit tests
6. **Extensible** - Mudah tambah token types baru (API keys, OAuth, dll)
