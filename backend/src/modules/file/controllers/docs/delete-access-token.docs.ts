export const deleteAccessTokenDocs = {
  summary: 'Delete file access token',
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
      description: 'Access token deleted successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'Access token deleted successfully',
        errorCode: '',
        data: null,
      },
    },
  ],
};
