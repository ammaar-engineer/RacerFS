export const registerDocs = {
  summary: 'Request OTP for registration',
  bodyType: null, // Will be set in controller
  responses: [{
    status: 201,
    description: 'OTP sent to email',
    example: {
      success: true,
      statusCode: 200,
      message: 'OTP has been sent to your email',
      errorCode: '',
      data: { sessionId: 'uuid-session-id' },
    },
  }],
};
