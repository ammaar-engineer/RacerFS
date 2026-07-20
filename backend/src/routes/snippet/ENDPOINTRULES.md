# Snippet Endpoint Rules

## Entity Fields

- `id`: number (auto-generated)
- `alias`: string (max 255 chars)
- `description`: text (nullable)
- `command`: text
- `user_id`: number
- `created_at`: timestamp

## Business Rules

### Alias
- HARUS unique per user
- TIDAK BISA diubah setelah dibuat
- Digunakan sebagai identifier untuk edit dan delete

### Edit
- User HANYA bisa mengedit field `command`
- Field `alias`, `description`, `user_id`, `created_at` TIDAK bisa diedit
- Patokan pencarian snippet menggunakan `alias`

### Ownership
- User hanya bisa melihat snippet milik sendiri
- User hanya bisa CRUD snippet milik sendiri
- Validasi ownership wajib pada semua operations

### Authentication
- Semua endpoint memerlukan `account_token` via header `authorization`
- Gunakan `PermissionBridge.isValidAccountToken()` untuk validasi
- Extract `user_id` dari validated token

## Endpoint Rules

### GET /snippet/list
- Return semua snippets milik authenticated user
- Diurutkan berdasarkan `created_at` DESC
- Hanya return snippets dimana `user_id` cocok dengan token

### POST /snippet/create
- Validasi `alias` unique per user sebelum insert
- Throw `ConflictException` jika alias sudah ada untuk user tersebut
- `user_id` diambil dari token, bukan dari request body
- `id` dan `created_at` auto-generated

### DELETE /snippet/delete
- Cari snippet berdasarkan `alias` DAN `user_id`
- Throw `NotFoundException` jika snippet tidak ditemukan
- Verifikasi ownership sebelum delete

### PATCH /snippet/edit
- Cari snippet berdasarkan `alias` DAN `user_id`
- Throw `NotFoundException` jika snippet tidak ditemukan
- HANYA update field `command`
- Field `alias` TIDAK BISA diubah

## Error Handling

| Error | Kondisi | HTTP Status |
|-------|---------|-------------|
| `UnauthorizedException` | Token invalid atau expired | 401 |
| `NotFoundException` | Snippet tidak ditemukan | 404 |
| `ConflictException` | Alias sudah ada saat create | 409 |
| `BadRequestException` | DTO validation gagal | 400 |

## Security

- Validasi account token pada semua endpoints
- Ownership check pada semua CRUD operations
- Alias uniqueness enforced per user
- Alias immutable setelah create
- Edit scope terbatas (command only)
