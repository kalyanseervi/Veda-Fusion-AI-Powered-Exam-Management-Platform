import { User } from './user.model';

export interface Student extends User {
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pinCode: string;
  streamClass: string;
  subjects: string[];
  hobby: string;
  schoolId: string;
}
