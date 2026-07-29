export const createSnippetDocs = {
  summary: 'Create a new snippet',
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
      description: 'Snippet created successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'Snippet created successfully',
        errorCode: '',
        data: {
          snippet: {
            id: 1,
            alias: 'gs',
            description: 'Shows git status',
            command: 'git status',
            created_at: '2026-01-01T00:00:00.000Z',
          },
        },
      },
    },
  ],
};
