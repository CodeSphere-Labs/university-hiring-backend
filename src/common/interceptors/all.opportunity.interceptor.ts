import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class AllOpportunityInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data: OpportunitiesResponse) => {
        try {
          const newData = Array.isArray(data.data) ? data.data : [data.data];

          return {
            data: newData.map((opportunity) => {
              const respondedUserIds = opportunity.responses.map(
                (response) => response.student.user.id,
              );
              return {
                ...opportunity,
                respondedUserIds,
                responses: opportunity.responses.map((response) => {
                  return {
                    id: response.id,
                    coverLetter: response.coverLetter,
                    student: {
                      id: response.student.user.id,
                      firstName: response.student.user.firstName,
                      lastName: response.student.user.lastName,
                      patronymic: response.student.user.patronymic,
                      resume: response.student.resume,
                      githubLink: response.student.githubLink,
                      projects: response.student.projects,
                      email: response.student.user.email,
                      avatarUrl: response.student.user.avatarUrl,
                      aboutMe: response.student.user.aboutMe,
                      telegramLink: response.student.user.telegramLink,
                      vkLink: response.student.user.vkLink,
                      role: response.student.user.role,
                      organization: response.student.user.organization,
                    },
                  };
                }),
              };
            }),
            meta: data.meta,
          };
        } catch {
          console.error('Error transforming data', data);
          return data;
        }
      }),
    );
  }
}

interface OpportunitiesResponse {
  data: {
    id: number;
    title: string;
    description: string;
    status: string;
    requiredSkills: ReqiredSkills[];
    organization: Organization;
    responses: Response[];
    respondedUserIds: number[];
  }[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

interface Response {
  id: number;
  coverLetter: string | null;
  student: {
    id: number;
    resume: string;
    githubLink: string;
    projects: Project[];
    user: Student;
  };
}

interface Student {
  id: number;
  userId: number;

  firstName: string;
  lastName: string;
  patronymic: string;
  email: string;
  avatarUrl: string;
  aboutMe: string;
  telegramLink: string;
  vkLink: string;
  role: string;
  organization: Organization;
}

interface Project {
  name: string;
  githubUrl: string;
  websiteUrl: string;
  description: string;
  technologies: string[];
}

interface Organization {
  id: number;
  name: string;
  type: string;
  email: string;
  logoUrl: string | null;
  websiteUrl: string;
  about: string;
}

interface ReqiredSkills {
  id: number;
  name: string;
  category: string;
  description: string;
}
