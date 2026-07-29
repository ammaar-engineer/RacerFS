export const createTestAccountDocs = {
  summary: 'Create test account (for testing only)',
  headers: [{
    name: 'account-test',
    description: 'Email to use for the test account',
    required: true,
  }],
  responses: [{
    status: 200,
    description: 'Test account created',
    example: {
      success: true,
      statusCode: 200,
      message: 'Test account created',
      errorCode: '',
      data: { token: 'jwt-token-here' },
    },
  }],
};
