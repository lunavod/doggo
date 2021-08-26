import { IsString } from 'class-validator'

export default class Config {
  @IsString()
  doggosDir: string
}
