export const listAccessTokensDocs = {
  summary: 'List all file access tokens',
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
      description: 'Access tokens retrieved successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'Access tokens retrieved successfully',
        errorCode: '',
        data: {
          tokens: [
            {
              id: 1,
              token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              user_id: 42,
              type: 'file_access_token',
            },
          ],
        },
      },
    },
  ],
};
