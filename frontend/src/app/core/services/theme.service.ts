import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isDark = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      let savedTheme: string | null = null;
      try {
        if (typeof localStorage !== 'undefined') {
          savedTheme = localStorage.getItem('theme');
        }
      } catch {
        // LocalStorage access restricted or unavailable
      }

      if (savedTheme) {
        this.setDark(savedTheme === 'dark');
      } else {
        const prefersDark =
          typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : false;
        this.setDark(prefersDark);
      }
    }
  }

  toggleTheme(): void {
    this.setDark(!this.isDark());
  }

  setDark(isDark: boolean): void {
    this.isDark.set(isDark);
    if (isPlatformBrowser(this.platformId) && typeof document !== 'undefined') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
      } catch {
        // Ignore storage errors in restricted contexts
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
