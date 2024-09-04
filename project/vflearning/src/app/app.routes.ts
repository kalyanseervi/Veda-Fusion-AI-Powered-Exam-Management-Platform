import { Routes } from '@angular/router';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { RolesComponent } from './components/pages/roles/roles.component';
import { UsersComponent } from './components/pages/users/users.component';

import { AuthGuard } from './guards/auth/auth.guard';
import { AdminDashboardComponent } from './components/pages/admin-dashboard/admin-dashboard.component';
import { TeacherDashboardComponent } from './components/pages/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './components/pages/student-dashboard/student-dashboard.component';
import { RoleGuard } from './guards/role/role.guard';
import { UnauthorizedComponent } from './components/pages/unauthorized/unauthorized.component';
import { TeacherDetailsComponent } from './components/pages/admin-dashboard/teacher-details/teacher-details.component';
import { StudentDetailsManageComponent } from './components/pages/admin-dashboard/student-details/student-details.component';
import { HomepageComponent } from './components/pages/admin-dashboard/homepage/homepage.component';
import { SubjectManageComponent } from './components/pages/admin-dashboard/subject-manage/subject-manage.component';
import { ClassManageComponent } from './components/pages/admin-dashboard/class-manage/class-manage.component';
import { ClassCreateComponent } from './components/pages/admin-dashboard/class-manage/class-create/class-create.component';
import { ClassUpdateComponent } from './components/pages/admin-dashboard/class-manage/class-update/class-update.component';
import { SubjectCreateComponent } from './components/pages/admin-dashboard/subject-manage/subject-create/subject-create.component';
import { SubjectUpdateComponent } from './components/pages/admin-dashboard/subject-manage/subject-update/subject-update.component';
import { SubjectListComponent } from './components/pages/admin-dashboard/subject-manage/subject-list/subject-list.component';
import { ClassListComponent } from './components/pages/admin-dashboard/class-manage/class-list/class-list.component';
import { TeacherCreateComponent } from './components/pages/admin-dashboard/teacher-details/teacher-create/teacher-create.component';
import { ExamManageComponent } from './components/pages/teacher-dashboard/exam-manage/exam-manage.component';
import path from 'node:path';
import { StudentCreateComponent } from './components/pages/admin-dashboard/student-details/student-create/student-create.component';
import { StudentListComponent } from './components/pages/admin-dashboard/student-details/student-list/student-list.component';
import { TeacherUpdateComponent } from './components/pages/admin-dashboard/teacher-details/teacher-update/teacher-update.component';
import { StudentDetailsComponent } from './components/pages/teacher-dashboard/student-details/student-details.component';
import { ExamCreateComponent } from './components/pages/teacher-dashboard/exam-manage/exam-create/exam-create.component';
import { ExamListComponent } from './components/pages/teacher-dashboard/exam-manage/exam-list/exam-list.component';
import { ExamQuestionsManageComponent } from './components/pages/teacher-dashboard/exam-questions-manage/exam-questions-manage.component';
import { ExamQuestionsCreateComponent } from './components/pages/teacher-dashboard/exam-questions-manage/exam-questions-create/exam-questions-create.component';
import { ExamQuestionsListComponent } from './components/pages/teacher-dashboard/exam-questions-manage/exam-questions-list/exam-questions-list.component';
import { ExamQuestionsGenerateComponent } from './components/pages/teacher-dashboard/exam-questions-manage/exam-questions-generate/exam-questions-generate.component';
import { DashboardComponent } from './components/pages/student-dashboard/dashboard/dashboard.component';
import { StudentExamsComponent } from './components/pages/student-dashboard/student-exams/student-exams.component';
import { ExamAssignComponent } from './components/pages/teacher-dashboard/exam-manage/exam-assign/exam-assign.component';
import { ExamPortalComponent } from './components/pages/student-dashboard/exam-portal/exam-portal.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      { path: 'home-page', component: HomepageComponent },
      {
        path: 'teacher-details',
        component: TeacherDetailsComponent,
        children: [
          { path: 'teacher-create', component: TeacherCreateComponent },
          { path: 'teacher-update', component: TeacherUpdateComponent },
        ],
      },
      {
        path: 'student-details',
        component: StudentDetailsManageComponent,
        children: [
          { path: 'student-create', component: StudentCreateComponent },
          { path: 'student-list', component: StudentListComponent },
        ],
      },
      {
        path: 'subject-manage',
        component: SubjectManageComponent,
        children: [
          { path: 'subject-create', component: SubjectCreateComponent },
          { path: 'subject-update', component: SubjectUpdateComponent },
          { path: 'subject-list', component: SubjectListComponent },
        ],
      },
      {
        path: 'class-manage',
        component: ClassManageComponent,
        children: [
          { path: 'class-create', component: ClassCreateComponent },
          { path: 'class-update', component: ClassUpdateComponent },
          { path: 'class-list', component: ClassListComponent },
        ],
      },
    ],
  },
  {
    path: 'dashboard/teacher',
    component: TeacherDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'teacher' },
    children: [
      { path: 'student-details', component: StudentDetailsComponent },
      {
        path: 'exam-questions-manage/:selectedExamId',
        component: ExamQuestionsManageComponent,
        children: [
          {
            path: 'exam-questions-create/:selectedExamId',
            component: ExamQuestionsCreateComponent,
          },
          {
            path: 'exam-questions-list',
            component: ExamQuestionsListComponent,
          },
          {
            path: 'exam-questions-generate',
            component: ExamQuestionsGenerateComponent,
          },
        ],
      },
      {
        path: 'exam-manage',
        component: ExamManageComponent,
        children: [
          { path: 'exam-create', component: ExamCreateComponent },
          { path: 'exam-list', component: ExamListComponent },
          {
            path: 'exam-assign/:arg0',
            component: ExamAssignComponent,
          },
        ],
      },
    ],
  },
  {
    path: 'dashboard/student',
    component: StudentDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'student' },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'exams', component: StudentExamsComponent },
      { path: 'exam-portal/:examId', component: ExamPortalComponent },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'verify/:token', component: VerifyEmailComponent },
  { path: 'roles', component: RolesComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' },
];
