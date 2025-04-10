import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OpportunityResponsesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data) return null;

        return {
          data: data.data.map((response) => {
            return {
              id: response.id,
              coverLetter: response.coverLetter,
              status: response.status,
              student: {
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
          meta: data.meta,
        };
      }),
    );
  }
}
