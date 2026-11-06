import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
];
