export const downloadFileDocs = {
  summary: 'Get download URL for file',
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
      description: 'Download URL generated',
      example: {
        success: true,
        statusCode: 200,
        message: 'Download URL generated',
        errorCode: '',
        data: {
          url: 'https://storage.example.com/presigned-url...',
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
