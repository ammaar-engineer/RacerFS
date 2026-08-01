export const storageInfoDocs = {
  summary: 'Get storage information',
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
      description: 'Storage info retrieved successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'Storage info retrieved successfully',
        errorCode: '',
        data: {
          total_storage: 5368709120,
          used_storage: 1048576,
          available_storage: 5367660544,
        },
      },
    },
  ],
};
