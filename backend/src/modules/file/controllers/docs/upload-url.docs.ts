export const uploadUrlDocs = {
  summary: 'Get presigned upload URL',
  headers: [
    {
      name: 'authorization',
      description: 'JWT account token',
      required: true,
    },
  ],
  responses: [
    {
      status: 200,
      description: 'Upload URL generated',
      example: {
        success: true,
        statusCode: 200,
        message: 'Upload URL generated',
        errorCode: '',
        data: {
          url: 'https://storage.example.com/upload',
          formData: {
            key: 'file-key',
            policy: 'base64-encoded-policy',
            signature: 'signature-hash',
          },
          fileKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        },
      },
    },
  ],
};
