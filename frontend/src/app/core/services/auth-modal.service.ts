import { Injectable, signal } from '@angular/core';

export type AuthMode = 'login' | 'register' | 'forgot-password';

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  readonly isOpen = signal<boolean>(false);
  readonly mode = signal<AuthMode>('login');

  openLogin(): void {
    this.mode.set('login');
    this.isOpen.set(true);
  }

  openRegister(): void {
    this.mode.set('register');
    this.isOpen.set(true);
  }

  openForgotPassword(): void {
    this.mode.set('forgot-password');
    this.isOpen.set(true);
  }

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
