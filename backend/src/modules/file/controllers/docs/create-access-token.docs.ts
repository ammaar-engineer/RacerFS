export const createAccessTokenDocs = {
  summary: 'Create file access token',
  headers: [
    {
      name: 'authorization',
      description: 'JWT account token',
      required: true,
    },
  ],
  responses: [
    {
      status: 201,
      description: 'Access token created successfully',
      example: {
        success: true,
        statusCode: 201,
        message: 'Access token created successfully',
        errorCode: '',
        data: {
          token: {
            id: 1,
            token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            user_id: 42,
            type: 'file_access_token',
          },
        },
      },
    },
  ],
};
