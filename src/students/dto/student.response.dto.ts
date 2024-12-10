import { Exclude } from 'class-transformer';
import { ResponseUserDto } from 'src/common/baseDto/responseUser.dto';

@Exclude()
export class ResponseStudentDto extends ResponseUserDto {}
