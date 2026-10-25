---
name: create-feature
description: Scaffold a tab/domain feature module (api, queries, mutations, screen, route, i18n keys) following this project's feature-first structure and TanStack Query pattern. Use when adding a new tab or domain such as users or settings.
argument-hint: <feature-name in kebab-case> [--tab]
disable-model-invocation: true
allowed-tools: Read Write Edit Glob Grep Bash(npx tsc --noEmit*) Bash(npx eslint*)
---

# Create feature module: `$ARGUMENTS`

Read `.claude/rules/architecture.md`, `.claude/rules/data-fetching.md`, `.claude/rules/i18n.md` and `.claude/rules/bottom-tabs.md` first. They are the source of truth; this skill only sequences them.

## 0. Inputs and preconditions

1. Feature name = first word of `$ARGUMENTS` (kebab-case, plural domain like `users`). `--tab` means it is also a bottom tab.
2. Stop and report if `src/features/<name>/` already exists.
3. Check prerequisites. If one is missing, **ask the user** instead of inventing it:
   - `@tanstack/react-query` in `package.json` (install: `npx expo install @tanstack/react-query`) and a `QueryClientProvider` in `src/core/providers/` wired into `src/app/_layout.tsx`.
   - `src/shared/api/client.ts` (HTTP client). Its design (fetch vs axios, auth header, error type) is a user decision — see `docs/architecture/auth-jwt.md`.
4. Ask for the entity fields (name/type pairs) and the endpoint base path if not given.

## 1. Files to create (only what the feature needs; no empty folders)

```
src/features/<name>/
  model/types.ts                      # Entity type (and request/response shapes)
  api/<name>.ts                       # raw request functions, no React
  queries/query-keys.ts               # <name>Keys
  queries/use-<name>-data.ts          # list query (+ use-<name>-by-id-data.ts if needed)
  mutations/use-update-<name>.ts      # (callbacks?: UseMutationCallback)
  screens/<name>-screen.tsx           # route-level screen: four states
  index.ts                            # public API only
src/app/<route>.tsx                   # export { <Name>Screen as default } from '@/features/<name>'
```

Templates (replace `<Entity>`, `<name>`; keep imports grouped builtin → external → `@/` → relative, `import type` for types):

```ts
// queries/query-keys.ts
export const <name>Keys = {
  all: ['<name>'] as const,
  list: ['<name>', 'list'] as const,
  byId: (id: string) => ['<name>', 'byId', id] as const,
};
```

```ts
// queries/use-<name>-data.ts
import { useQuery } from '@tanstack/react-query';

import { fetch<Entity>List } from '../api/<name>';
import { <name>Keys } from './query-keys';

export function use<Entity>ListData() {
  return useQuery({
    queryKey: <name>Keys.list,
    queryFn: fetch<Entity>List,
    staleTime: 1000 * 60, // choose deliberately per query
  });
}
```

```ts
// mutations/use-update-<name>.ts — cache first, then the UI callback
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UseMutationCallback } from '@/shared/api/types';

import { update<Entity> } from '../api/<name>';
import { <name>Keys } from '../queries/query-keys';
import type { <Entity> } from '../model/types';

export function useUpdate<Entity>(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: update<Entity>,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: (updated) => {
      queryClient.setQueryData<<Entity>>(<name>Keys.byId(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: <name>Keys.list });
      callbacks?.onSuccess?.();
    },
    onError: (error) => callbacks?.onError?.(error),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
```

Screen rules (`expo-native-ui` / `expo-data-fetching` skills): a `ScrollView`/`FlatList` as the first child with `contentInsetAdjustmentBehavior="automatic"`; handle **loading, error (with retry), empty, content**; never show empty while the first load is pending; bottom padding from `useTabBarInset()` (`@/shared/lib/tab-bar`) when the screen sits under the tab bar; all text via `t()`; large lists use `FlatList`/`FlashList`, not `@expo/ui` `List`; UI built with `@expo/ui` first. Toast/navigation reactions are passed to mutation hooks as callbacks **from the screen/component**, never done inside the hook.

Never: non-null `!`, `any`, `eslint-disable`, importing another feature's internals (use its `index.ts`), importing `core` or `app` from a feature.

## 2. Tab wiring (only with `--tab`)

1. Add the entry to `TAB_ITEMS` in `src/core/navigation/app-tabs/config/tabs.ts` (`name` = route file name, `labelKey` = `tabs.<name>`, `sf` symbols).
2. Add `assets/icons/<name>.xml` (Material Symbols vector drawable) and the `TabIcons` entry in `android-floating-tab-bar.tsx`.
3. Route file under `src/app/(tabs)/<name>.tsx`.
4. If tabs depend on user type, gate with capabilities (`.claude/rules/user-types.md`).

## 3. i18n

Add `tabs.<name>` (when a tab) and the screen's keys to **both** `src/shared/i18n/locales/en.ts` and `ko.ts` (`ko` is typed against `en`, a missing key fails the typecheck).

## 4. Verify and report

Run `npx tsc --noEmit` and `npx eslint .`. Report: files created, what you could not run (no device run), and every decision you left to the user (API client, endpoints, entity fields). Do not claim the screen works until it has been run on a device or simulator.
