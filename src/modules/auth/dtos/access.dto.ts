import { ApiProperty } from '@nestjs/swagger';

export class UserDTO {
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: string;

  @ApiProperty({ description: 'The username of the user' })
  user_name: string;

  @ApiProperty({ description: 'The email address of the user' })
  user_email: string;

  @ApiProperty({ description: 'The date and time when the user was created' })
  created_at: string;

  @ApiProperty({ description: 'The date and time when the user was updated  ' })
  updated_at: NullableValue<string>;

  @ApiProperty({ description: 'The phone number of the user', nullable: true })
  phone_number: NullableValue<string>;

  @ApiProperty()
  user_cpf_number: string;

  @ApiProperty()
  date_of_birth: string;
}

export class AccessDTO {
  @ApiProperty({ type: UserDTO, description: 'The user object' })
  user: UserDTO;

  @ApiProperty({ description: 'The access token' })
  access_token: string;
}
