import { t as tMacro } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import * as Setting from '../components/Setting';
import CheckboxSetting from '../components/SettingCheckbox';
import type { Config, DefaultView } from '../generated/typings';
import useInvalidate, { useInvalidateCallback } from '../hooks/useInvalidate';
import { themes } from '../lib/themes';
import SettingsAPI from '../stores/SettingsAPI';
import { ALL_LANGUAGES } from '../translations/languages';

export const Route = createFileRoute('/settings/ui')({
  component: ViewSettingsUI,
});

function ViewSettingsUI() {
  const { config } = useLoaderData({ from: '/settings' });
  const { t } = useLingui();

  const invalidate = useInvalidate();

  return (
    <>
      <Setting.Section>
        <Setting.Select
          label={t`Theme`}
          description={t`Change the appearance of the interface`}
          value={config.theme}
          onChange={(e) =>
            SettingsAPI.setTheme(e.currentTarget.value).then(invalidate)
          }
        >
          <option value="__system">{t`System (default)`}</option>
          {Object.values(themes).map((theme) => {
            return (
              <option key={theme._id} value={theme._id}>
                {getTranslatedThemeName(theme.name)}
              </option>
            );
          })}
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <Setting.Select
          label={t`Language`}
          value={config.language}
          onChange={(e) => {
            SettingsAPI.setLanguage(e.target.value).then(invalidate);
          }}
        >
          {ALL_LANGUAGES.map((language) => {
            return (
              <option key={language.code} value={language.code}>
                {language.label}
                {language.englishLabel && ` (${language.englishLabel})`}
              </option>
            );
          })}
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <Setting.Select
          label={t`Tracks density`}
          description={t`Change the tracks spacing`}
          value={config.track_view_density}
          onChange={(e) =>
            SettingsAPI.setTracksDensity(
              e.currentTarget.value as Config['track_view_density'],
            ).then(invalidate)
          }
        >
          <option value="normal">
            <Trans>Normal (default)</Trans>
          </option>
          <option value="compact">
            <Trans>Compact</Trans>
          </option>
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <Setting.Select
          label={t`Default view`}
          value={config.default_view}
          description={t`Change the default view when starting the application`}
          onChange={(e) =>
            SettingsAPI.setDefaultView(
              e.currentTarget.value as DefaultView,
            ).then(invalidate)
          }
        >
          <option value="Library">
            <Trans>Library (default)</Trans>
          </option>
          <option value="Playlists">
            <Trans>Playlists</Trans>
          </option>
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          slug="native-notifications"
          title={t`Display Notifications`}
          description={t`Send notifications when the playing track changes`}
          value={config.notifications}
          onChange={useInvalidateCallback(
            SettingsAPI.toggleDisplayNotifications,
          )}
        />
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          slug="sleepmode"
          title={t`Sleep mode blocker`}
          description={t`Prevent the computer from going into sleep mode when playing`}
          value={config.sleepblocker}
          onChange={useInvalidateCallback(SettingsAPI.toggleSleepBlocker)}
        />
      </Setting.Section>
    </>
  );
}

/**
 * Get the theme name in the current language
 */
export function getTranslatedThemeName(themeName: string) {
  switch (themeName) {
    case 'Light':
      return tMacro`Light`;
    case 'Dark':
      return tMacro`Dark`;
  }

  return themeName;
}
