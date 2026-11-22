import { z } from 'zod';

/** 공지 이미지는 서버에서 온다: https만 허용(일반 http나 `file:`/`data:` URL은 응답 전체가 거부된다). */
const imageSchema = z.object({
  url: z.url({ protocol: /^https$/ }),
  /** 원본의 픽셀 크기. 이미지가 로드되기 전에 레이아웃이 알맞은 높이를 확보하려면 필수다. */
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** 스크린 리더용 대체 텍스트. 장식용 이미지는 생략할 수 있다. */
  alt: z.string().optional(),
});

export const noticePopupSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().min(1),
  /** 일반 텍스트이며 비어 있을 수 있다. HTML/마크업으로 렌더링하지 않아 공지가 앱에 무언가를 주입할 수 없다. 본문이 빈 이미지 공지는 이미지만 보여준다(텍스트는 이미지 안에 있으며 이때 `title`이 접근성 라벨이 된다). */
  body: z.string().default(''),
  image: imageSchema.nullish(),
});

export const noticePopupsDataSchema = z.object({ notices: z.array(noticePopupSchema) });

export type NoticePopup = z.infer<typeof noticePopupSchema>;
