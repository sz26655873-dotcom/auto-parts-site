/**
 * Reusable multi-language text field with tab-based language switching.
 *
 * Used throughout the admin forms for editing LocalizedString fields
 * (product names, descriptions, company text, etc.). Displays a row of
 * language tabs (EN / 中文 / Русский / العربية / 한국어) and a text field
 * that edits the currently selected language.
 *
 * Includes a "one-click translate" button that translates the active
 * language's text into all other languages using the MyMemory API.
 */

import { useState, type ChangeEvent } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import type { LocalizedString } from '../data/products';
import {
  languageNames,
  type Language,
} from '../i18n/translations';
import { translateLocalizedString } from '../utils/translator';

/** All supported languages in canonical tab order. */
const ALL_LANGS: Language[] = ['en', 'zh', 'ru', 'ar', 'ko'];

interface LocalizedTextFieldProps {
  /** Label displayed above the tabs. */
  label: string;
  /** The localized string value to edit. */
  value: LocalizedString;
  /** Callback invoked whenever any language value changes. */
  onChange: (value: LocalizedString) => void;
  /** Whether to render a multi-line text area. */
  multiline?: boolean;
  /** Number of rows when multiline is true. */
  rows?: number;
  /** Whether the field is required. */
  required?: boolean;
  /** Optional helper text. */
  helperText?: string;
}

/**
 * Renders a label, language tabs, and a text field for the active language.
 * Switching tabs preserves all language values.
 *
 * A "one-click translate" button next to the label translates the active
 * language's text into all other supported languages.
 */
function LocalizedTextField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  required = false,
  helperText,
}: LocalizedTextFieldProps): JSX.Element {
  const [activeLang, setActiveLang] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const handleTabChange = (_event: unknown, newValue: Language): void => {
    setActiveLang(newValue);
  };

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    onChange({ ...value, [activeLang]: event.target.value });
  };

  /**
   * Translates the active language's text into all other languages.
   * Updates the value via onChange on success, or shows an error Alert on failure.
   */
  const handleTranslate = async (): Promise<void> => {
    const sourceText = value[activeLang]?.trim() ?? '';
    if (sourceText === '') {
      return;
    }

    setIsTranslating(true);
    setTranslateError(null);

    try {
      const translated = await translateLocalizedString(value, activeLang);
      onChange({ ...value, ...translated });
    } catch (error) {
      setTranslateError(
        error instanceof Error
          ? error.message
          : 'Translation failed. Please try again.',
      );
    } finally {
      setIsTranslating(false);
    }
  };

  /** Whether the active language's text is empty (disables the translate button). */
  const isSourceEmpty = (value[activeLang] ?? '').trim() === '';

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 0.5,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
          {required && (
            <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
          )}
        </Typography>
        <Tooltip
          title={`Translate from ${languageNames[activeLang]} to all other languages`}
        >
          <span>
            <Button
              size="small"
              variant="outlined"
              disabled={isTranslating || isSourceEmpty}
              onClick={handleTranslate}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                py: 0.25,
                minWidth: 'auto',
              }}
            >
              {isTranslating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                '\u{1F310} \u4E00\u952E\u7FFB\u8BD1'
              )}
            </Button>
          </span>
        </Tooltip>
      </Box>
      {translateError && (
        <Alert
          severity="error"
          sx={{ mb: 1 }}
          onClose={() => setTranslateError(null)}
        >
          {translateError}
        </Alert>
      )}
      <Tabs
        value={activeLang}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          borderBottom: 1,
          borderColor: 'divider',
          mb: 1,
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontSize: '0.8rem',
            fontWeight: 500,
            minWidth: 'auto',
            px: 1.5,
          },
        }}
      >
        {ALL_LANGS.map((lang) => (
          <Tab
            key={lang}
            value={lang}
            label={languageNames[lang]}
          />
        ))}
      </Tabs>
      <TextField
        fullWidth
        multiline={multiline}
        rows={multiline ? rows : undefined}
        value={value[activeLang]}
        onChange={handleTextChange}
        variant="outlined"
        size="small"
        helperText={helperText}
        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
      />
    </Box>
  );
}

export default LocalizedTextField;
