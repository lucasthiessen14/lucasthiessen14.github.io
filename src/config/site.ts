/** How the hero portrait is rendered. */
export type ProfileDisplay = 'photo' | 'initials' | 'none';

export const siteConfig = {
  /**
   * `photo` — shows profileImage.src (replace with ≥680×680px for best quality).
   * `initials` — styled LT monogram instead of a photo.
   * `none` — centered text-only hero with no portrait.
   */
  profileDisplay: 'none' as ProfileDisplay,
  profileImage: {
    src: '/images/profile_pic.jpg',
    width: 200,
    height: 207,
  },
} as const;
