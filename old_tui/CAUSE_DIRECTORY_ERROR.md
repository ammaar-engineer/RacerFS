# Penyebab Error: Cannot find module saat npm link

## Error yang Terjadi
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/quanta/Documents/engineer/RacerFS/tui/dist/files/handler' 
imported from /home/quanta/Documents/engineer/RacerFS/tui/dist/main.js
```

## Root Cause

### 1. **Package.json menunjuk ke file TypeScript mentah**
```json
{
  "main": "main.ts",           // ❌ Salah - menunjuk ke .ts file
  "bin": {
    "racer-fs": "./src/main.ts" // ❌ Salah - Node.js tidak bisa execute .ts
  }
}
```

**Penyebab**: Saat `npm link` dijalankan, Node.js mencoba menjalankan file `.ts` langsung yang tidak bisa di-execute tanpa transpiler.

### 2. **Shebang menggunakan `tsx` bukan `node`**
```typescript
#!/usr/bin/env tsx  // ❌ Hanya bekerja di development
```

**Penyebab**: `tsx` adalah TypeScript executor untuk development, tidak tersedia di global environment setelah `npm link`.

### 3. **ES Modules memerlukan ekstensi `.js` di import statement**
```typescript
// ❌ Tidak bekerja dengan "type": "module" di package.json
import { FilesHandler } from './files/handler';

// ✅ Yang benar untuk ES modules
import { FilesHandler } from './files/handler.js';
```

**Penyebab**: Dengan `"type": "module"` di package.json, Node.js menggunakan ES modules yang **strict** dengan file resolution. Node.js tidak melakukan automatic extension resolution seperti bundler (Vite, Webpack).

### 4. **TypeScript `moduleResolution: "bundler"` tidak cocok untuk Node.js runtime**
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"  // ❌ Untuk bundler, bukan Node.js
  }
}
```

**Penyebab**: Setting `"bundler"` membuat TypeScript tidak memvalidasi bahwa import harus punya ekstensi `.js`, sehingga code compile tapi gagal saat runtime di Node.js.

### 5. **Package `tsc` yang salah terinstall**
Package npm `tsc` adalah package palsu yang bukan TypeScript compiler asli.

**Penyebab**: Saat `npm run build` dijalankan, yang terexecute adalah package `tsc` palsu, bukan TypeScript compiler dari package `typescript`.

## Solusi yang Diterapkan

### 1. Update package.json
```json
{
  "main": "./dist/main.js",
  "bin": {
    "racer-fs": "./dist/main.js"
  },
  "files": ["dist"],
  "scripts": {
    "dev": "npx tsx src/main.ts",
    "build": "node_modules/.bin/tsc",
    "prepublishOnly": "npm run build",
    "prepack": "npm run build"
  }
}
```

### 2. Update shebang di src/main.ts
```typescript
#!/usr/bin/env node  // ✅ Bekerja di semua environment
```

### 3. Tambahkan ekstensi .js ke semua relative imports
Script otomatis menambahkan `.js` ke 27 file TypeScript:
```typescript
// Sebelum
import { FilesHandler } from './files/handler';

// Sesudah
import { FilesHandler } from './files/handler.js';
```

### 4. Install TypeScript yang benar
```bash
npm uninstall tsc
npm install --save-dev typescript
```

### 5. Build project
```bash
npm run build  # Menghasilkan file di dist/
```

## Verifikasi
```bash
node dist/main.js  # ✅ Berhasil dijalankan
```

## Best Practices untuk ES Modules + TypeScript

1. **Selalu gunakan ekstensi `.js` di import statement** (bahkan untuk file `.ts`)
2. **`"type": "module"` di package.json** memerlukan strict file resolution
3. **`bin` field harus menunjuk ke compiled `.js` file**, bukan `.ts`
4. **Shebang harus `#!/usr/bin/env node`** untuk production
5. **Build dulu sebelum npm link**: `npm run build && npm link`

## Referensi
- [TypeScript + ES Modules in Node.js](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [Package.json bin field](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#bin)
