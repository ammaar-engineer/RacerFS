# Rencana Migrasi Backend RacerFS

## Overview
Migrasi dari `backend/src/` ke `new_backend/src/` dengan mempertahankan semua fungsionalitas, modul, dan dependensi yang ada.

---

## 1. Analisis Struktur Backend Lama

### Struktur Direktori Backend Lama (`backend/src/`)
```
backend/src/
├── main.ts                          # Entry point aplikasi
├── app.module.ts                    # Root module
├── entity.ts                        # Entity definitions
├── CustomExceptionHandle.ts         # Custom exception handler
├── GlobalException.ts               # Global exception filter
│
├── global_modules/                  # Module konfigurasi eksternal
│   ├── minio.module.ts              # MinIO (object storage)
│   ├── redis.module.ts              # Redis (caching)
│   ├── resend.module.ts             # Resend (email service)
│   └── typeorm.module.ts            # TypeORM (database ORM)
│
├── global_services/                 # Shared services
│   ├── jwt.services.ts              # JWT authentication
│   └── token.services.ts            # Token management
│
├── routes/                          # Feature modules (API endpoints)
│   ├── file/
│   │   ├── controller.ts
│   │   └── module.ts
│   ├── payments/
│   │   ├── controller.ts
│   │   └── module.ts
│   ├── snippet/
│   │   ├── controller.ts
│   │   └── module.ts
│   ├── token/
│   │   ├── controller.ts
│   │   └── module.ts
│   └── user/
│       ├── controller.ts
│       └── module.ts
│
├── services/                        # Business logic services
│   ├── auth.services.ts
│   ├── file.services.ts
│   ├── payments.services.ts
│   ├── snippet.services.ts
│   └── user.services.ts
│
├── models/                          # DTOs (Data Transfer Objects)
│   ├── dto.ts                       # Base DTO
│   ├── file.route.dto.ts
│   ├── payment.route.dto.ts
│   ├── snippet.route.dto.ts
│   ├── token.route.dto.ts
│   └── user.route.dto.ts
│
├── validation/                      # Validation schemas
│   ├── auth.validations.ts
│   ├── file.validations.ts
│   ├── snippet.validations.ts
│   ├── token.validations.ts
│   └── user.validations.ts
│
├── utilities/                       # Helper functions
│   ├── custom.dto.validator.ts
│   ├── Success.Response.ts
│   └── typeorm.handle.ts
│
└── types/                           # TypeScript type definitions
    ├── static_output_types.ts
    └── Websocket_upload_event.ts
```

### Dependensi Utama di main.ts
```typescript
- NestFactory                        # Core NestJS factory
- AppModule                          # Root module
- ValidationPipe                     # Global validation
- CustomGlobalException              # Custom exception filter
- ConfigService                      # Environment config
- SwaggerModule                      # API documentation
```

### Konfigurasi di main.ts
1. **Global Pipes**: ValidationPipe dengan whitelist & transform
2. **Global Filters**: CustomGlobalException
3. **Swagger**: API documentation di `/api/docs`
4. **Port**: 3000 (default) atau dari `process.env.PORT`

---

## 2. Struktur Backend Baru (`new_backend/src/`)

### Struktur Saat Ini (Default NestJS)
```
new_backend/src/
├── main.ts                          # Entry point (default boilerplate)
├── app.module.ts                    # Root module (default boilerplate)
├── app.controller.ts                # Default controller
├── app.controller.spec.ts           # Test file
└── app.service.ts                   # Default service
```

---

## 3. Strategi Migrasi

### Fase 1: Persiapan Struktur Direktori
**Tujuan**: Buat struktur folder yang sama dengan backend lama

**Langkah**:
1. Buat direktori utama:
   ```bash
   new_backend/src/
   ├── global_modules/
   ├── global_services/
   ├── routes/
   ├── services/
   ├── models/
   ├── validation/
   ├── utilities/
   └── types/
   ```

2. Buat subdirectory untuk routes:
   ```bash
   new_backend/src/routes/
   ├── file/
   ├── payments/
   ├── snippet/
   ├── token/
   └── user/
   ```

**Estimasi**: 5 menit

---

### Fase 2: Migrasi Core Files
**Tujuan**: Migrate file-file inti aplikasi

**Langkah**:

#### 2.1 Copy File Inti (Root Level)
```bash
# File yang akan di-copy langsung:
- CustomExceptionHandle.ts
- GlobalException.ts
- entity.ts
```

#### 2.2 Update main.ts
**Sumber**: `backend/src/main.ts`  
**Target**: `new_backend/src/main.ts`

**Perubahan**:
- Replace boilerplate dengan konfigurasi lengkap dari backend lama
- Import CustomGlobalException
- Setup ValidationPipe dengan konfigurasi whitelist
- Setup Swagger documentation
- Configure port dari environment variable

**Dependencies yang diperlukan di main.ts**:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomGlobalException } from './GlobalException';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
```

#### 2.3 Update app.module.ts
**Sumber**: `backend/src/app.module.ts`  
**Target**: `new_backend/src/app.module.ts`

**Imports yang diperlukan**:
```typescript
- ConfigModule (global)
- AppTypeOrmModule
- RedisClientModule
- EmailSendModule
- MinIOModule
- JwtModule
- TokenModule
- UserRoutesModule
- FileRouteModule
- TokenRouteModule
- SnippetRouteModule
- PaymentRouteModule
```

**Catatan**: File default `app.controller.ts`, `app.controller.spec.ts`, dan `app.service.ts` bisa dihapus karena tidak digunakan dalam arsitektur backend lama.

**Estimasi**: 15 menit

---

### Fase 3: Migrasi Global Modules
**Tujuan**: Setup koneksi ke services eksternal

**File yang akan di-migrate**:
```
backend/src/global_modules/ → new_backend/src/global_modules/
├── minio.module.ts          # MinIO object storage configuration
├── redis.module.ts          # Redis caching configuration
├── resend.module.ts         # Email service configuration
└── typeorm.module.ts        # Database ORM configuration
```

**Dependencies**:
- `minio`: ^8.0.7
- `redis`: ^6.1.0
- `resend`: ^6.17.2
- `typeorm`: ^1.0.0
- `pg`: ^8.22.0
- `@nestjs/typeorm`: ^11.0.3
- `@nestjs/config`: ^4.0.4

**Catatan Penting**:
- Pastikan environment variables tersedia (.env file)
- TypeORM module kemungkinan berisi entity definitions
- MinIO module untuk file storage
- Redis untuk caching dan session management
- Resend untuk email notifications

**Estimasi**: 20 menit

---

### Fase 4: Migrasi Global Services
**Tujuan**: Setup shared services yang digunakan di seluruh aplikasi

**File yang akan di-migrate**:
```
backend/src/global_services/ → new_backend/src/global_services/
├── jwt.services.ts          # JWT token generation & validation
└── token.services.ts        # Application token management
```

**Dependencies**:
- `jsonwebtoken`: ^9.0.3
- `@types/jsonwebtoken`: ^9.0.10

**Fungsi**:
- **jwt.services.ts**: Authentication, token signing & verification
- **token.services.ts**: Business logic untuk token management (generate, validate, revoke)

**Estimasi**: 15 menit

---

### Fase 5: Migrasi Models & DTOs
**Tujuan**: Setup data validation dan transfer objects

**File yang akan di-migrate**:
```
backend/src/models/ → new_backend/src/models/
├── dto.ts                   # Base DTO class
├── file.route.dto.ts        # File-related DTOs
├── payment.route.dto.ts     # Payment DTOs
├── snippet.route.dto.ts     # Code snippet DTOs
├── token.route.dto.ts       # Token DTOs
└── user.route.dto.ts        # User DTOs
```

**Dependencies**:
- `class-validator`: ^0.15.1
- `class-transformer`: ^0.5.1

**Fungsi**:
- Validasi input dari client
- Type safety untuk request/response
- Auto-transform data types

**Estimasi**: 15 menit

---

### Fase 6: Migrasi Validation Schemas
**Tujuan**: Setup custom validation logic

**File yang akan di-migrate**:
```
backend/src/validation/ → new_backend/src/validation/
├── auth.validations.ts      # Authentication validation rules
├── file.validations.ts      # File upload/download validation
├── snippet.validations.ts   # Snippet validation
├── token.validations.ts     # Token validation rules
└── user.validations.ts      # User data validation
```

**Dependencies**:
- Custom decorators dari `class-validator`
- Business logic validation

**Estimasi**: 15 menit

---

### Fase 7: Migrasi Utilities
**Tujuan**: Setup helper functions dan utilities

**File yang akan di-migrate**:
```
backend/src/utilities/ → new_backend/src/utilities/
├── custom.dto.validator.ts  # Custom DTO validation helpers
├── Success.Response.ts      # Standardized success response format
└── typeorm.handle.ts        # TypeORM utility functions
```

**Fungsi**:
- Response standardization
- Error handling helpers
- Database query utilities

**Estimasi**: 10 menit

---

### Fase 8: Migrasi Types
**Tujuan**: Setup TypeScript type definitions

**File yang akan di-migrate**:
```
backend/src/types/ → new_backend/src/types/
├── static_output_types.ts   # API response types
└── Websocket_upload_event.ts # WebSocket event types
```

**Dependencies**:
- `socket.io`: ^4.8.3
- `@nestjs/websockets`: ^11.1.28
- `@nestjs/platform-socket.io`: ^11.1.28

**Fungsi**:
- Type safety untuk WebSocket events
- API response type definitions

**Estimasi**: 10 menit

---

### Fase 9: Migrasi Services (Business Logic)
**Tujuan**: Setup business logic layer

**File yang akan di-migrate**:
```
backend/src/services/ → new_backend/src/services/
├── auth.services.ts         # Authentication logic
├── file.services.ts         # File management logic
├── payments.services.ts     # Payment processing logic
├── snippet.services.ts      # Code snippet management
└── user.services.ts         # User management logic
```

**Dependencies**:
- Bergantung pada global_services
- Bergantung pada entities (TypeORM)
- Bergantung pada external modules (MinIO, Redis, dll)

**Catatan**:
- **payments.services.ts** menggunakan `midtrans-client`: ^1.4.3
- **auth.services.ts** mungkin menggunakan `otp-gen-agent`: ^2.0.1
- **file.services.ts** berinteraksi dengan MinIO

**Estimasi**: 30 menit

---

### Fase 10: Migrasi Routes (Controllers & Modules)
**Tujuan**: Setup API endpoints

**Struktur untuk setiap route**:
```
backend/src/routes/{feature}/ → new_backend/src/routes/{feature}/
├── controller.ts            # HTTP request handlers
└── module.ts                # Feature module definition
```

**Routes yang akan di-migrate**:
1. **file/** - File upload, download, management
2. **payments/** - Payment processing dengan Midtrans
3. **snippet/** - Code snippet management
4. **token/** - Token API endpoints
5. **user/** - User management & authentication

**Dependencies per route**:
- Respective service dari `services/`
- Respective DTO dari `models/`
- Respective validation dari `validation/`
- Global services (JWT, Token)

**Catatan Khusus**:
- **file/controller.ts** kemungkinan menggunakan WebSocket untuk upload progress
- **payments/controller.ts** integrasi dengan Midtrans
- **user/controller.ts** authentication endpoints

**Estimasi**: 40 menit

---

## 4. Dependency Management

### Package.json
Kedua backend menggunakan dependencies yang sama. Pastikan `new_backend/package.json` sudah ter-install dengan benar.

**Verifikasi**:
```bash
cd new_backend
npm install
```

**Critical Dependencies**:
```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.4",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/platform-socket.io": "^11.1.28",
    "@nestjs/swagger": "^11.4.6",
    "@nestjs/typeorm": "^11.0.3",
    "@nestjs/websockets": "^11.1.28",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.15.1",
    "jsonwebtoken": "^9.0.3",
    "midtrans-client": "^1.4.3",
    "minio": "^8.0.7",
    "otp-gen-agent": "^2.0.1",
    "pg": "^8.22.0",
    "redis": "^6.1.0",
    "resend": "^6.17.2",
    "socket.io": "^4.8.3",
    "typeorm": "^1.0.0"
  }
}
```

---

## 5. Environment Variables

### File `.env` yang diperlukan
Pastikan `new_backend/.env` memiliki semua variables yang diperlukan:

```bash
# Database
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=

# Redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# MinIO
MINIO_ENDPOINT=
MINIO_PORT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# Midtrans Payment
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=

# Application
PORT=3000
NODE_ENV=development
```

**Action**: Copy dari `backend/.env` ke `new_backend/.env`

---

## 6. Import Path Resolution

### TypeScript Path Aliases
Periksa `tsconfig.json` untuk memastikan path aliases sudah setup dengan benar:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@global_modules/*": ["src/global_modules/*"],
      "@global_services/*": ["src/global_services/*"],
      "@routes/*": ["src/routes/*"],
      "@services/*": ["src/services/*"],
      "@models/*": ["src/models/*"],
      "@validation/*": ["src/validation/*"],
      "@utilities/*": ["src/utilities/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

**Catatan**: Jika backend lama tidak menggunakan path aliases, skip langkah ini. Jika menggunakan, update semua import statements.

---

## 7. Testing & Verification

### Fase 11: Testing
**Setelah migrasi selesai**:

#### 7.1 Build Test
```bash
cd new_backend
npm run build
```

**Expected**: Build sukses tanpa error

#### 7.2 Linting
```bash
npm run lint
```

**Expected**: No linting errors (atau fix yang muncul)

#### 7.3 Start Development Server
```bash
npm run start:dev
```

**Expected**: 
- Server starts pada port 3000
- Swagger docs available di `http://localhost:3000/api/docs`
- No runtime errors

#### 7.4 Manual Testing
1. **Swagger UI**: Buka `http://localhost:3000/api/docs`
2. **Health Check**: Test basic endpoints
3. **Database Connection**: Verify TypeORM connection
4. **Redis Connection**: Verify caching works
5. **MinIO Connection**: Test file upload/download
6. **Authentication**: Test JWT token generation

#### 7.5 Unit Tests (Optional)
```bash
npm run test
```

---

## 8. Migration Checklist

### Pre-Migration
- [ ] Backup backend lama
- [ ] Verify new_backend structure exists
- [ ] Check package.json dependencies match
- [ ] Run `npm install` di new_backend

### Core Files
- [ ] Copy CustomExceptionHandle.ts
- [ ] Copy GlobalException.ts
- [ ] Copy entity.ts
- [ ] Update main.ts
- [ ] Update app.module.ts
- [ ] Delete default boilerplate files (app.controller.ts, app.service.ts)

### Global Modules
- [ ] Copy minio.module.ts
- [ ] Copy redis.module.ts
- [ ] Copy resend.module.ts
- [ ] Copy typeorm.module.ts

### Global Services
- [ ] Copy jwt.services.ts
- [ ] Copy token.services.ts

### Models (DTOs)
- [ ] Copy dto.ts
- [ ] Copy file.route.dto.ts
- [ ] Copy payment.route.dto.ts
- [ ] Copy snippet.route.dto.ts
- [ ] Copy token.route.dto.ts
- [ ] Copy user.route.dto.ts

### Validation
- [ ] Copy auth.validations.ts
- [ ] Copy file.validations.ts
- [ ] Copy snippet.validations.ts
- [ ] Copy token.validations.ts
- [ ] Copy user.validations.ts

### Utilities
- [ ] Copy custom.dto.validator.ts
- [ ] Copy Success.Response.ts
- [ ] Copy typeorm.handle.ts

### Types
- [ ] Copy static_output_types.ts
- [ ] Copy Websocket_upload_event.ts

### Services (Business Logic)
- [ ] Copy auth.services.ts
- [ ] Copy file.services.ts
- [ ] Copy payments.services.ts
- [ ] Copy snippet.services.ts
- [ ] Copy user.services.ts

### Routes
- [ ] Copy routes/file/controller.ts
- [ ] Copy routes/file/module.ts
- [ ] Copy routes/payments/controller.ts
- [ ] Copy routes/payments/module.ts
- [ ] Copy routes/snippet/controller.ts
- [ ] Copy routes/snippet/module.ts
- [ ] Copy routes/token/controller.ts
- [ ] Copy routes/token/module.ts
- [ ] Copy routes/user/controller.ts
- [ ] Copy routes/user/module.ts

### Configuration
- [ ] Copy .env file
- [ ] Verify tsconfig.json
- [ ] Verify nest-cli.json
- [ ] Check .gitignore

### Testing
- [ ] Run `npm run build`
- [ ] Run `npm run lint`
- [ ] Run `npm run start:dev`
- [ ] Test Swagger docs
- [ ] Test database connection
- [ ] Test Redis connection
- [ ] Test MinIO connection
- [ ] Test authentication flow
- [ ] Test each API endpoint

---

## 9. Potential Issues & Solutions

### Issue 1: Import Path Errors
**Problem**: Import statements might be broken after migration

**Solution**:
- Verify all relative imports (`./`, `../`)
- Check if path aliases are used
- Run linter to catch import errors

### Issue 2: Missing Environment Variables
**Problem**: Services fail to start due to missing env vars

**Solution**:
- Compare .env files
- Add missing variables
- Use ConfigService to validate required vars on startup

### Issue 3: TypeORM Entity Issues
**Problem**: Database connection fails or entities not found

**Solution**:
- Check entity.ts exports
- Verify typeorm.module.ts entity paths
- Ensure entities are properly registered

### Issue 4: Module Dependency Circular References
**Problem**: Circular dependency between modules

**Solution**:
- Use `forwardRef()` for circular dependencies
- Refactor module structure if needed
- Check import order in app.module.ts

### Issue 5: WebSocket Connection Issues
**Problem**: File upload WebSocket not working

**Solution**:
- Verify socket.io configuration
- Check CORS settings
- Ensure WebSocket gateway is properly registered

---

## 10. Post-Migration Tasks

### Code Quality
- [ ] Run code formatter: `npm run format`
- [ ] Fix linting issues: `npm run lint`
- [ ] Review and optimize imports
- [ ] Add missing type definitions

### Documentation
- [ ] Update README.md if needed
- [ ] Document API changes (if any)
- [ ] Update Swagger annotations

### Performance
- [ ] Check bundle size
- [ ] Optimize imports (remove unused)
- [ ] Review database queries

### Security
- [ ] Verify JWT secret is secure
- [ ] Check environment variable access
- [ ] Review CORS configuration
- [ ] Validate input sanitization

---

## 11. Estimated Timeline

| Fase | Task | Estimasi |
|------|------|----------|
| 1 | Persiapan struktur direktori | 5 min |
| 2 | Migrasi core files | 15 min |
| 3 | Migrasi global modules | 20 min |
| 4 | Migrasi global services | 15 min |
| 5 | Migrasi models & DTOs | 15 min |
| 6 | Migrasi validation schemas | 15 min |
| 7 | Migrasi utilities | 10 min |
| 8 | Migrasi types | 10 min |
| 9 | Migrasi services | 30 min |
| 10 | Migrasi routes | 40 min |
| 11 | Testing & verification | 30 min |
| 12 | Bug fixes & adjustments | 30 min |
| **Total** | | **~3.5 jam** |

---

## 12. Rollback Plan

Jika terjadi masalah kritis:

1. **Stop new_backend server**
2. **Revert ke backend lama**
3. **Document issues encountered**
4. **Fix issues in new_backend**
5. **Retry migration**

**Backup Command**:
```bash
# Sebelum mulai migrasi
cp -r backend backend_backup_$(date +%Y%m%d_%H%M%S)
```

---

## 13. Success Criteria

Migration dianggap sukses jika:

✅ Build berjalan tanpa error  
✅ Server start tanpa crash  
✅ Swagger docs accessible  
✅ Database connection established  
✅ Redis connection established  
✅ MinIO connection established  
✅ All API endpoints responding  
✅ Authentication flow working  
✅ File upload/download working  
✅ Payment integration working  
✅ WebSocket connections stable  
✅ No console errors in development  

---

## Kontak & Support

Jika ada pertanyaan atau issues selama migrasi:
- Review MIGRATION_PLAN.md ini
- Check error logs di console
- Review NestJS documentation
- Check individual module documentation

---

**Created**: 2026-07-29  
**Version**: 1.0  
**Author**: Migration Planning Assistant
