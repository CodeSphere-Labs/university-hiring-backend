import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AllGroupsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((group) => ({
            ...group,
            students: group.students.map((student) => ({
              id: student.user.id,
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              patronymic: student.user.patronymic,
              email: student.user.email,
              avatarUrl: student.user.avatarUrl,
              aboutMe: student.user.aboutMe,
              telegramLink: student.user.telegramLink,
              vkLink: student.user.vkLink,
              role: student.user.role,
              createdAt: student.user.createdAt,
              updatedAt: student.user.updatedAt,
              organization: student.user.organization,
              studentProfile: {
                ...student.user.studentProfile,
                skills: student.user.studentProfile.skills?.map(
                  (skill) => skill.name,
                ),
              },
            })),
          }));
        } else {
          return {
            data: {
              id: data.id,
              name: data.name,
              students: data.students?.map((student) => ({
                id: student.user.id,
                firstName: student.user.firstName,
                lastName: student.user.lastName,
                patronymic: student.user.patronymic,
                email: student.user.email,
                avatarUrl: student.user.avatarUrl,
                aboutMe: student.user.aboutMe,
                telegramLink: student.user.telegramLink,
                vkLink: student.user.vkLink,
                role: student.user.role,
                createdAt: student.user.createdAt,
                updatedAt: student.user.updatedAt,
                organization: student.user.organization,
                studentProfile: {
                  ...student.user.studentProfile,
                  skills: student.user.studentProfile.skills?.map(
                    (skill) => skill.name,
                  ),
                },
              })),
            },
            meta: data.meta,
          };
        }
      }),
    );
  }
}
