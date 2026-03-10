import { messages } from '$lib/i18n/messages';
import { z } from 'zod';

/**
 * 系統設定表單資料結構定義與驗證 Schema。
 * 將驗證邏輯與 UI 徹底分離，並套用 i18n 資源隔離原則。
 */
export const settingsSchema = z.object({
  // 折數驗證 (0~10)
  discount: z
    .number({
      message: messages.discount.invalidType,
    })
    .min(0, { message: messages.discount.min })
    .max(10, { message: messages.discount.max }),

  // 最低手續費驗證 (正整數)
  minFee: z
    .number({
      message: messages.minFee.invalidType,
    })
    .int({ message: messages.minFee.invalidType })
    .min(0, { message: messages.minFee.min }),

  // 預設階梯行數 (正整數)
  defaultLadderRows: z
    .number({
      message: '請輸入有效的數字',
    })
    .int({ message: '必須是整數' })
    .min(1, { message: '最少顯示 1 檔' })
    .max(50, { message: '最多顯示 50 檔，避免效能影響' }),

  // 布林值驗證
  isDayTrade: z.boolean(),
  isDarkMode: z.boolean(),
});

// 自動推導出對應的 TypeScript 型別
export type SettingsData = z.infer<typeof settingsSchema>;
