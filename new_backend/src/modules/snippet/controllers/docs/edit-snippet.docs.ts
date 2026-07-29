export const editSnippetDocs = {
  summary: 'Edit a snippet command',
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
      description: 'Snippet updated successfully',
      example: {
        success: true,
        statusCode: 200,
        message: "Snippet 'gs' updated successfully",
        errorCode: '',
        data: {
          snippet: {
            id: 1,
            alias: 'gs',
            description: 'Shows git status',
            command: 'git status --short',
            user_id: 1,
            created_at: '2026-01-01T00:00:00.000Z',
          },
        },
      },
    },
  ],
};
