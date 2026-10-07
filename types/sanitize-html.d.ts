declare module "sanitize-html" {
  export type IOptions = {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedSchemes?: string[];
    transformTags?: Record<string, (tagName: string, attribs: Record<string, string>) => { tagName: string; attribs: Record<string, string> }>;
  };

  function sanitizeHtml(html: string, options?: IOptions): string;
  export default sanitizeHtml;
}
