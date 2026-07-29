# File Workflow - E2E Test Flow

## Variabel yang Dikelola Antar Step

```typescript
let testAccountToken: string   // dari setup 1
let accessToken: string        // dari setup 2
let presignedUrl: string       // dari step 2
let fileKey: string            // dari step 2 (diambil dari response, bukan generate sendiri)

const fileName = "test-document.txt"
const fileContent = Buffer.from("mock file content here")
const fileSize = fileContent.byteLength.toString()  // "26"
```

---

## Setup

### Setup 1 - Buat test account
```
GET /user/create-test-account

Response:
{
  success: true,
  data: { token: string }
}

Simpan: testAccountToken = res.body.data.token
```

### Setup 2 - Generate access token
```
POST /file/generate-access-token
Headers: { authorization: testAccountToken }

Response:
{
  success: true,
  message: "Access token generated successfully",
  data: { access_token: string }
}

Simpan: accessToken = res.body.data.access_token
```

---

## Workflow

### Step 1 - Cek list file (empty state)
```
GET /file/list
Headers: {
  authorization: testAccountToken,
  access-token: accessToken
}

Assert:
- status 200
- success = true
- message = "File list retrieved successfully"
- data.files = [] (array kosong)
```

### Step 2 - Get presigned upload URL
```
GET /file/upload-url?file-name=test-document.txt
Headers: {
  authorization: testAccountToken,
  file-size: "26"
}

Response:
{
  success: true,
  message: "Upload URL generated successfully",
  data: {
    url: string,      <- presigned PUT URL dari MinIO
    file_key: string  <- UUID yang di-generate backend
  }
}

Assert:
- status 200
- success = true
- data.url ada dan bertipe string
- data.file_key ada dan bertipe string

Simpan:
  presignedUrl = res.body.data.url
  fileKey = res.body.data.file_key
```

### Step 3 - Upload mock file ke MinIO via presigned URL
```
PUT {presignedUrl}
Body: fileContent (Buffer)
Headers: { Content-Type: "application/octet-stream" }

Catatan:
- Request ini langsung ke MinIO, bukan ke NestJS API
- Gunakan fetch() bawaan Node.js (Node 18+), bukan supertest

Contoh:
  await fetch(presignedUrl, {
    method: "PUT",
    body: fileContent,
    headers: { "Content-Type": "application/octet-stream" }
  })

Assert:
- status 200
```

### Step 4 - Confirm upload SUCCESS
```
POST /file/confirm-upload?status=SUCCESS&file-name=test-document.txt
Headers: {
  authorization: testAccountToken,
  file-size: "26",
  file-key: fileKey   <- dari response step 2
}

Assert:
- status 200
- success = true
- message berisi "uploaded successfully"
```

### Step 5 - Cek list file (verify file ada)
```
GET /file/list
Headers: {
  authorization: testAccountToken,
  access-token: accessToken
}

Assert:
- status 200
- success = true
- data.files.length = 1
- data.files[0].name = "test-document.txt"
```

### Step 6 - Set file ke public
```
PATCH /file/set-visibility?file-name=test-document.txt
Headers: { authorization: testAccountToken }
Body: { is_public: true }

Assert:
- status 200
- success = true
- message = "File is now public"
```

### Step 7 - Delete file
```
DELETE /file/delete-file?file-name=test-document.txt
Headers: { authorization: testAccountToken }

Assert:
- status 200
- success = true
- message = "test-document.txt deleted successfully"
```
