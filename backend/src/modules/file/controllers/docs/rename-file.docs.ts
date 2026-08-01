export const renameFileDocs = {
  summary: 'Rename file',
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
      description: 'File renamed successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'File renamed successfully',
        errorCode: '',
        data: {
          file: {
            id: 1,
            name: 'new-filename.txt',
            size: 204800,
          },
        },
      },
    },
  ],
};
