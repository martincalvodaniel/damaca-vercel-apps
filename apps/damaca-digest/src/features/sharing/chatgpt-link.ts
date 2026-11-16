export const chatGptWebUrl = "https://chatgpt.com/"

export const chatGptUniversalUrl = `${chatGptWebUrl}#native`

export function chatGptOpenUrl(userAgent: string) {
  if (/Android/i.test(userAgent)) {
    return `intent://chatgpt.com/#Intent;scheme=https;package=com.openai.chatgpt;S.browser_fallback_url=${encodeURIComponent(chatGptWebUrl)};end`
  }
  if (/iPhone|iPad|iPod/i.test(userAgent)) return chatGptUniversalUrl
  return chatGptWebUrl
}
