import { ApiSuccessResponseDto } from 'utils/dto/response.dto';

export const generateSuccessResponse = (
  message: string = 'Success',
): ApiSuccessResponseDto => ({
  statusCode: 200,
  message,
});
