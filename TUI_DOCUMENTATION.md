# RacerFS TUI — Architecture & Pattern Documentation

---

## Arsitektur 3-Layer

Setiap fitur mengikuti pola yang konsisten:

```
handler.ts    ← auth gate + routing ke component
component     ← UI prompts & orchestration
service       ← HTTP calls & token management
```

---

## Layer 1 — Handler

Auth gate + routing. Setiap handler punya opsi `Back` di akhir dengan `action: async () => {}`.

```typescript
export async function FeatureHandler() {
  if (!validation.isUserAuthenticated()) {
    console.log("Please login first")
    return  // bail out ke parent menu
  }

  await createSelectOption("Menu Title", [
    { label: 'Action', action: async () => component() },
    { label: 'Back',   action: async () => {} }
  ])
}
```

**Auth handler tidak punya auth gate** — karena dia entry point untuk dapat token.

Handler bisa punya sub-module jika sub-menu butuh penanganan lebih kompleks:

```typescript
{ label: 'Manage Tokens', action: () => TokenHandler() }  // ← delegate ke sub-handler
```

Sub-handler tidak perlu re-check auth jika parent sudah check.

---

## Layer 2 — Component

Ada 4 pola component:

**A. Input-first** — untuk create, login, register:
```typescript
const alias = await text({ message: "Alias" })
const result = await service.create(alias)
console.log(chalk.green("✓ Created"))
```

**B. Fetch-first** — untuk edit, delete. Fetch list dulu, user pilih, baru aksi:
```typescript
const list     = await service.getList()
const selected = await select({ options: list.map(s => ({ value: s.alias, label: s.alias, hint: s.command })) })
await service.update(selected, newValue)
```

**C. Display-only** — untuk list:
```typescript
const data = await service.getList()
data.forEach(item => console.log(item))
```

**D. Confirm before action** — untuk destructive action (delete):
```typescript
const confirm = await select({ options: [{ value: 'yes' }, { value: 'no' }] })
if (confirm === 'yes') await service.delete(selected)
```

---

## Layer 3 — Service

Token dibaca dari disk setiap call — tidak di-cache di memory.

```typescript
export class FeatureService {
  private getAuthToken(): string {
    const data = serviceSystem.readFile('~/.racerfs/user.rcfs', { isJson: true })
    return data.account_token
  }

  async getList() {
    try {
      const token = this.getAuthToken()
      const res = await axios.get(`${BACKEND_URL}/feature/list`, {
        headers: { authorization: token }
      })
      return res.data.data.items  // ← akses: res.data.data.<key>
    } catch (error: any) {
      if (error.response?.status === 401) console.log("Authentication failed")
      else if (error.response?.status === 404) console.log("Not found")
      else if (error.response?.status === 409) console.log("Already exists")
      else console.log("Error")
      process.exit(1)             // ← semua error langsung exit
    }
  }
}

export const featureService = new FeatureService()  // ← singleton
```

---

## State Management

Tidak ada in-memory state. Token disimpan ke filesystem saat login/register, dibaca ulang setiap request:

```
~/.racerfs/
  └── user.rcfs    ← {"account_token": "eyJhbGc..."}
```

---

## Auth Flow

Login dan register flow identik, hanya beda endpoint:

```
prompt email → POST /user/login|register → dapat sessionId
prompt OTP   → POST /user/verify-otp     → dapat token
tulis token ke ~/.racerfs/user.rcfs
```

---

## Error Handling

Fail fast — semua error langsung `process.exit(1)`. Tidak ada retry atau recovery.

---

## Nested Module Pattern

Jika satu menu punya sub-menu yang kompleks, buat `*_module/` di dalam folder modul:

```
system_module/file/
  ├── handler.ts
  ├── services/
  ├── validations/
  └── file_module/       ← sub-module
      ├── handler.ts
      ├── services/
      └── validations/
```

Kapan buat sub-module:
- Sub-menu punya 4+ action dengan logic sendiri
- Butuh service class baru yang terpisah dari parent
- Domain concern berbeda (contoh: file ops vs token ops)

---

## Ringkasan Per Aksi

| Aksi | Pattern |
|---|---|
| Login / Register | Input-first → save token ke disk |
| List | Fetch → render |
| Create | Input-first → service call |
| Edit | Fetch-first → pilih dari list → input baru |
| Delete | Fetch-first → pilih dari list → confirm → service call |
