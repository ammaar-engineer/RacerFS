export const listSnippetsDocs = {
  summary: 'Get snippet list',
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
      description: 'Snippet list retrieved successfully',
      example: {
        success: true,
        statusCode: 200,
        message: 'Snippet list retrieved successfully',
        errorCode: '',
        data: {
          snippets: [
            {
              id: 1,
              alias: 'gs',
              description: 'Shows git status',
              command: 'git status',
              user_id: 1,
              created_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      },
    },
  ],
};
