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

/** The four rules under the new-password field. A rule is green when met, red when broken, gray while it cannot be told yet. */
export function PasswordRulesList({ rules }: { rules: PasswordRules }) {
  const { t } = useTranslation();

  return (
    <Column spacing={spacing.sm - 2} style={{ width: '100%' }}>
      <Rule state={rules.length} text={t('auth.passwordChange.ruleLength')} />
      <Rule state={rules.charset} text={t('auth.passwordChange.ruleCharset')} />
      <Rule state={rules.userId} text={t('auth.passwordChange.ruleUserId')} />
      <Rule state={rules.reuse} text={t('auth.passwordChange.ruleReuse')} />
    </Column>
  );
}
