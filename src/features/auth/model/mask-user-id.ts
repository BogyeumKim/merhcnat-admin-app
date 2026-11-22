/**
 * 서버의 계정 ID 마스킹 규칙(마스킹된 ID가 사용자가 입력한 것인지 앱이 판단하기 위함):
 * 6자 이상은 앞 3자와 뒤 2자, 4~5자는 앞 1자와 뒤 1자, 3자 이하는 앞 1자만 남긴다.
 */
export function maskUserId(userId: string): string {
  const id = userId.trim();
  if (id.length >= 6) return `${id.slice(0, 3)}${'*'.repeat(id.length - 5)}${id.slice(-2)}`;
  if (id.length >= 4) return `${id[0]}${'*'.repeat(id.length - 2)}${id.slice(-1)}`;
  return `${id.slice(0, 1)}${'*'.repeat(Math.max(id.length - 1, 0))}`;
}
