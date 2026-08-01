export const setVisibilityDocs = {
  summary: 'Set file visibility (public/private)',
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
      description: 'File visibility updated',
      example: {
        success: true,
        statusCode: 200,
        message: 'File visibility updated',
        errorCode: '',
        data: {
          file: {
            id: 1,
            name: 'photo.png',
            is_public: true,
          },
        },
      },
    },
  ],
};
