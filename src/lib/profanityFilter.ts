/**
 * IQFood Profanity & URL Link Filter Engine
 * Automatically detects and blocks links, URLs, and inappropriate words.
 */

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(com|net|org|iq|info|biz|site|online|app|me|co|io|dev)[^\s]*|t\.me\/[^\s]+|wa\.me\/[^\s]+)/gi;

const PROFANITY_DICTIONARY = [
'طايح حظ',
'طايح الحظ',
'سافل',
'كلب',
'حقير',
'قذر',
'غبي',
'حمار',
'حيوان',
'انعل',
'تفه',
'خرا',
'زفت',
'مزين',
'منحط',
'فاشل جذا',
'سرقة',
'احتيال',
'نصابين',
'كذابين',
'fuck',
'shit',
'bitch',
'asshole',
'bastard',
'scam',
];

export interface ContentCheckResult {
 hasProfanity: boolean;
 hasUrl: boolean;
 foundWords: string[];
 cleanText: string;
}

export function detectUrl(text: string): boolean {
 if (!text) return false;
 return URL_REGEX.test(text);
}

export function checkContent(text: string): ContentCheckResult {
 if (!text) {
 return { hasProfanity: false, hasUrl: false, foundWords: [], cleanText: text };
 }

 let cleanText = text;
 const foundWords: string[] = [];
 const hasUrl = URL_REGEX.test(cleanText);

 // Replace any URLs with blocked text
 if (hasUrl) {
 cleanText = cleanText.replace(URL_REGEX,'[رابط محظور ]');
 }

 PROFANITY_DICTIONARY.forEach((word) => {
 const regex = new RegExp(word,'gi');
 if (regex.test(cleanText)) {
 foundWords.push(word);
 const stars =''.repeat(word.length);
 cleanText = cleanText.replace(regex, stars);
 }
 });

 return {
 hasProfanity: foundWords.length > 0,
 hasUrl,
 foundWords,
 cleanText,
 };
}

export function checkProfanity(text: string) {
 return checkContent(text);
}
