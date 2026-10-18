/**
 * Easing curves for `motion` (JS) animations, matching the CSS tokens in globals.css.
 * Emil Kowalski's curves: strong ease-out for enter/exit and feedback, ease-in-out for things
 * moving on screen, and the iOS-like drawer curve for sheets.
 */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;
