import React, { createContext, useContext } from 'react';

/**
 * ThemeContext — makes the active trust's theme available to every page
 * without each page individually calling useTheme().
 *
 * App.jsx sets CSS variables on :root every time appTheme changes.
 * Components can either:
 *   a) Use CSS variables in Tailwind / inline styles:  var(--brand-red), etc.
 *   b) Consume the raw theme object via useAppTheme() for dynamic inline styles.
 */
export const ThemeContext = createContext({
  primary:    '#C0241A',
  secondary:  '#2B2F7E',
  accent:     '#FDECEA',
  accentBg:   '#EAEBF8',
  navbarBg:   'rgba(234,235,248,0.88)',
  pageBg:     'linear-gradient(160deg,#fff5f5 0%,#ffffff 50%,#f0f1fb 100%)',
  homeLayout: ['gallery', 'quickActions', 'sponsors'],
  animations: { navbar: 'fadeSlideDown', cards: 'fadeUp', gallery: 'zoomIn' },
  customCss:  '',
  templateKey: 'mahila',
});

/** Hook — call this inside any page/component to get the live theme object. */
export const useAppTheme = () => useContext(ThemeContext);
