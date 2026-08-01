export const listFilesDocs = {
  summary: 'Get file list',
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
      description: 'File list retrieved successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'File list retrieved successfully',
        errorCode: '',
        data: {
          files: [
            {
              id: 1,
              name: 'photo.png',
              size: 204800,
              file_type: '.png',
              uploaded_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      },
    },
  ],
};
