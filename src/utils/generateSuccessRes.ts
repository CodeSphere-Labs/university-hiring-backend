export const generateSuccessResponse = (message: string = 'Success') => ({
  statusCode: 200,
  message,
});
