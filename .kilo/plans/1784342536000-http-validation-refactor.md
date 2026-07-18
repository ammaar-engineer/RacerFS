# HTTP Endpoint Validation Refactoring Plan

## Goal
Refactor HTTP endpoint validation menggunakan pattern yang sama dengan WebSocket validation: per-endpoint validation methods dengan integrated DTO validation, membuat controller code menjadi clean dan readable.

## Context
Saat ini validasi HTTP endpoint tersebar di controller dengan pattern yang verbose:
- Controller melakukan manual validation call dengan `validateDualTokenHeaders()` dan `customDtoValidation()`
- Setiap endpoint perlu 2-3 baris untuk validasi headers + query/body
- Token verification logic tercampur dengan validation logic di `FileRouteValidations`
- Controller tidak clean karena banyak validation boilerplate

Pattern WebSocket validation yang baru (yang diinginkan):
- One method per event: `validateUploadingData()`, `validateMessage()`
- Semua validation logic (DTO + business rules) dalam satu method
- Controller/Gateway code sangat clean: `const validated = await validation.validateX(data)`

## Current HTTP Endpoints Analysis

### Implemented Endpoints
1. **GET /file/list** (`controller.ts:22-38`)
   - Headers: authorization, access-token, file-name
   - Validation: Dual token with owner check
   - DTO: `FileListHeaderDTO`

2. **GET /file/download** (`controller.ts:40-47`)
   - Status: Empty implementation
   - DTO: `FileDownloadHeaderDTO`, `FileDownloadQueryDTO`

3. **PATCH /file/rename** (`controller.ts:49-66`)
   - Headers: authorization, access-token
   - Query: fileKey, new-name
   - Validation: Dual token with owner check + query validation
   - DTO: `FileEditHeaderDTO`, `FileEditQueryDTO`

4. **POST /file/generate-access-token** (`controller.ts:87-88`)
   - Status: Empty implementation

5. **POST /file/upload** (`controller.ts:68-85`)
   - Status: Commented out
   - Headers: authorization, access-token, x-file-name
   - DTO: `FileUploadHeadersDTO`

## Proposed Validation Pattern

### New Structure: Per-Endpoint Validation Methods
Similar to WebSocket validation, create specific methods per endpoint that encapsulate ALL validation logic:

```typescript
// Before (controller):
const { accountTokenData, accessTokenData, accessTokenOwner } = await this.fileRouteValidation.validateDualTokenHeaders(
    headers,
    FileListHeaderDTO,
    {validateOwner: true}
)
const fileList = await this.fileServices.getUserFileList(accountTokenData.value.user_id, accessTokenOwner.user_id)

// After (controller):
const validated = await this.validation.validateFileListRequest(headers)
const fileList = await this.fileServices.getUserFileList(validated.userId, validated.accessTokenOwnerId)
```

### Benefits
1. **Clean Controller**: Each endpoint = 1 validation call
2. **Encapsulation**: All validation logic (DTO + tokens + business rules) in validation service
3. **Type Safety**: Validation returns typed objects with exactly what endpoint needs
4. **Consistency**: Same pattern as WebSocket validation
5. **Testability**: Validation logic isolated and easy to test

## Design Questions

### Q1: Validation Service Location
Where should the new HTTP validation service be placed?

**Options:**
A. **Extend existing `FileRouteValidations`** - Add new per-endpoint methods alongside current generic methods
   - Pros: Single validation service, gradual migration
   - Cons: File becomes large, mixing old and new patterns

B. **New file `http_validation.ts`** - Create separate service like `web_socket_validation.ts`
   - Pros: Clean separation, consistent with WebSocket pattern, easier to maintain
   - Cons: Need to inject both services during migration

**Recommendation**: Option B - Create new `http_validation.ts` for consistency with WebSocket pattern. Keep `FileRouteValidations` for backward compatibility during migration, then deprecate.

### Q2: Validation Return Type Structure
What should validation methods return?

**Options:**
A. **Flat object** with all needed values
   ```typescript
   { userId: number, accessTokenOwnerId: number, fileKey: string, newName: string }
   ```

B. **Structured object** separating concerns
   ```typescript
   { 
     auth: { userId: number, accessTokenOwnerId: number, tokens: {...} },
     params: { fileKey: string, newName: string }
   }
   ```

C. **Typed DTO classes** as return values
   ```typescript
   class ValidatedFileListRequest {
     userId: number;
     accessTokenOwnerId: number;
   }
   ```

**Recommendation**: Option A (Flat) - Simplest for controller usage. Controller just destructures what it needs. Type safety via TypeScript return type annotations.

### Q3: DTO Strategy
Current DTOs in `dto.ts` are simple with only `@IsString()`. Should we enhance them?

**Options:**
A. **Keep existing DTOs** - Minimal changes, just reorganize usage
B. **Enhance DTOs** - Add more validators (`@IsNotEmpty()`, `@Length()`, custom validators)
C. **Create new DTOs** - Separate DTOs for request vs validated data

**Recommendation**: Option B - Enhance existing DTOs with proper validators. This improves validation quality without major restructure.

### Q4: Token Verification Logic
Current `validateDualTokenHeaders()` does JWT verify + DB check. How should this be handled?

**Options:**
A. **Keep as helper method** - Per-endpoint methods call internal `_verifyTokens()` helper
B. **Inline in each method** - Duplicate token logic per endpoint
C. **Separate token service** - Extract to dedicated `TokenValidation` service

**Recommendation**: Option A - Keep as private helper methods within validation service. Token verification is cross-cutting but not complex enough for separate service.

### Q5: Migration Strategy
How to handle existing endpoints during refactoring?

**Options:**
A. **Big bang** - Refactor all endpoints at once
B. **Gradual** - New validation service alongside old, migrate endpoint by endpoint
C. **Parallel** - Keep both patterns indefinitely

**Recommendation**: Option B - Gradual migration. Create `HttpValidation` service, migrate endpoints one by one, deprecate `FileRouteValidations` once migration complete.

## Implementation Plan

### Phase 1: Create HTTP Validation Service
**File**: `backend/src/routes/file/http_validation.ts`

1. Create `HttpValidation` injectable service
2. Implement private helper methods:
   - `_validateHeaders<T>(dtoClass, headers)` - Generic header DTO validation
   - `_validateQuery<T>(dtoClass, query)` - Generic query DTO validation
   - `_validateBody<T>(dtoClass, body)` - Generic body DTO validation
   - `_verifyAccountToken(token)` - JWT verify for account token
   - `_verifyAccessToken(token)` - JWT verify + DB check for access token
   - `_checkTokenOwnership(accountUserId, accessTokenUserId)` - Ownership validation

3. Implement per-endpoint validation methods:
   - `validateFileListRequest(headers)` - For GET /file/list
   - `validateFileRenameRequest(headers, query)` - For PATCH /file/rename
   - `validateFileDownloadRequest(headers, query)` - For GET /file/download
   - `validateFileUploadRequest(headers)` - For POST /file/upload (when uncommented)

Each method returns flat object with exactly what controller needs.

### Phase 2: Enhance DTOs
**File**: `backend/src/routes/file/dto.ts`

Add proper validators:
- `@IsNotEmpty()` for required string fields
- `@IsJWT()` for token fields (if available)
- Custom validators for business rules (e.g., fileName format)

Update existing DTOs:
- `FileListHeaderDTO`: Add `@IsNotEmpty()` to all fields, remove unused `file-name` field (not used in controller)
- `FileEditHeaderDTO`: Add `@IsNotEmpty()`
- `FileEditQueryDTO`: Add `@IsNotEmpty()`, consider length limits for `new-name`
- `FileDownloadHeaderDTO`: Add `@IsNotEmpty()`
- `FileDownloadQueryDTO`: Add `@IsNotEmpty()`, add `@IsNumberString()` for userId

### Phase 3: Update Controller
**File**: `backend/src/routes/file/controller.ts`

1. Inject `HttpValidation` service in constructor
2. Refactor endpoints one by one:

**GET /file/list:**
```typescript
@Get("list")
async getFileList(@Headers() headers: Record<string, string>) {
    const { userId, accessTokenOwnerId } = await this.httpValidation.validateFileListRequest(headers);
    const fileList = await this.fileServices.getUserFileList(userId, accessTokenOwnerId);
    return SuccessResponse("File list retrieved successfully", fileList);
}
```

**PATCH /file/rename:**
```typescript
@Patch("rename")
async editFile(
    @Headers() headers: Record<string, string>,
    @Query() query: Record<string, string>
) {
    const { fileKey, newName } = await this.httpValidation.validateFileRenameRequest(headers, query);
    const editFile = await this.fileServices.renameFile(fileKey, newName);
    return SuccessResponse(`File ${editFile.oldName} has been renamed`);
}
```

3. Remove unused imports: `plainToInstance`, `validateOrReject`
4. Remove direct `FileRouteValidations` usage (keep injected for backward compatibility during migration)

### Phase 4: Update Module
**File**: `backend/src/routes/file/module.ts`

Add `HttpValidation` to providers array.

### Phase 5: Testing & Validation
1. Run `npm run build` to check TypeScript errors
2. Test each migrated endpoint manually or with existing tests
3. Verify error messages are user-friendly
4. Confirm token validation logic unchanged

### Phase 6: Deprecation (Future)
Once all endpoints migrated:
1. Mark `FileRouteValidations` methods as `@deprecated`
2. Eventually remove `FileRouteValidations` if no other routes depend on it
3. Remove old DTOs if replaced

## Affected Files

### New Files
- `backend/src/routes/file/http_validation.ts` - New validation service

### Modified Files
- `backend/src/routes/file/dto.ts` - Enhance with validators
- `backend/src/routes/file/controller.ts` - Refactor endpoints to use new validation
- `backend/src/routes/file/module.ts` - Add HttpValidation provider

### Unchanged Files (for now)
- `backend/src/routes/file/validation.ts` - Keep for backward compatibility
- `backend/src/routes/file/service.ts` - No changes needed (service methods unchanged)

## Validation Method Signatures

```typescript
class HttpValidation {
    // GET /file/list
    validateFileListRequest(headers: Record<string, string>): Promise<{
        userId: number;
        accessTokenOwnerId: number;
    }>;

    // PATCH /file/rename
    validateFileRenameRequest(
        headers: Record<string, string>,
        query: Record<string, string>
    ): Promise<{
        userId: number;
        accessTokenOwnerId: number;
        fileKey: string;
        newName: string;
    }>;

    // GET /file/download
    validateFileDownloadRequest(
        headers: Record<string, string>,
        query: Record<string, string>
    ): Promise<{
        userId: number;
        fileName: string;
        targetUserId: number;
    }>;

    // POST /file/upload (when uncommented)
    validateFileUploadRequest(headers: Record<string, string>): Promise<{
        userId: number;
        accessTokenOwnerId: number;
        fileName: string;
    }>;
}
```

## Error Handling

All validation methods throw exceptions from `src/CustomExceptionHandle`:
- `NotFoundException` - Invalid/missing data
- `UnauthorizedException` - Token verification failures
- `ValidationError` - DTO validation failures (auto-converted to NotFoundException with descriptive message)

Errors automatically caught by global HTTP exception filter (`CustomGlobalException`).

## Open Questions

1. **FileListHeaderDTO has unused field**: `file-name` field exists in DTO but not used in controller logic. Should we remove it?
   - **Recommendation**: Remove from DTO as it's not used

2. **Empty endpoints**: `downloadFile` and `generatePermissionKey` are empty. Should we implement validation for them now or wait?
   - **Recommendation**: Create validation methods now with DTOs, but mark as TODO in implementation plan

3. **Commented upload endpoint**: Should we uncomment and refactor it?
   - **Recommendation**: Refactor validation method but keep endpoint commented. User can uncomment when ready.

4. **Token repo dependency**: `HttpValidation` needs access to Token repository for access token verification. Should we inject it directly or use `FileRouteValidations` as dependency?
   - **Recommendation**: Inject Token repository and JwtService directly into `HttpValidation` for full independence

## Success Criteria

✅ Controller methods have single validation call per endpoint  
✅ No manual DTO instantiation in controller  
✅ Validation service encapsulates all validation logic  
✅ Pattern consistent with WebSocket validation  
✅ Type safety maintained  
✅ Build succeeds without errors  
✅ Existing functionality unchanged  

## Next Steps

After user confirmation:
1. Create `http_validation.ts` with service and methods
2. Enhance DTOs with proper validators
3. Refactor controller endpoints one by one
4. Update module providers
5. Run build and verify
