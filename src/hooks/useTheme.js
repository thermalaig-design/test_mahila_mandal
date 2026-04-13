import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const DEFAULT_THEME = {
  primary: '#C0241A',
  secondary: '#2B2F7E',
  accent: '#FDECEA',
  accentBg: '#EAEBF8',
  navbarBg: 'rgba(234,235,248,0.88)',
  pageBg: 'linear-gradient(160deg,#fff5f5 0%,#ffffff 50%,#f0f1fb 100%)',
  homeLayout: ['gallery', 'quickActions', 'sponsors'],
  animations: { navbar: 'fadeSlideDown', cards: 'fadeUp', gallery: 'zoomIn' },
  customCss: '',
};

export const useTheme = (trustId) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    if (!trustId) {
      setTheme(DEFAULT_THEME);
      setIsThemeLoading(false);
      return;
    }

    // Session cache — same trust pe dobara DB call nahi
    const cacheKey = `theme_cache_${trustId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setTheme(JSON.parse(cached));
        setIsThemeLoading(false);
        return;
      }
    } catch { }

    const load = async () => {
      setIsThemeLoading(true);
      try {
        const { data, error } = await supabase
          .from('Trust')
          .select(`
            theme_overrides,
            app_templates (
              primary_color,
              secondary_color,
              accent_color,
              accent_bg,
              navbar_bg,
              page_bg,
              home_layout,
              animations,
              custom_css,
              template_key
            )
          `)
          .eq('id', trustId)
          .single();

        if (error || !data?.app_templates) {
          // template nahi mila — default use karo
          setTheme(DEFAULT_THEME);
          setIsThemeLoading(false);
          return;
        }

        const tpl = data.app_templates;
        const overrides = data.theme_overrides || {};

        const resolved = {
          primary: overrides.primary_color || tpl.primary_color || DEFAULT_THEME.primary,
          secondary: overrides.secondary_color || tpl.secondary_color || DEFAULT_THEME.secondary,
          accent: overrides.accent_color || tpl.accent_color || DEFAULT_THEME.accent,
          accentBg: overrides.accent_bg || tpl.accent_bg || DEFAULT_THEME.accentBg,
          navbarBg: overrides.navbar_bg || tpl.navbar_bg || DEFAULT_THEME.navbarBg,
          pageBg: overrides.page_bg || tpl.page_bg || DEFAULT_THEME.pageBg,
          homeLayout: overrides.home_layout || tpl.home_layout || DEFAULT_THEME.homeLayout,
          animations: overrides.animations || tpl.animations || DEFAULT_THEME.animations,
          customCss: overrides.custom_css || tpl.custom_css || '',
          templateKey: tpl.template_key || 'mmpb',
        };

        console.log('🎨 [useTheme] Loaded from DB:', {
          trustId,
          template: tpl,
          overrides,
          resolved,
          source: 'SUPABASE',
        });
        sessionStorage.setItem(cacheKey, JSON.stringify(resolved));
        setTheme(resolved);
      } catch (err) {
        console.warn('useTheme failed:', err);
        setTheme(DEFAULT_THEME);
      } finally {
        setIsThemeLoading(false);
      }
    };

    load();
  }, [trustId]);
  const clearThemeCache = (tid) => {
    try {
      sessionStorage.removeItem(`theme_cache_${tid || trustId}`);
    } catch { }
  };

  return { theme, isThemeLoading, clearThemeCache };
};
