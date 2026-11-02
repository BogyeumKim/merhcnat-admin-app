import { z } from 'zod';

/** Notice images come from the server: https only (a plain-http or `file:`/`data:` URL is rejected with the whole response). */
const imageSchema = z.object({
  url: z.url({ protocol: /^https$/ }),
  /** Pixel size of the original. Required so the layout reserves the right height before the image has loaded. */
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Text alternative for screen readers. A decorative image may omit it. */
  alt: z.string().optional(),
});

export const noticePopupSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().min(1),
  /** Plain text, may be empty. Never rendered as HTML/markup, so a notice cannot inject anything into the app. An image notice with an empty body is shown as the picture alone (its text is in the picture; `title` is then the accessibility label). */
  body: z.string().default(''),
  image: imageSchema.nullish(),
});

export const noticePopupsDataSchema = z.object({ notices: z.array(noticePopupSchema) });

export type NoticePopup = z.infer<typeof noticePopupSchema>;
