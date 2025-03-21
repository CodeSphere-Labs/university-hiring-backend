import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class AllGroupsInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        try {
          const newData = Array.isArray(data) ? data : [data];
          return newData.map((group) => {
            return {
              ...group,
              students: group.students.map((student) => {
                return {
                  id: student.user.id,
                  resume: student.resume,
                  githubLink: student.githubLink,
                  projects: student.projects,
                  firstName: student.user.firstName,
                  lastName: student.user.lastName,
                  patronymic: student.user.patronymic,
                  email: student.user.email,
                  avatarUrl: student.user.avatarUrl,
                  aboutMe: student.user.aboutMe,
                  telegramLink: student.user.telegramLink,
                  vkLink: student.user.vkLink,
                  role: student.user.role,
                  organization: student.user.organization,
                };
              }),
            };
          });
        } catch {
          return data;
        }
      }),
    );
  }
}
