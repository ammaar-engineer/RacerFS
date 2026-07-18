# WebSocket Validation Refactoring Plan

## Goal
Refactor semua validasi WebSocket ke file terpisah (`web_socket_validation.ts`) menggunakan class-validator dan DTO pattern yang konsisten dengan `FileRouteValidations`.

## Context
Saat ini validasi WebSocket tersebar di:
1. **Gateway** (`web_socket_gateway.ts:20-31`): JSON parsing, event field validation, event existence check
2. **Service** (`service.ts:19-25`): fileName validation dalam `WsEvent_UPLOADING`

Pattern yang ada menggunakan manual if-else validation, sedangkan `FileRouteValidations` menggunakan class-validator dengan DTO pattern yang lebih maintainable.

## Affected Files
- **Create**: `backend/src/routes/file/web_socket_validation.ts`
- **Modify**: `backend/src/routes/file/web_socket_gateway.ts`
- **Modify**: `backend/src/routes/file/service.ts`
- **Modify**: `backend/src/routes/file/module.ts` (tambahkan WebSocketValidation ke providers jika belum)

## Implementation Tasks

### 1. Create DTOs for WebSocket Events
**File**: `backend/src/routes/file/web_socket_validation.ts`

Create DTOs:
- `WebSocketMessageDto`: Validate raw message structure (event, data fields)
- `UploadingEventDataDto`: Validate data untuk event UPLOADING (fileName field)
- `SuccessEventDataDto`: Validate data untuk event SUCCESS (jika ada requirements)
- `FailedEventDataDto`: Validate data untuk event FAILED (jika ada requirements)

Use decorators:
- `@IsString()`, `@IsNotEmpty()`, `@IsIn()` dari `class-validator`
- `@Expose()` dari `class-transformer` jika perlu

### 2. Create WebSocketValidation Service
**File**: `backend/src/routes/file/web_socket_validation.ts`

Create `@Injectable()` class dengan methods:
- `validateMessage(rawMessage: string): Promise<WebSocketMessageDto>` - Parse dan validate JSON message
- `validateEventData<T>(dtoClass: new () => T, data: any): Promise<T>` - Generic validator untuk event data
- `validateUploadingData(data: any): Promise<UploadingEventDataDto>` - Specific validator untuk UPLOADING event

Pattern mirip dengan `FileRouteValidations.customDtoValidation()`:
```typescript
async validateEventData<T extends object>(
    dtoClass: new () => T,
    data: any
): Promise<T> {
    const dto = plainToInstance(dtoClass, data, {
        excludeExtraneousValues: false
    });
    await validateOrReject(dto);
    return dto;
}
```

### 3. Update WebSocket Gateway
**File**: `backend/src/routes/file/web_socket_gateway.ts`

Changes:
- Inject `WebSocketValidation` service via constructor
- Replace manual JSON parsing (line 20-26) dengan `this.wsValidation.validateMessage(message)`
- Replace manual event validation (line 29-31) dengan check terhadap DTO event type
- Remove try-catch JSON parsing block
- Keep `@UseFilters(WebSocketException)` untuk catch validation errors

Before:
```typescript
let parsedMessage: WebSocketMessageType;
try {
    parsedMessage = JSON.parse(message) as WebSocketMessageType;
} catch (error) {
    throw new NotFoundException("Invalid JSON format");
}
```

After:
```typescript
const parsedMessage = await this.wsValidation.validateMessage(message);
```

### 4. Update Service Methods
**File**: `backend/src/routes/file/service.ts`

Changes in `WsEvent_UPLOADING`:
- Inject `WebSocketValidation` service via constructor
- Replace manual fileName validation (line 19-25) dengan `this.wsValidation.validateUploadingData(data)`
- Method akan menerima validated DTO, bukan `any`

Before:
```typescript
async WsEvent_UPLOADING(data: any) {
    if (!data) {
        throw new NotFoundException("Data payload is required")
    }
    if (!data.fileName || typeof data.fileName !== 'string' || data.fileName.trim() === '') {
        throw new NotFoundException("Valid fileName is required")
    }
    return this.minioService.presignedPutObject("racerfs_bucket", data.fileName, 5600)
}
```

After:
```typescript
async WsEvent_UPLOADING(data: any) {
    const validatedData = await this.wsValidation.validateUploadingData(data);
    return this.minioService.presignedPutObject("racerfs_bucket", validatedData.fileName, 5600)
}
```

### 5. Update Module Providers
**File**: `backend/src/routes/file/module.ts`

- Add `WebSocketValidation` to providers array
- Ensure it's available for injection

## Validation Rules

### WebSocketMessageDto
- `event`: Required, must be string, must be one of: "UPLOADING", "SUCCESS", "FAILED"
- `data`: Required, must be object

### UploadingEventDataDto
- `fileName`: Required, must be string, must not be empty/whitespace-only

### Error Handling
- class-validator akan throw `ValidationError[]` 
- `validateOrReject()` akan throw error yang akan di-catch oleh `WebSocketException` filter
- `WebSocketException` sudah configured di gateway level dengan `@UseFilters(WebSocketException)`
- Error messages akan otomatis ter-format dan di-emit ke client

## Benefits
1. **Consistency**: Sama pattern dengan `FileRouteValidations`
2. **Maintainability**: Centralized validation logic
3. **Type Safety**: DTO provides strong typing
4. **Reusability**: Validation dapat digunakan ulang di gateway dan service
5. **Declarative**: Validation rules via decorators lebih readable
6. **Automatic Error Formatting**: class-validator errors otomatis ter-handle

## Risks & Considerations
1. **Breaking Changes**: None - validation logic sama, hanya dipindahkan
2. **Performance**: Minimal overhead dari class-transformer/class-validator
3. **Error Messages**: Pastikan error messages dari class-validator user-friendly untuk WebSocket clients

## Validation Example Flow
```
Client sends message
    ↓
Gateway: validateMessage() → WebSocketMessageDto
    ↓
Gateway: Check event type valid
    ↓
Service: validateUploadingData() → UploadingEventDataDto
    ↓
Service: Process with validated data
    ↓
Client receives response or error via WebSocketException filter
```

## Open Questions
None - implementation is clear based on existing patterns.
