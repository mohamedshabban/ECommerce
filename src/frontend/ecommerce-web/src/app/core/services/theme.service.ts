import { Injectable, signal, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private readonly THEME_KEY = 'theme';

  currentTheme = signal<Theme>(this.getStoredTheme());
  isDarkMode = signal(this.currentTheme() === 'dark');

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      localStorage.setItem(this.THEME_KEY, theme);
      this.isDarkMode.set(theme === 'dark');
    });
  }

  toggleTheme(): void {
    this.currentTheme.update(theme => theme === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    if (stored) return stored;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private applyTheme(theme: Theme): void {
    const body = this.document.body;
    if (theme === 'dark') {
      body.setAttribute('data-bs-theme', 'dark');
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.setAttribute('data-bs-theme', 'light');
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
  }
}
