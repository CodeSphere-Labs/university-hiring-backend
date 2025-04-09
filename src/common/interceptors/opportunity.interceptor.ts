import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class OpportunityInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data: any) => {
        try {
          const respondedUserIds = data.responses.map(
            (response) => response.student.user.id,
          );
          return {
            ...data,
            respondedUserIds,
            responses: data.responses.map((response) => {
              return {
                id: response.id,
                coverLetter: response.coverLetter,
                user: {
                  id: response.student.user.id,
                  firstName: response.student.user.firstName,
                  lastName: response.student.user.lastName,
                  patronymic: response.student.user.patronymic,
                  email: response.student.user.email,
                  avatarUrl: response.student.user.avatarUrl,
                  aboutMe: response.student.user.aboutMe,
                  telegramLink: response.student.user.telegramLink,
                  vkLink: response.student.user.vkLink,
                  role: response.student.user.role,
                  organization: response.student.user.organization,
                  studentProfile: {
                    ...response.student.user.studentProfile,
                    skills: response.student.user.studentProfile.skills?.map(
                      (skill) => skill.name,
                    ),
                  },
                },
              };
            }),
          };
        } catch {
          console.error('Error transforming data', data);
          return data;
        }
      }),
    );
  }
}
