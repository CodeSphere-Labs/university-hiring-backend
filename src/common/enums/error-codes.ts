export const ErrorCodes = {
  // General HTTP errors
  code: {
    400: 'bad_request',
    404: 'not_found',
    409: 'already_exist',
  },
  FORBIDDEN: 'forbidden',

  // Authentication & Authorization
  INVALID_CREDENTIALS: 'invalid_credentials',
  TOKEN_EXPIRED: 'token_expired',
  INVALID_TOKEN: 'invalid_token',
  ACCOUNT_DISABLED: 'account_disabled',
  INVALID_ROLE: 'invalid_role',

  // User related
  USER_NOT_FOUND: 'user_not_found',
  USER_ALREADY_EXISTS: 'user_already_exists',
  USER_NOT_STUDENT: 'user_not_student',
  USER_NOT_STAFF: 'user_not_staff',
  USER_NOT_UNIVERSITY_STAFF: 'user_not_university_staff',
  STUDENT_PROFILE_NOT_FOUND: 'student_profile_not_found',

  // Invitation related
  USER_ALREADY_INVITED: 'user_already_invited',
  INVALID_INVITATION: 'invalid_invitation',
  INVINTATION_USED: 'invintation_used',
  INVINTATION_EXPIRED: 'invintation_expired',
  INVITATION_NOT_FOUND: 'invitation_not_found',

  // Organization related
  ORGANIZATION_NOT_FOUND: 'organization_not_found',
  YOUR_ORGANIZATION_NOT_FOUND: 'your_organization_not_found',
  ORGANIZATION_ALREADY_EXISTS: 'organization_already_exists',
  ORGANIZATION_DISABLED: 'organization_disabled',

  // Group related
  GROUP_REQUIRED: 'group_is_required',
  GROUP_NOT_FOUND: 'group_not_found',
  GROUP_ALREADY_EXISTS: 'group_already_exists',
  STUDENT_ALREADY_IN_GROUP: 'student_already_in_group',
  STUDENT_NOT_IN_GROUP: 'student_not_in_group',

  // Opportunity related
  OPPORTUNITY_NOT_FOUND: 'opportunity_not_found',
  OPPORTUNITY_ALREADY_EXISTS: 'opportunity_already_exists',
  ALREADY_RESPONDED: 'already_responded',
  RESPONSE_NOT_FOUND: 'response_not_found',

  // Project related
  PROJECT_NOT_FOUND: 'project_not_found',
  PROJECT_ALREADY_EXISTS: 'project_already_exists',
} as const;
