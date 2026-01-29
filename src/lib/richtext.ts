const ALLOWED_TAGS = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li']);

export function sanitizeNoteHtml(input: string): string {
  if (!input) return '';
  let clean = input;
  clean = clean.replace(/<\/(script|style)>/gi, '</removed>');
  clean = clean.replace(/<(script|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, '');
  clean = clean.replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '');
  clean = clean.replace(/on[a-z]+\s*=\s*'[^']*'/gi, '');
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (_match, slash, tag) => {
    const lower = String(tag).toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) {
      return '';
    }
    if (lower === 'br') {
      return '<br />';
    }
    return `<${slash ? '/' : ''}${lower}>`;
  });
  return clean;
}

export function extractPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>(\r\n)*/gi, '\n')
    .replace(/<\/(p|div)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
