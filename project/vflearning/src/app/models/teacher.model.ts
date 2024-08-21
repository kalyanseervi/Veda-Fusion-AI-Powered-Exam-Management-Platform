import { User } from './user.model';

export interface Teacher extends User {
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  teachingSubjects: string[];
  teachingInClass: string[];
  qualification: string;
  experience: string;
}
