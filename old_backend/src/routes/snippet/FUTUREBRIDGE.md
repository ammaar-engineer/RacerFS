# Future Bridge Recommendations

Dokumen ini mencatat rekomendasi fitur yang membutuhkan bridge layer jika diimplementasikan di masa depan.

## Mengapa Snippet Tidak Pakai Bridge Saat Ini

Snippet adalah pure CRUD yang hanya berinteraksi dengan database. Tidak ada external services (MinIO, Redis), tidak ada multi-step operations, dan tidak ada complex orchestration. Bridge layer saat ini hanya akan menjadi passthrough tanpa value.

---

## Rekomendasi Fitur yang Butuh Bridge

### 1. Command Sanitization

Validasi dan sanitisasi command sebelum disimpan ke database.

**Use case:**
- Trim whitespace dari command
- Strip karakter berbahaya atau tidak valid
- Normalize line endings

**Bridge method:**
```typescript
sanitizeCommand(command: string): string {
    return command.trim().replace(/\r\n/g, '\n')
}
```

---

### 2. Alias Format Validation

Enforce naming rules untuk alias agar konsisten dan aman digunakan sebagai shortcut.

**Use case:**
- Hanya izinkan alphanumeric, dash, underscore
- Reject alias yang mengandung spasi atau karakter special
- Enforce max length sebelum hit database

**Bridge method:**
```typescript
validateAliasFormat(alias: string): boolean {
    const aliasPattern = /^[a-zA-Z0-9_-]+$/
    if (!aliasPattern.test(alias)) {
        throw new BadRequestException("Alias hanya boleh mengandung huruf, angka, dash, dan underscore")
    }
    return true
}
```

---

### 3. Snippet Execution Logging

Jika snippet punya fitur "run" atau "execute", butuh logging ke external service atau DB.

**Use case:**
- Catat kapan snippet dieksekusi
- Catat user yang mengeksekusi
- Track execution history

**Bridge method:**
```typescript
async logExecution(snippet_id: number, user_id: number) {
    await this.redisService.lpush(
        `execution:${user_id}`,
        JSON.stringify({ snippet_id, executed_at: new Date() })
    )
}
```

**Requires:** Redis client injection

---

### 4. Snippet Templates / Sharing

Jika snippet bisa di-share ke user lain atau dijadikan template publik.

**Use case:**
- Generate access token untuk snippet sharing (mirip file access token)
- Validasi ownership sebelum share
- Manage shared snippet permissions

**Bridge method:**
```typescript
async generateShareToken(snippet_id: number, user_id: number): Promise<string> {
    const token = this.jwtService.generateJwt({
        snippet_id,
        user_id,
        type: "snippet_share_token"
    })
    return token
}
```

**Requires:** JwtService injection

---

### 5. Bulk Operations

Jika user perlu import/export snippets dalam jumlah banyak.

**Use case:**
- Import snippets dari file JSON/YAML
- Export semua snippets user ke file
- Bulk delete dengan filter

**Bridge method:**
```typescript
async importSnippets(snippets: SnippetImportDTO[], user_id: number) {
    // Validate all aliases are unique before bulk insert
    // Handle partial failures
    // Return success/failure report
}
```

---

## Cara Implementasi Bridge di Masa Depan

Jika salah satu fitur di atas diimplementasikan:

1. Buat `SnippetBridgeModules` di `bridge.main.ts`
2. Inject dependency yang dibutuhkan (Redis, JwtService, dll)
3. Inject `SnippetDbModules` ke bridge
4. Update `controller.ts` untuk inject bridge, hapus direct DB inject
5. Update `module.ts` untuk register bridge sebagai provider
