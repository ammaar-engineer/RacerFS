export const confirmUploadDocs = {
  summary: 'Confirm file upload',
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
      description: 'File uploaded successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'File uploaded successfully',
        errorCode: '',
        data: {
          file: {
            id: 1,
            name: 'photo.png',
            size: 204800,
            file_type: '.png',
            file_key: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
        },
      },
    },
  ],
};
