/** 오류 표시는 앱 전체 공용(`shared/lib/use-error-presenter`)으로 옮겼다. 인증 훅의 import를 유지하기 위한 별칭. */
export { useErrorPresenter as useAuthErrorPresenter } from '@/shared/lib/use-error-presenter';
