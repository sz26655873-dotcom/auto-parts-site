/**
 * WhatsApp deep-link utility functions.
 * Builds wa.me URLs with pre-filled messages for lead generation.
 * Messages are localized into 5 languages.
 */

import type { Language } from '../i18n/translations';

/** Placeholder WhatsApp phone number (international format without +). */
export const WHATSAPP_PHONE = '8613800138000';

/** Default pre-filled message for generic inquiries (English fallback). */
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hello, I'm interested in your auto parts products. Can you provide more details?";

/** Localized generic inquiry messages for each supported language. */
const WHATSAPP_MESSAGES: Record<Language, string> = {
  en: "Hello, I'm interested in your auto parts products. Can you provide more details?",
  zh: '您好，我对贵公司的汽车配件产品很感兴趣，能否提供更多详细信息？',
  ru: 'Здравствуйте, меня интересуют ваши автозапчасти. Не могли бы вы предоставить дополнительную информацию?',
  ar: 'مرحباً، أنا مهتم بمنتجات قطع غيار السيارات لديكم. هل يمكنكم تقديم مزيد من التفاصيل؟',
  ko: '안녕하세요, 귀사의 자동차 부품 제품에 관심이 있습니다. 자세한 정보를 제공해 주시겠습니까?',
};

/** Localized product inquiry message templates. Placeholders: {product}, {model}. */
const WHATSAPP_PRODUCT_MESSAGES: Record<Language, string> = {
  en: "Hello, I'm interested in the following auto part:\n\nProduct: {product}\nModel: {model}\n\nCan you provide more details and pricing?",
  zh: '您好，我对以下汽车配件感兴趣：\n\n产品：{product}\n型号：{model}\n\n能否提供更多详细信息和报价？',
  ru: 'Здравствуйте, меня интересует следующая автозапчасть:\n\nПродукт: {product}\nМодель: {model}\n\nНе могли бы вы предоставить подробности и цены?',
  ar: 'مرحباً، أنا مهتم بقطعة غيار السيارة التالية:\n\nالمنتج: {product}\nالموديل: {model}\n\nهل يمكنكم تقديم مزيد من التفاصيل والأسعار؟',
  ko: '안녕하세요, 다음 자동차 부품에 관심이 있습니다:\n\n제품: {product}\n모델: {model}\n\n자세한 정보와 가격을 제공해 주시겠습니까?',
};

/**
 * Builds a WhatsApp deep link with an optional pre-filled message.
 *
 * @param message - The pre-filled message text. Defaults to a generic English inquiry.
 * @param phone - The WhatsApp phone number (international format without +). Defaults to WHATSAPP_PHONE.
 * @returns A fully encoded wa.me URL.
 */
export function buildWhatsAppLink(message?: string, phone: string = WHATSAPP_PHONE): string {
  const text = encodeURIComponent(message ?? WHATSAPP_DEFAULT_MESSAGE);
  return `https://wa.me/${phone}?text=${text}`;
}

/**
 * Builds a WhatsApp deep link with a pre-filled message
 * localized to the specified language.
 *
 * @param lang - The target language for the message.
 * @param phone - Optional override for the WhatsApp phone number. Defaults to WHATSAPP_PHONE.
 * @returns A fully encoded wa.me URL with a localized generic inquiry.
 */
export function buildWhatsAppLinkForLang(lang: Language, phone?: string): string {
  return buildWhatsAppLink(WHATSAPP_MESSAGES[lang], phone);
}

/**
 * Builds a WhatsApp deep link pre-filled with a specific product inquiry.
 * The message is localized and includes the product name and model
 * for quick reference.
 *
 * @param productName - The name of the product the user is interested in.
 * @param model - The product model number.
 * @param lang - The target language for the message.
 * @param phone - Optional override for the WhatsApp phone number. Defaults to WHATSAPP_PHONE.
 * @returns A fully encoded wa.me URL with localized product details.
 */
export function buildProductInquiryLink(
  productName: string,
  model: string,
  lang: Language,
  phone?: string,
): string {
  const template = WHATSAPP_PRODUCT_MESSAGES[lang];
  const message = template
    .replace('{product}', productName)
    .replace('{model}', model);
  return buildWhatsAppLink(message, phone);
}
