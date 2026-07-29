export const deleteAccountDocs = {
  summary: 'Delete user account',
  bodyType: null, // Will be set in controller
  headers: [{
    name: 'authorization',
    description: 'JWT account token',
    required: true,
  }],
  responses: [{
    status: 200,
    description: 'Account deleted successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Account has been deleted',
      errorCode: '',
      data: null,
    },
  }],
};
