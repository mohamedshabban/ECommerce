import { Injectable, signal, effect, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private document = inject(DOCUMENT);
  private translate = inject(TranslateService);
  private readonly LANGUAGE_KEY = 'language';

  currentLanguage = signal<Language>(this.getStoredLanguage());
  currentLang = computed(() => this.currentLanguage());
  isRtl = signal(this.currentLanguage() === 'ar');

  constructor() {
    this.translate.setDefaultLang('en');
    this.translate.addLangs(['en', 'ar']);

    effect(() => {
      const lang = this.currentLanguage();
      this.applyLanguage(lang);
      localStorage.setItem(this.LANGUAGE_KEY, lang);
      this.isRtl.set(lang === 'ar');
    });
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
  }

  toggleLanguage(): void {
    this.currentLanguage.update(lang => lang === 'en' ? 'ar' : 'en');
  }

  private getStoredLanguage(): Language {
    const stored = localStorage.getItem(this.LANGUAGE_KEY) as Language;
    if (stored && ['en', 'ar'].includes(stored)) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ar' ? 'ar' : 'en';
  }

  private applyLanguage(lang: Language): void {
    this.translate.use(lang);

    const html = this.document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    const body = this.document.body;
    if (lang === 'ar') {
      body.classList.add('rtl');
      body.classList.remove('ltr');
    } else {
      body.classList.add('ltr');
      body.classList.remove('rtl');
    }
  }
}
