# TUI File Upload System - Implementation Plan

## Tanggal: 2026-07-27
## Status: Ready for Implementation

---

## Context & Problem Statement

Sistem upload TUI di `tui/src/files/upload.ts` mengalami kegagalan karena ada ketidakcocokan antara yang diharapkan TUI dengan yang sebenarnya dikembalikan oleh backend.

Backend sudah diupdate untuk menggunakan **MinIO Presigned POST Policy**, tapi TUI client masih menggunakan pendekatan lama yaitu **Presigned PUT**.

---

## Root Cause Analysis

### Problem 1: File Key Extraction Salah
**Lokasi**: `tui/src/services/file.services.ts:239-241`

**Kondisi Saat Ini**:
```typescript
// Extract file-key from URL or response
const urlObj = new URL(response.data.data.url)
const fileKey = urlObj.pathname.split('/').pop() || ''
```

**Masalah**:
- TUI mencoba extract `file_key` dari URL pathname
- Backend sebenarnya mengembalikan `file_key` langsung di response body

**Akibat**: 
- File key yang didapat salah atau kosong
- Confirm upload gagal karena file_key tidak valid

---

### Problem 2: Upload Method Salah
**Lokasi**: `tui/src/services/file.services.ts:294-298`

**Kondisi Saat Ini**:
```typescript
await axios.put(url, fileBuffer, {
  headers: {
    'Content-Type': 'application/octet-stream'
  }
})
```

**Masalah**:
- Menggunakan `PUT` request
- Mengirim raw buffer langsung sebagai body
- Backend mengembalikan presigned POST data yang memerlukan `POST` dengan form data

**Akibat**:
- MinIO menolak request karena signature tidak cocok
- Upload selalu gagal

---

### Problem 3: FormData Tidak Digunakan
**Lokasi**: `tui/src/services/file.services.ts:229-258`

**Kondisi Saat Ini**:
- Backend mengembalikan field `formData` yang berisi policy dan credentials
- TUI sama sekali tidak menggunakan `formData` ini

**Masalah**:
- MinIO memerlukan semua field dari `formData` untuk validasi signature
- Tanpa field ini, upload akan ditolak

---

## Backend API Contract (Verified)

### Endpoint 1: GET /file/upload-url

**Request**:
```
GET /file/upload-url?file-name=photo.png&file-size=204800
Headers:
  authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Upload URL generated successfully",
  "data": {
    "url": "https://minio.example.com/racerfs-bucket",
    "formData": {
      "key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "policy": "eyJleHBpcmF0aW9uIjoi...",
      "x-amz-algorithm": "AWS4-HMAC-SHA256",
      "x-amz-credential": "minioadmin/20260101/us-east-1/s3/aws4_request",
      "x-amz-date": "20260101T000000Z",
      "x-amz-signature": "1234567890abcdef..."
    },
    "file_key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Key Points**:
- ✅ `file_key` ada di response body, bukan di URL
- ✅ `formData` (bukan `fields`) berisi semua policy fields
- ✅ URL adalah base MinIO bucket URL, bukan presigned PUT URL

---

### Endpoint 2: POST /file/confirm-upload

**Request**:
```
POST /file/confirm-upload
Headers:
  authorization: Bearer <jwt_token>
Body:
{
  "file-name": "photo.png",
  "file-key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "file-size": "204800",
  "status": "SUCCESS"
}
```

**Important Notes**:
- `file-size` harus **string**, bukan number
- `status` hanya accept: `"SUCCESS"` atau `"FAILED"`

---

## Implementation Plan

### File yang Perlu Dimodifikasi

1. ✅ `backend/src/routes/file/controller.ts` - **SUDAH DIPERBAIKI** (Swagger doc)
2. ❌ `tui/src/services/file.services.ts` - **BELUM** (perlu fix 2 methods)
3. ✅ `tui/src/files/upload.ts` - **TIDAK PERLU** (sudah benar)

---

### Step 1: Fix `getPresignedUploadUrl()` Method

**Lokasi**: `tui/src/services/file.services.ts:229-258`

**Perubahan yang Diperlukan**:

1. **Return type**: Ubah `fields` menjadi `formData`
   ```typescript
   // BEFORE
   Promise<{ url: string; fields: any; fileKey: string }>
   
   // AFTER
   Promise<{ url: string; formData: any; fileKey: string }>
   ```

2. **Hapus parsing file_key dari URL** (lines 239-241):
   ```typescript
   // BEFORE - HAPUS INI
   const urlObj = new URL(response.data.data.url)
   const fileKey = urlObj.pathname.split('/').pop() || ''
   ```

3. **Gunakan file_key dari response**:
   ```typescript
   // AFTER
   return {
     url: response.data.data.url,
     formData: response.data.data.formData,  // bukan fields!
     fileKey: response.data.data.file_key    // langsung dari response
   }
   ```

4. **Hapus console.log debug** (line 237):
   ```typescript
   console.log(response.data)  // HAPUS INI
   ```

---

### Step 2: Fix `uploadFile()` Method

**Lokasi**: `tui/src/services/file.services.ts:284-314`

**Perubahan yang Diperlukan**:

1. **Import FormData** di top of file:
   ```typescript
   import FormData from 'form-data'
   ```

2. **Ubah destructuring** untuk dapat `formData`:
   ```typescript
   // BEFORE
   const { url, fileKey } = await this.getPresignedUploadUrl(fileName, fileSize)
   
   // AFTER
   const { url, formData, fileKey } = await this.getPresignedUploadUrl(fileName, fileSize)
   ```

3. **Hapus console.log** (line 292):
   ```typescript
   console.log(url)  // HAPUS INI
   ```

4. **Replace PUT request dengan POST + FormData** (lines 293-298):
   ```typescript
   // BEFORE - HAPUS SEMUA INI
   await axios.put(url, fileBuffer, {
     headers: {
       'Content-Type': 'application/octet-stream'
     }
   })
   
   // AFTER - GANTI DENGAN INI
   // Create FormData for multipart/form-data POST request
   const form = new FormData()
   
   // Add all fields from backend's formData first (ORDER MATTERS!)
   for (const [key, value] of Object.entries(formData)) {
     form.append(key, value as string)
   }
   
   // Add the file itself (MUST BE LAST!)
   form.append('file', fileBuffer, fileName)
   
   // Upload to MinIO using POST with multipart/form-data
   await axios.post(url, form, {
     headers: {
       ...form.getHeaders()
     }
   })
   ```

5. **Improve error handling** (lines 306-310):
   ```typescript
   // BEFORE
   try {
     const stats = fs.statSync(localFilePath)
     // We don't have fileKey here, so just exit
   } catch {}
   
   // AFTER - Optional: confirm failed upload jika sudah punya fileKey
   let capturedFileKey: string | null = null
   
   try {
     // ... existing upload code ...
     capturedFileKey = fileKey  // simpan fileKey sebelum upload
     // ... upload ...
   } catch (error: any) {
     console.log(chalk.red("Error uploading file"))
     
     // Jika sudah punya fileKey, confirm sebagai FAILED
     if (capturedFileKey) {
       try {
         await this.confirmUpload(fileName, capturedFileKey, fileSize, 'FAILED')
       } catch {}
     }
     
     process.exit(1)
   }
   ```

---

## Technical Details: MinIO Presigned POST

### Bagaimana MinIO POST Policy Bekerja

1. **Client request presigned URL** dari backend
2. **Backend generate policy** dengan MinIO SDK:
   ```typescript
   const policy = this.minioService.newPostPolicy()
   policy.setBucket("racerfs-bucket")
   policy.setKey(file_key)
   policy.setExpires(new Date(Date.now() + 3600 * 1000))
   policy.setContentLengthRange(1, maxFileSize)
   ```

3. **MinIO returns**:
   - `postURL`: Base bucket URL
   - `formData`: Policy + signature fields
   
4. **Client upload** dengan POST multipart/form-data:
   - Semua field dari `formData` harus di-append TERLEBIH DAHULU
   - File binary di-append PALING AKHIR dengan key `file`
   - Order matters! MinIO akan reject jika order salah

### Mengapa PUT Tidak Bekerja

| Aspect | Presigned PUT | Presigned POST |
|--------|---------------|----------------|
| URL | Contains object key in path | Base bucket URL only |
| Method | PUT | POST |
| Content | Raw binary in body | multipart/form-data |
| Signature | In query params | In form fields |
| Fields | None | Policy + credentials required |

**Kesimpulan**: Signature yang di-generate untuk POST tidak valid untuk PUT request, dan sebaliknya.

---

## Verification Plan

### 1. Check Dependencies
```bash
cd tui
npm list form-data
```
**Expected**: `form-data@4.0.6` (already installed via axios)

### 2. Test Upload Flow

**Test Case 1: Normal Upload**
```bash
cd tui
npm run dev
# Select "upload" option
# Choose a small test file (< 1MB)
# Verify: "✓ File 'filename' uploaded successfully"
```

**Expected**:
- ✅ File appears in MinIO bucket
- ✅ File metadata saved to database
- ✅ File appears in file list

**Test Case 2: Large File**
```bash
# Create 10MB test file
dd if=/dev/zero of=test-10mb.bin bs=1M count=10

# Upload via TUI
npm run dev
# Select "upload" → choose test-10mb.bin
```

**Expected**:
- ✅ Upload completes without timeout
- ✅ File size in database matches actual size

**Test Case 3: Storage Full**
```bash
# Upload until storage quota exceeded
```

**Expected**:
- ❌ "File size exceeds storage limit"
- ✅ No partial file created in MinIO
- ✅ Database not updated

**Test Case 4: Invalid Token**
```bash
# Manually corrupt token in ~/.racerfs/user.rcfs
```

**Expected**:
- ❌ "Authentication failed. Please login again."
- ✅ Graceful exit without crash

### 3. Backend Verification

**Check MinIO Bucket**:
```bash
# Using MinIO client
mc ls local/racerfs-bucket/
```

**Check Database**:
```sql
SELECT id, name, size, file_key, uploaded_at 
FROM files 
ORDER BY uploaded_at DESC 
LIMIT 5;
```

### 4. Integration Test

**Full Flow**:
1. Login via TUI
2. Upload file
3. List files (verify file appears)
4. Download file (verify content matches)
5. Delete file
6. List files (verify file removed)

---

## Rollback Plan

Jika implementasi gagal:

1. **Backup current version**:
   ```bash
   cp tui/src/services/file.services.ts tui/src/services/file.services.ts.backup
   ```

2. **Revert changes**:
   ```bash
   git checkout tui/src/services/file.services.ts
   ```

3. **Investigate logs**:
   - Check TUI console output
   - Check backend logs for MinIO errors
   - Check MinIO server logs

---

## Dependencies Check

✅ **form-data**: Already installed (v4.0.6 via axios)
✅ **axios**: Already installed (v1.18.1)
✅ **chalk**: Already installed (v5.6.2)
✅ **fs**: Node.js built-in

**No additional `npm install` required!**

---

## File & Folder Structure

### Project Root
```
/home/quanta/Documents/engineer/RacerFS/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── file/
│   │   │       ├── controller.ts        [Backend file upload endpoints]
│   │   │       └── module.ts
│   │   ├── services/
│   │   │   └── file.services.ts         [MinIO integration logic]
│   │   ├── validation/
│   │   │   └── file.route.dto.ts        [DTO validation classes]
│   │   └── global_services/
│   │       └── token.services.ts
│   └── package.json
├── tui/
│   ├── src/
│   │   ├── files/
│   │   │   └── upload.ts                [Upload UI - NO CHANGE NEEDED]
│   │   ├── services/
│   │   │   ├── file.services.ts         [NEEDS FIX - Main target]
│   │   │   └── fs.services.ts
│   │   ├── SYSTEM-PATH.ts               [Config: BACKEND_URL, paths]
│   │   └── main.ts
│   └── package.json
├── BACKEND_DOCS.md                      [Backend API documentation]
├── UPLOAD_PLAN.md                       [This file]
└── .claude/
    └── plans/
        └── vast-orbiting-pnueli.md      [Original plan file]
```

---

## Related Files Reference

| File | Full Path | Lines | Purpose |
|------|-----------|-------|---------|
| Backend Controller | `/home/quanta/Documents/engineer/RacerFS/backend/src/routes/file/controller.ts` | 171-187 | Upload URL endpoint |
| Backend Controller | `/home/quanta/Documents/engineer/RacerFS/backend/src/routes/file/controller.ts` | 216-232 | Confirm upload endpoint |
| Backend Service | `/home/quanta/Documents/engineer/RacerFS/backend/src/services/file.services.ts` | 130-152 | MinIO presigned POST logic |
| Backend DTO | `/home/quanta/Documents/engineer/RacerFS/backend/src/validation/file.route.dto.ts` | 57-73 | Upload DTO validation |
| **TUI Service** | **`/home/quanta/Documents/engineer/RacerFS/tui/src/services/file.services.ts`** | **229-258** | **Get presigned URL (NEED FIX)** |
| **TUI Service** | **`/home/quanta/Documents/engineer/RacerFS/tui/src/services/file.services.ts`** | **284-314** | **Upload file (NEED FIX)** |
| TUI Upload UI | `/home/quanta/Documents/engineer/RacerFS/tui/src/files/upload.ts` | 23-81 | Upload UI (NO CHANGE) |
| TUI Config | `/home/quanta/Documents/engineer/RacerFS/tui/src/SYSTEM-PATH.ts` | - | Backend URL config |

---

## Code Diff Preview

### File: `tui/src/services/file.services.ts`

**Section 1: Top of file - Add import**
```diff
  import axios from "axios";
  import chalk from "chalk";
  import * as fs from "fs";
+ import FormData from "form-data";
  import { BACKEND_URL, RACERFS_FOLDER_PATH } from "../SYSTEM-PATH";
```

**Section 2: getPresignedUploadUrl() method**
```diff
- async getPresignedUploadUrl(fileName: string, fileSize: number): Promise<{ url: string; fields: any; fileKey: string }> {
+ async getPresignedUploadUrl(fileName: string, fileSize: number): Promise<{ url: string; formData: any; fileKey: string }> {
    try {
      const { accountToken } = this.getTokens()

      const response = await axios.get(
        `${BACKEND_URL}/file/upload-url?file-name=${encodeURIComponent(fileName)}&file-size=${fileSize}`,
        { headers: { authorization: accountToken } }
      )
-     console.log(response.data)
      
-     // Extract file-key from URL or response
-     const urlObj = new URL(response.data.data.url)
-     const fileKey = urlObj.pathname.split('/').pop() || ''
-     
+     // Backend returns: { url, formData, file_key }
      return {
        url: response.data.data.url,
-       fields: response.data.data.fields,
-       fileKey: fileKey
+       formData: response.data.data.formData,
+       fileKey: response.data.data.file_key
      }
    } catch (error: any) {
```

**Section 3: uploadFile() method**
```diff
  async uploadFile(localFilePath: string, fileName: string): Promise<void> {
    try {
      // Read file
      const fileBuffer = fs.readFileSync(localFilePath)
      const fileSize = fileBuffer.length

      // Get presigned URL
-     const { url, fileKey } = await this.getPresignedUploadUrl(fileName, fileSize)
-     console.log(url)
+     const { url, formData, fileKey } = await this.getPresignedUploadUrl(fileName, fileSize)
+     
-     // Upload to S3
-     await axios.put(url, fileBuffer, {
-       headers: {
-         'Content-Type': 'application/octet-stream'
-       }
-     })
+     // Create FormData for multipart/form-data POST request
+     const form = new FormData()
+     
+     // Add all fields from backend's formData first
+     for (const [key, value] of Object.entries(formData)) {
+       form.append(key, value as string)
+     }
+     
+     // Add the file itself (must be last)
+     form.append('file', fileBuffer, fileName)
+
+     // Upload to MinIO using POST with multipart/form-data
+     await axios.post(url, form, {
+       headers: {
+         ...form.getHeaders()
+       }
+     })

      // Confirm upload
      await this.confirmUpload(fileName, fileKey, fileSize, 'SUCCESS')
    } catch (error: any) {
-     console.log(error)
      console.log(chalk.red("Error uploading file"))
-     
-     // Try to confirm failed upload if we have the info
-     try {
-       const stats = fs.statSync(localFilePath)
-       // We don't have fileKey here, so just exit
-     } catch {}
-     
      process.exit(1)
    }
  }
```

---

## Success Criteria

✅ File upload berhasil tanpa error  
✅ File muncul di MinIO bucket dengan correct key  
✅ Metadata tersimpan di database dengan benar  
✅ File size di database match dengan actual file size  
✅ Upload confirmation (SUCCESS) terkirim ke backend  
✅ Error handling bekerja untuk: storage full, invalid token, network error  
✅ Console output informatif dan user-friendly  

---

## Notes

- MinIO presigned POST policy lebih aman karena policy di-enforce server-side
- Order field di FormData sangat penting - file HARUS di akhir
- `form.getHeaders()` otomatis set `Content-Type: multipart/form-data` dengan boundary yang benar
- Jangan manually set Content-Type untuk FormData - biarkan library yang handle

---

## Timeline Estimasi

- **Code changes**: 15 menit
- **Testing**: 30 menit
- **Bug fixes** (if any): 15 menit
- **Total**: ~1 jam

---

## Author
- Created: 2026-07-27
- By: OpenAgentic AI Assistant
- For: RacerFS TUI Upload Fix

---

## Approval Status

- [ ] Plan reviewed
- [ ] Ready to implement
- [ ] Changes applied
- [ ] Tests passed
- [ ] Deployed

---

**End of Plan**
