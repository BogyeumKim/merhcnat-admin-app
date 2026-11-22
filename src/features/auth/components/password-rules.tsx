import { Column, Row } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import type { PasswordRules, RuleState } from '../model/password-rules';

const DOT = 18;
const MARK: Record<RuleState, string> = { ok: '✓', wait: '·', fail: '✕' };

function Rule({ state, text }: { state: RuleState; text: string }) {
  const colors = useNativeColors();
  const fill = state === 'ok' ? colors.successSurface : state === 'fail' ? colors.dangerSurface : colors.tonal;

  return (
    <Row alignment="center" spacing={spacing.sm}>
      <Column alignment="center" style={{ width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: fill }}>
        <NativeText variant="caption">{MARK[state]}</NativeText>
      </Column>
      <NativeText variant="caption" tone={state === 'fail' ? 'danger' : 'secondary'}>
        {text}
      </NativeText>
    </Row>
  );
}

/** 새 비밀번호 입력란 아래의 규칙 목록. 충족하면 초록, 어기면 빨강, 아직 판단할 수 없으면 회색. 아이디를 몰라 판단할 수 없는 "아이디 포함" 줄은 숨긴다. */
export function PasswordRulesList({ rules }: { rules: PasswordRules }) {
  const { t } = useTranslation();

  return (
    <Column spacing={spacing.sm - spacing.xxs} style={{ width: '100%' }}>
      <Rule state={rules.length} text={t('auth.passwordChange.ruleLength')} />
      <Rule
        state={rules.charset}
        text={rules.invalidChars ? t('auth.passwordChange.ruleCharsetInvalid') : t('auth.passwordChange.ruleCharset')}
      />
      {rules.userId ? <Rule state={rules.userId} text={t('auth.passwordChange.ruleUserId')} /> : null}
      <Rule state={rules.reuse} text={t('auth.passwordChange.ruleReuse')} />
    </Column>
  );
}
