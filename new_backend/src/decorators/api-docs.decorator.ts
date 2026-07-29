import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';

interface ApiDocsOptions {
  summary: string;
  bodyType?: any;
  headers?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
  responses?: Array<{
    status: number;
    description: string;
    example: any;
  }>;
}

/**
 * Composite decorator for API documentation
 * Combines ApiOperation, ApiBody, ApiHeader, and ApiResponse decorators
 */
export function ApiDocs(options: ApiDocsOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    ApiOperation({ summary: options.summary }),
  ];

  // Add body decorator if provided
  if (options.bodyType) {
    decorators.push(ApiBody({ type: options.bodyType }));
  }

  // Add header decorators if provided
  if (options.headers) {
    options.headers.forEach(header => {
      decorators.push(
        ApiHeader({
          name: header.name,
          description: header.description,
          required: header.required ?? true,
        })
      );
    });
  }

  // Add response decorators if provided
  if (options.responses) {
    options.responses.forEach(response => {
      decorators.push(
        ApiResponse({
          status: response.status,
          description: response.description,
          schema: { example: response.example },
        })
      );
    });
  }

  return applyDecorators(...decorators);
}
