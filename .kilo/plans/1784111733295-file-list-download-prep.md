# File List & Download Preparation Implementation Plan

## Scope
Implementasi 2 task berikut:
1. **Lengkapi method `getUserFileList()` di service** - mapping return data
2. **Lengkapi endpoint `downloadFile()` di controller** - extract JWT token (tanpa implementasi service)

## Task 1: Lengkapi `getUserFileList()` Mapping

### Current State
File: `backend/src/routes/file/service.ts:60-69`

```typescript
async getUserFileList(userId: number) {
    const fileList = await this.fileRepo.find({
        where: {
            user_id: userId
        }
    })
    return fileList.map(data => ({
        
    }))
}
```

**Problem**: Mapping object kosong, tidak mengembalikan data apapun.

### Target Implementation
Lengkapi mapping untuk mengembalikan fields dari entity `File`:
- `id` (number)
- `name` (string)
- `size` (number - bigint di DB)
- `uploaded_at` (Date)

**Changes Required**:
```typescript
async getUserFileList(userId: number) {
    const fileList = await this.fileRepo.find({
        where: {
            user_id: userId
        },
        order: {
            uploaded_at: 'DESC'  // Tambahkan sorting, file terbaru di atas
        }
    })
    return fileList.map(data => ({
        id: data.id,
        name: data.name,
        size: data.size,
        uploaded_at: data.uploaded_at
    }))
}
```

**Return Type**:
```typescript
Array<{
    id: number;
    name: string;
    size: number;
    uploaded_at: Date;
}>
```

### Controller Integration
File: `backend/src/routes/file/controller.ts:16-32`

Lengkapi handler `getFileList()`:
```typescript
@Get("list")
async getFileList(
    @Headers() headers: Record<string, string>
) {
    // Validate headers
    const headerPto = plainToInstance(FileListHeaderDTO, headers, {
        excludeExtraneousValues: false
    })
    await validateOrReject(headerPto)
    // Header data
    const token = headerPto['authorization']
    // Jwt
    const {userId} = this.jwtService.verifyJwt<{userId: number}>(token)
    // Service
    const fileList = await this.fileServices.getUserFileList(userId)
    // Return
    return SuccessResponse("File list retrieved successfully", fileList)
}
```

**Note**: Perlu verifikasi signature `SuccessResponse()` - apakah menerima 2 parameter (message, data)?

---

## Task 2: Lengkapi Endpoint `downloadFile()` - Extract JWT

### Current State
File: `backend/src/routes/file/controller.ts:34-35`

```typescript
@Get("download")
async downloadFile() {}
```

**Problem**: Endpoint kosong, tidak ada implementasi.

### Target Implementation (Controller Only)
Implementasi **hanya bagian controller** untuk:
1. Extract dan validate headers (JWT token)
2. Extract file ID dari request
3. Verify JWT token
4. Call service method (placeholder - service belum dibuat)

**Design Decision**: Gunakan **path parameter** untuk file ID
```
GET /file/download/:fileId
```

**Rationale**: Lebih RESTful dan clean dibanding query parameter.

### Required DTO
Buat DTO baru di `backend/src/routes/file/dto.ts`:

```typescript
export class FileDownloadHeaderDTO {
    @IsString()
    "authorization"!: string
}
```

### Controller Implementation

```typescript
@Get("download/:fileId")
async downloadFile(
    @Headers() headers: Record<string, string>,
    @Param('fileId') fileId: string,
    @Res() res: Response
) {
    // Validate headers
    const headerDto = plainToInstance(FileDownloadHeaderDTO, headers, {
        excludeExtraneousValues: false
    })
    await validateOrReject(headerDto)
    
    // Header data
    const token = headerDto['authorization']
    
    // Jwt verification
    const {userId} = this.jwtService.verifyJwt<{userId: number}>(token)
    
    // Convert fileId to number
    const fileIdNum = parseInt(fileId, 10)
    if (isNaN(fileIdNum)) {
        throw new BadRequestException("Invalid file ID")
    }
    
    // Service call (TO BE IMPLEMENTED)
    // const {stream, filename, size, contentType} = await this.fileServices.downloadFile(fileIdNum, userId)
    
    // Set response headers (TO BE IMPLEMENTED)
    // res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    // res.setHeader('Content-Type', contentType)
    // res.setHeader('Content-Length', size)
    
    // Stream file to response (TO BE IMPLEMENTED)
    // stream.pipe(res)
}
```

### Required Imports
Tambahkan di `backend/src/routes/file/controller.ts`:

```typescript
import { Param, Res } from "@nestjs/common";
import { Response } from "express";
import { BadRequestException } from "src/CustomExceptionHandle";
```

---

## Implementation Checklist

### Service Changes
- [ ] Edit `backend/src/routes/file/service.ts:60-69`
  - [ ] Tambahkan `order: { uploaded_at: 'DESC' }` di query options
  - [ ] Lengkapi mapping object dengan: `id`, `name`, `size`, `uploaded_at`

### Controller Changes - File List
- [ ] Edit `backend/src/routes/file/controller.ts:16-32`
  - [ ] Tambahkan call ke `this.fileServices.getUserFileList(userId)`
  - [ ] Return dengan `SuccessResponse()` - verifikasi signature dulu

### DTO Changes
- [ ] Edit `backend/src/routes/file/dto.ts`
  - [ ] Tambahkan class `FileDownloadHeaderDTO` dengan field `authorization`
  - [ ] Export class tersebut

### Controller Changes - Download
- [ ] Edit `backend/src/routes/file/controller.ts:34-35`
  - [ ] Ubah decorator menjadi `@Get("download/:fileId")`
  - [ ] Tambahkan parameters: `@Headers()`, `@Param('fileId')`, `@Res()`
  - [ ] Tambahkan header validation menggunakan `FileDownloadHeaderDTO`
  - [ ] Extract dan verify JWT token
  - [ ] Parse dan validate `fileId` parameter
  - [ ] Tambahkan comment placeholder untuk service call
  - [ ] Tambahkan comment placeholder untuk streaming response
- [ ] Tambahkan imports yang diperlukan: `Param`, `Res`, `Response`, `BadRequestException`

---

## Validation Plan

### Test File List
1. Start aplikasi backend
2. Hit endpoint `GET /file/list` dengan valid JWT token
3. Verify response format:
   ```json
   {
     "success": true,
     "message": "File list retrieved successfully",
     "data": [
       {
         "id": 1,
         "name": "test.txt",
         "size": 1024,
         "uploaded_at": "2026-07-15T10:30:00Z"
       }
     ]
   }
   ```
4. Verify ordering: file terbaru di atas
5. Test dengan user yang tidak punya file - harus return empty array

### Test Download Preparation
1. Hit endpoint `GET /file/download/123` dengan valid JWT token
2. Verify tidak error di bagian header extraction dan JWT verification
3. Verify error handling untuk invalid file ID (e.g., `/file/download/abc`)
4. Pada tahap ini, endpoint akan mencapai bagian "TO BE IMPLEMENTED" comment

---

## Dependencies & Assumptions

### Dependencies
- `class-validator` - sudah dipakai di codebase
- `class-transformer` - sudah dipakai di codebase
- `@nestjs/common` decorators: `@Param`, `@Res`
- `express.Response` type

### Assumptions
1. **SuccessResponse signature**: Diasumsikan menerima `(message: string, data?: any)`
   - Jika berbeda, perlu disesuaikan
2. **JWT token format**: Consistent dengan endpoint lain (Authorization header)
3. **File entity**: Fields sesuai dengan `backend/src/entity.ts:54-74`
4. **Error handling**: Custom exceptions dari `src/CustomExceptionHandle` sudah di-setup

---

## Out of Scope
- Implementasi service method `downloadFile()` - akan dikerjakan terpisah
- Streaming file dari MinIO - akan dikerjakan terpisah
- Error handling untuk file not found / forbidden - akan di service layer
- Unit tests - bisa ditambahkan setelah implementasi
- Integration tests - bisa ditambahkan setelah implementasi

---

## Notes
- Pattern konsisten dengan endpoint `uploadFile()` yang sudah ada
- Sorting DESC untuk file list memberikan UX yang lebih baik (file terbaru dilihat duluan)
- Path parameter untuk download lebih clean dan RESTful
- Validation file ID di controller level mencegah invalid input ke service layer
