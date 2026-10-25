# 프로젝트 구조 규칙

구조와 의존 방향은 `.claude/rules/architecture.md`(경로 조건부 로드), 설명은 `docs/architecture/feature-first.md`.

```
src/        app/ core/ features/ shared/
assets/     # 이미지, 아이콘(assets/icons/*.xml: Android 벡터 드로어블)
docs/       # SDK 58 요약, 아키텍처, 마이그레이션, 검토 기록
.claude/    # rules, agents, skills, hooks, settings
```

- 새 디렉터리는 필요할 때만 만든다.
- 디자인 토큰(색, 간격, 타이포)은 theme을 통해 쓴다. 화면에 색/간격 하드코딩 금지 (`expo-design-system` skill 참고). 예외: 특정 컴포넌트의 고정 시각 사양(예: 플로팅 탭바 팔레트)은 해당 컴포넌트 옆 `config/`에 모은다.
- 설정 값(스킴, 아이콘, 플러그인)은 `app.json`에서 관리한다.
- 대상 플랫폼은 iOS/Android뿐이다 (`app.json`의 `platforms`). web용 코드/의존성(`react-native-web`, `react-dom`, `*.web.tsx`)을 추가하지 않는다. 웹 화면은 별도 React 프로젝트로 만들고 이 앱에서는 WebView로 연다 (`.claude/rules/webview.md`).
