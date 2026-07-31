# File TUI Plan

## Overview

Menghubungkan TUI ke backend file controller (`/file/*`) mengikuti pola yang sudah ada di `snippets/`.

---

## Upload Flow (2 langkah via Presigned URL)

```
TUI → GET  /file/upload-url      → dapat { url, fields, file_key }
TUI → PUT  <presigned S3 url>    → upload binary langsung ke S3 (bypass backend)
TUI → POST /file/confirm-upload  → konfirmasi SUCCESS atau FAILED
```

---

## File yang Akan Dibuat

```
src\

  files/
    handler.ts        ← sub-menu "Manage files", ganti stub di main.ts:17
    list.ts           ← tampilkan daftar file user
    upload.ts         ← flow upload (pilih path lokal → presign → PUT → confirm)
    download.ts       ← get download URL lalu print ke terminal
    delete.ts         ← hapus file
    rename.ts         ← rename file
    visibility.ts     ← toggle public/private
    storage.ts        ← tampilkan storage info (used/quota)
  services/
    file.services.ts  ← semua HTTP call ke /file/* endpoint
  validations/
    file.validation.ts ← auth gate + validasi file lokal (exists, size)
```

---

## Access Token Strategy

Backend `GET /file/list` dan beberapa endpoint butuh dua header:
- `authorization` — account token (sudah ada di `user.rcfs`)
- `access-token` — file access token (belum dihandle TUI)

**Pilihan yang dipilih: Opsi A — simpan di `user.rcfs`**

Saat user masuk ke "Manage files" pertama kali (atau jika `access_token` tidak ada di `user.rcfs`):
1. Call `POST /file/generate-access-token`
2. Simpan hasilnya ke `user.rcfs` sebagai field `access_token`
3. Sesi berikutnya langsung pakai dari file

Struktur `user.rcfs` setelah update:
```json
{
  "account_token": "...",
  "access_token": "..."
}
```

---

## `file.services.ts` — Method List

| Method | HTTP | Endpoint | Headers |
|---|---|---|---|
| `getUploadUrl(fileName, fileSize)` | GET | `/file/upload-url` | `authorization` |
| `uploadToS3(presignedUrl, fields, filePath)` | PUT | `<S3 URL>` | — |
| `confirmUpload(status, fileName, fileKey, fileSize)` | POST | `/file/confirm-upload` | `authorization` |
| `getFileList()` | GET | `/file/list` | `authorization` + `access-token` |
| `getDownloadUrl(fileName)` | GET | `/file/download-url` | `authorization` + `access-token` |
| `deleteFile(fileName)` | DELETE | `/file/delete` | `authorization` |
| `renameFile(fileName, newName)` | PATCH | `/file/rename` | `authorization` + `access-token` |
| `setVisibility(fileName, isPublic)` | PATCH | `/file/set-visibility` | `authorization` |
| `getStorageInfo()` | GET | `/file/storage-info` | `authorization` |
| `generateAccessToken()` | POST | `/file/generate-access-token` | `authorization` |

Helper private `getTokens()` — baca `account_token` dan `access_token` dari `user.rcfs`.

---

## `file.validation.ts` — Method List

| Method | Fungsi |
|---|---|
| `isUserAuthenticated()` | Cek `account_token` ada di `user.rcfs` (sama seperti snippet) |
| `ensureAccessToken()` | Cek `access_token` di `user.rcfs`, jika tidak ada auto-generate |
| `validateLocalFilePath(path)` | Pastikan path file lokal ada dan bisa dibaca |
| `validateFileName(name)` | Validasi nama file (tidak kosong, karakter valid) |

---

## `handler.ts` — Menu Structure

```
Manage Files
├── View all files          → list.ts
├── Upload file             → upload.ts
├── Download file           → download.ts
├── Delete file             → delete.ts
├── Rename file             → rename.ts
├── Set file visibility     → visibility.ts
├── Storage info            → storage.ts
└── Back to main menu
```

---

## Perubahan di File yang Sudah Ada

- `src/main.ts:17` — ganti `console.log("Manage files - Coming soon")` dengan `FilesHandler()`

---

## Upload Flow Detail (`upload.ts`)

1. Prompt: input path file lokal
2. Validasi: file exists (`validationSystem.FileShouldBe`)
3. Baca ukuran file dengan `fs.statSync(path).size`
4. Prompt: input nama file untuk disimpan di server (default: basename dari path)
5. Call `fileServices.getUploadUrl(fileName, fileSize)`
6. Call `fileServices.uploadToS3(url, fields, localPath)` — stream binary dengan `axios.put` dan `fs.createReadStream`
7. Call `fileServices.confirmUpload('SUCCESS' | 'FAILED', ...)`
8. Tampilkan hasil

---

## Catatan Implementasi

- Ikuti pola `snippetServices` untuk error handling (cek `error.response?.status`, `process.exit(1)` jika fatal)
- Ikuti pola `SnippetsHandler` untuk recursive menu (setelah aksi selesai, panggil `FilesHandler()` lagi)
- Gunakan `@clack/prompts` untuk semua prompt input (konsisten dengan modul lain)
- Format size display: bytes → KB/MB/GB
- Format date: sama dengan `list.ts` di snippets (locale `en-US`)
