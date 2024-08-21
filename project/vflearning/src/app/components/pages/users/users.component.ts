import { Component,OnInit  } from '@angular/core';

import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit{
  users: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }
}
