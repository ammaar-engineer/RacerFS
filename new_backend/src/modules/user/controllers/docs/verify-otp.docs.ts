export const verifyOtpDocs = {
  summary: 'Verify OTP and get authentication token',
  bodyType: null, // Will be set in controller
  responses: [{
    status: 201,
    description: 'Authentication successful',
    example: {
      success: true,
      statusCode: 200,
      message: 'login successfully',
      errorCode: '',
      data: { token: 'jwt-token-here' },
    },
  }],
};
