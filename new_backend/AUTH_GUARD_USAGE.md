# Implementasi Auth Guard & @CurrentUser Decorator

## 📋 Yang Sudah Dibuat

1. **AuthGuard** - `src/middleware/auth.guard.ts`
   - Validates JWT token dari header `authorization`
   - Extract user info dan inject ke `request.user`
   - Throw UnauthorizedException jika token invalid

2. **@CurrentUser Decorator** - `src/decorators/current-user.decorator.ts`
   - Extract authenticated user dari request
   - Bisa ambil seluruh user object atau property spesifik

## 🎯 Cara Pakai

### Contoh 1: Apply ke Single Controller (Recommended)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../middleware/auth.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';

@Controller('file')
@UseGuards(AuthGuard)  // ✅ Apply guard ke semua endpoints dalam controller ini
export class FileController {
  
  @Get('list')
  async getFileList(@CurrentUser('user_id') userId: number) {
    // userId sudah ter-extract dari token
    const files = await this.fileService.getUserFiles(userId);
    return SuccessResponse('File list retrieved successfully', { files });
  }

  @Get('storage-info')
  async getStorageInfo(@CurrentUser('user_id') userId: number) {
    const storageInfo = await this.fileService.getStorageInfo(userId);
    return SuccessResponse('Storage info retrieved successfully', storageInfo);
  }
}
```

### Contoh 2: Apply ke Specific Endpoint

```typescript
@Controller('file')
export class FileController {
  
  @Get('list')
  @UseGuards(AuthGuard)  // ✅ Hanya endpoint ini yang protected
  async getFileList(@CurrentUser('user_id') userId: number) {
    const files = await this.fileService.getUserFiles(userId);
    return SuccessResponse('File list retrieved successfully', { files });
  }

  @Get('public')  // ❌ Endpoint ini TIDAK protected
  async getPublicFiles() {
    return await this.fileService.getPublicFiles();
  }
}
```

### Contoh 3: Extract Entire User Object

```typescript
import { AuthUser } from '../../../middleware/auth.guard';

@Controller('file')
@UseGuards(AuthGuard)
export class FileController {
  
  @Get('list')
  async getFileList(@CurrentUser() user: AuthUser) {
    // user = { user_id: 123, type: 'account_token' }
    console.log(`User ${user.user_id} is accessing files`);
    const files = await this.fileService.getUserFiles(user.user_id);
    return SuccessResponse('File list retrieved successfully', { files });
  }
}
```

## 🔧 Update FileModule

Jangan lupa register AuthGuard sebagai provider di FileModule:

```typescript
import { Module } from '@nestjs/common';
import { AuthGuard } from '../../middleware/auth.guard';
import { JwtModule } from '../../services/jwt.service';

@Module({
  imports: [JwtModule],  // ✅ Required untuk AuthGuard
  controllers: [FileController],
  providers: [
    FileService,
    AuthGuard,  // ✅ Register AuthGuard
    // ... other providers
  ],
  exports: [FileService],
})
export class FileModule {}
```

## 🚀 Benefits

1. **Cleaner Controllers** - No more manual token validation
2. **Reusable** - AuthGuard bisa dipakai di semua modules
3. **Type Safe** - AuthUser interface untuk type checking
4. **Flexible** - Bisa apply per-controller atau per-endpoint
5. **Consistent** - Semua endpoints validate token dengan cara yang sama

## ⚠️ Notes

- Header format: `Authorization: Bearer <token>` atau `Authorization: <token>`
- AuthGuard akan throw `UnauthorizedException` jika:
  - Header tidak ada
  - Token invalid/expired
  - Token type bukan `account_token`

## 📝 Migration Checklist

- [ ] Register AuthGuard di module providers
- [ ] Add `@UseGuards(AuthGuard)` ke controller/endpoint
- [ ] Replace `@Headers('authorization')` dengan `@CurrentUser('user_id')`
- [ ] Remove manual token validation code (TokenValidation.isValidAccountToken)
- [ ] Update tests untuk include authorization header
