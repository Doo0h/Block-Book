import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class RegisterStudentDto {
  @IsEthereumAddress()
  studentAddress: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;
}
