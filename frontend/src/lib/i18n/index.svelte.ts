import { browser } from '$app/environment';
import { zhTW } from '$lib/i18n/locales/zh-TW';
import { en } from '$lib/i18n/locales/en';

export type Locale = 'zh-TW' | 'en';

const dictionaries = {
  'zh-TW': zhTW,
  'en': en
};

class I18nStore {
  locale = $state<Locale>('zh-TW');

  constructor() {
    if (browser) {
      const storedLocale = localStorage.getItem('tk_locale') as Locale;
      if (storedLocale && dictionaries[storedLocale]) {
        this.locale = storedLocale;
      }

      $effect.root(() => {
        $effect(() => {
          localStorage.setItem('tk_locale', this.locale);
        });
      });
    }
  }

  // 翻譯函數，支援巢狀 Key (例如: common.name)
  t(key: string, vars: Record<string, any> = {}): string {
    const dict = dictionaries[this.locale];
    const keys = key.split('.');
    let result: any = dict;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // 找不到 Key 時回傳 Key 原名協助除錯
      }
    }

    let value = String(result);
    Object.keys(vars).forEach(v => {
      value = value.replace(`{${v}}`, vars[v]);
    });

    return value;
  }
}

export const i18n = new I18nStore();
export const t = (key: string, vars?: Record<string, any>) => i18n.t(key, vars);
