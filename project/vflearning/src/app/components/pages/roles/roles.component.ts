import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../../services/role/role.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
  roleForm: FormGroup;
  roles: any[] = [];

  constructor(private fb: FormBuilder, private roleService: RoleService) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe((roles) => {
      this.roles = roles;
    });
  }

  addRole() {
    if (this.roleForm.valid) {
      this.roleService.addRole(this.roleForm.value).subscribe(() => {
        this.loadRoles();
        this.roleForm.reset();
      });
    }
  }
}
