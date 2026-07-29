export const deleteSnippetDocs = {
  summary: 'Delete a snippet',
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
      description: 'Snippet deleted successfully',
      example: {
        success: true,
        statusCode: 200,
        message: "Snippet 'gs' deleted successfully",
        errorCode: '',
        data: null,
      },
    },
  ],
};
