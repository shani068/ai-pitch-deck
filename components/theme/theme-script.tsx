import { THEME_SCRIPT } from "./theme";

/**
 * Sets the colour scheme class before first paint. This is the app's only
 * `dangerouslySetInnerHTML`: the content is the constant `THEME_SCRIPT` with no user data, and the
 * CSP already allows inline scripts. It cannot be an effect, which would run after paint.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
