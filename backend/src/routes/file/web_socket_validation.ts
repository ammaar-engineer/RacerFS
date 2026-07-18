import { Injectable } from "@nestjs/common";
import { IsString, IsNotEmpty, IsIn, IsObject, ValidationError, IsNumber } from "class-validator";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { NotFoundException } from "src/CustomExceptionHandle";

/**
 * DTO for WebSocket message structure
 */
export class WebSocketMessageDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(["UPLOADING", "SUCCESS", "FAILED"])
    event!: "UPLOADING" | "SUCCESS" | "FAILED";

    @IsObject()
    data!: any;
}

/**
 * DTO for UPLOADING event data
 */
export class UploadingEventDataDto {
    @IsString()
    @IsNotEmpty({ message: "file-name is required" })
    "file-name"!: string;

    @IsNumber()
    @IsNotEmpty({message: "file-size is required"})
    "file-size"!: number
}

/**
 * DTO for SUCCESS event data
 * TODO: Add validation rules when requirements are defined
 */
export class SuccessEventDataDto {
    
}

/**
 * DTO for FAILED event data
 * TODO: Add validation rules when requirements are defined
 */
export class FailedEventDataDto {
    // Placeholder for future validation
}

@Injectable()
export class WebSocketValidation {
    /**
     * Validate and parse raw WebSocket message
     * @param rawMessage Raw JSON string from client
     * @returns Validated WebSocketMessageDto
     * @throws NotFoundException if JSON parsing fails or validation fails
     */
    async validateMessage(rawMessage: string): Promise<WebSocketMessageDto> {
        // Parse JSON
        let parsed: any;
        try {
            parsed = JSON.parse(rawMessage);
        } catch (error) {
            throw new NotFoundException("Invalid JSON format");
        }

        // Validate with DTO
        const dto = plainToInstance(WebSocketMessageDto, parsed, {
            excludeExtraneousValues: false
        });

        try {
            await validateOrReject(dto);
        } catch (errors) {
            if (Array.isArray(errors) && errors.length > 0) {
                const firstError = errors[0] as ValidationError;
                const constraints = firstError.constraints;
                const errorMessage = constraints 
                    ? Object.values(constraints)[0] 
                    : "Validation failed";
                throw new NotFoundException(errorMessage);
            }
            throw new NotFoundException("Message validation failed");
        }

        return dto;
    }

    /**
     * Generic validator for event data
     * @param dtoClass DTO class for validation
     * @param data Data object to validate
     * @returns Validated DTO instance
     * @throws NotFoundException if validation fails
     */
    async validateEventData<T extends object>(
        dtoClass: new () => T,
        data: any
    ): Promise<T> {
        if (!data) {
            throw new NotFoundException("Data payload is required");
        }

        const dto = plainToInstance(dtoClass, data, {
            excludeExtraneousValues: false
        });

        try {
            await validateOrReject(dto);
        } catch (errors) {
            if (Array.isArray(errors) && errors.length > 0) {
                const firstError = errors[0] as ValidationError;
                const constraints = firstError.constraints;
                const errorMessage = constraints 
                    ? Object.values(constraints)[0] 
                    : "Validation failed";
                throw new NotFoundException(errorMessage);
            }
            throw new NotFoundException("Data validation failed");
        }

        // Run custom validation if exists
        if (typeof (dto as any).validate === 'function') {
            (dto as any).validate();
        }

        return dto;
    }

    /**
     * Validate UPLOADING event data
     * @param data Data object to validate
     * @returns Validated UploadingEventDataDto
     * @throws NotFoundException if validation fails
     */
    async validateUploadingData(data: any): Promise<UploadingEventDataDto> {
        return this.validateEventData(UploadingEventDataDto, data);
    }

    /**
     * Validate SUCCESS event data
     * @param data Data object to validate
     * @returns Validated SuccessEventDataDto
     */
    async validateSuccessData(data: any): Promise<SuccessEventDataDto> {
        return this.validateEventData(SuccessEventDataDto, data);
    }

    /**
     * Validate FAILED event data
     * @param data Data object to validate
     * @returns Validated FailedEventDataDto
     */
    async validateFailedData(data: any): Promise<FailedEventDataDto> {
        return this.validateEventData(FailedEventDataDto, data);
    }
}
