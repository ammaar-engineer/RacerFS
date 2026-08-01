export const publicDownloadDocs = {
  summary: 'Download public file via access token',
  headers: [
    {
      name: 'access-token',
      description: 'File access token (opaque string)',
      required: true,
    },
  ],
  responses: [
    {
      status: 200,
      description: 'Download URL generated',
      example: {
        success: true,
        statusCode: 200,
        message: 'Download URL generated',
        errorCode: '',
        data: {
          url: 'https://minio.example.com/racerfs-bucket/file-key?X-Amz-Signature=...',
          file: {
            name: 'photo.png',
            size: 204800,
            type: '.png',
          },
        },
      },
    },
  ],
};
