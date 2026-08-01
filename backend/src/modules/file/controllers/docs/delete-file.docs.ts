export const deleteFileDocs = {
  summary: 'Delete file',
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
      description: 'File deleted successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'File deleted successfully',
        errorCode: '',
        data: null,
      },
    },
  ],
};
