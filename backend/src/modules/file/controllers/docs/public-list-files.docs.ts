export const publicListFilesDocs = {
  summary: 'List all public files via access token',
  headers: [
    {
      name: 'access-token',
      description: 'File access token (JWT)',
      required: true,
    },
  ],
  responses: [
    {
      status: 200,
      description: 'Public files retrieved successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'Public files retrieved successfully',
        errorCode: '',
        data: {
          files: [
            {
              id: 1,
              name: 'photo.png',
              size: 204800,
              type: '.png',
              uploaded_at: '2026-08-01T12:00:00Z',
            },
          ],
        },
      },
    },
  ],
};
