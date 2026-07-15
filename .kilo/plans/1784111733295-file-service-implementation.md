# File Service Implementation Plan

## Context
Berdasarkan analisis `FileRouteController`, diperlukan implementasi lengkap untuk service layer yang menunjang 4 endpoint:
1. `GET /file/list` - List user files
2. `GET /file/download` - Download file
3. `PATCH /file/edit` - Edit file metadata
4. `POST /file/upload` - Upload file (sudah ada)

Entity `File` memiliki fields: `id`, `name`, `size`, `uploaded_at`, `user_id`

## Service Methods yang Dibutuhkan

### 1. `getUserFileList(userId: number)` - PERLU DILENGKAPI
**Status**: Skeleton sudah ada di `service.ts:60-69` tapi mapping belum selesai

**Implementation**:
```typescript
async getUserFileList(userId: number) {
    const fileList = await this.fileRepo.find({
        where: {
            user_id: userId
        },
        order: {
            uploaded_at: 'DESC'
        }
    })
    return fileList.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        uploaded_at: file.uploaded_at
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

### 2. `downloadFile(fileId: number, userId: number)` - BARU
**Purpose**: Download file dari MinIO dengan validasi ownership

**Implementation Steps**:
1. Cari file by ID dari database
2. Validasi ownership (file.user_id === userId)
3. Ambil stream dari MinIO menggunakan `getObject()`
4. Return stream + metadata (filename, size, content-type)

**Signature**:
```typescript
async downloadFile(fileId: number, userId: number): Promise<{
    stream: Readable;
    filename: string;
    size: number;
    contentType: string;
}>
```

**Error Cases**:
- File not found → `NotFoundException`
- User bukan owner → `ForbiddenException`
- MinIO error → `InternalServerErrorException`

### 3. `editFile(fileId: number, userId: number, newName: string)` - BARU
**Purpose**: Rename file (update metadata di DB dan MinIO)

**Implementation Steps**:
1. Cari file by ID dari database
2. Validasi ownership (file.user_id === userId)
3. Validasi nama baru tidak konflik dengan file lain milik user yang sama
4. Copy object di MinIO dengan nama baru
5. Delete object lama di MinIO
6. Update record di database
7. Return updated file info

**Signature**:
```typescript
async editFile(fileId: number, userId: number, newName: string): Promise<{
    id: number;
    name: string;
    size: number;
    uploaded_at: Date;
}>
```

**Error Cases**:
- File not found → `NotFoundException`
- User bukan owner → `ForbiddenException`
- Nama baru sudah dipakai → `ConflictException`
- MinIO error → `InternalServerErrorException`

### 4. `uploadFile()` - SUDAH ADA
**Status**: Sudah diimplementasi lengkap di `service.ts:16-59`

**Catatan**: Method ini sudah bagus, tidak perlu perubahan

## Tasks

### Service Implementation
- [ ] Lengkapi method `getUserFileList()` dengan mapping yang benar
- [ ] Tambahkan method `downloadFile()` dengan validasi ownership
- [ ] Tambahkan method `editFile()` untuk rename file
- [ ] Import exceptions yang diperlukan: `NotFoundException`, `ForbiddenException`

### Controller Integration
- [ ] Lengkapi `getFileList()` handler untuk memanggil `getUserFileList()`
- [ ] Implementasi `downloadFile()` handler dengan streaming response
- [ ] Implementasi `editFile()` handler dengan body validation
- [ ] Tambahkan DTO untuk download (query/param) dan edit (body)

### DTO Requirements
**Perlu ditambahkan**:
- `FileDownloadParamDTO` - untuk file ID (query param atau path param)
- `FileEditBodyDTO` - untuk new file name
- `FileEditHeaderDTO` - untuk authorization

## Technical Decisions

### Download Endpoint Design
**Recommended**: Gunakan query parameter atau path parameter untuk file ID
```typescript
// Option 1: Query parameter
GET /file/download?fileId=123

// Option 2: Path parameter (RECOMMENDED)
GET /file/download/:fileId
```

**Rationale**: Path parameter lebih RESTful dan clean

### Edit Endpoint Design
**Recommended**: Request body berisi new name
```typescript
PATCH /file/edit/:fileId
Body: { name: "new-filename.txt" }
```

### MinIO Bucket Name
Hardcoded `'racerfs_bucket'` di `uploadFile()`. Consider:
- Extract to environment variable
- Use constant/config file
- Apply ke semua MinIO operations

## Data Flow

### List Files
```
Client → Controller (validate JWT) → Service.getUserFileList() 
→ Database query → Map results → Return JSON
```

### Download File
```
Client → Controller (validate JWT, get fileId) 
→ Service.downloadFile() → Validate ownership → MinIO.getObject() 
→ Stream to client with headers
```

### Edit File
```
Client → Controller (validate JWT, body, get fileId) 
→ Service.editFile() → Validate ownership → MinIO copy+delete 
→ Update DB → Return updated file info
```

## Validation & Error Handling

### Ownership Validation Pattern
```typescript
if (file.user_id !== userId) {
    throw new ForbiddenException("You don't have permission to access this file")
}
```

### File Not Found Pattern
```typescript
if (!file) {
    throw new NotFoundException("File not found")
}
```

## Open Questions & Assumptions

### Assumptions Made:
1. **Download**: Menggunakan file ID sebagai identifier (lebih secure dari nama file)
2. **Edit**: Hanya support rename, tidak replace content
3. **Edit**: MinIO object name mengikuti file name di database
4. **Authorization**: Semua endpoint memerlukan JWT token
5. **Ownership**: User hanya bisa akses file miliknya sendiri

### Out of Scope:
- Pagination untuk file list (bisa ditambahkan nanti)
- File filtering/sorting di client side
- File sharing antar user
- File versioning
- Soft delete

## MinIO Bucket Configuration

**Note**: Pastikan bucket `racerfs_bucket` sudah dibuat sebelum service berjalan. Consider:
- Auto-create bucket saat aplikasi startup
- Atau documented manual setup di README
