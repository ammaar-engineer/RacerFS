export const buyStorageDocs = {
  summary: 'Add 100MB to user storage',
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
      description: 'Storage added successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'Added 100mb+ to storage',
        errorCode: '',
        data: null,
      },
    },
  ],
};
