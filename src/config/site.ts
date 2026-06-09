/** How the hero portrait is rendered. Use `initials` until a sharp photo is available. */
export type ProfileDisplay = 'photo' | 'initials';

export const siteConfig = {
  /**
   * `photo` — shows profileImage.src (replace with ≥680×680px for best quality).
   * `initials` — styled LT monogram instead of a photo.
   */
  profileDisplay: 'photo' as ProfileDisplay,
  profileImage: {
    src: '/images/profile_pic.jpg',
    width: 200,
    height: 207,
  },
} as const;
