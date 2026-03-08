/**
 * 集中管理與表單驗證相關的多國語言訊息資源 (i18n)。
 * 未來若需要擴增英（en-US）或日文（ja-JP），僅需擴展此物件。
 */
export const validationMessages = {
  zhTW: {
    discount: {
      required: '請輸入手續費折數',
      invalidType: '格式錯誤，請輸入有效數字',
      min: '折數不能小於 0',
      max: '折數不能大於 10',
    },
    minFee: {
      required: '請輸入單筆最低手續費',
      invalidType: '最低手續費必須為整數',
      min: '最低手續費不能小於 0',
    },
  },
};

// 預設匯出繁體中文，作為全局引用的便利捷徑
// 註：若後續導入 svelte-i18n，此處可替換為動態切換策略
export const messages = validationMessages.zhTW;
