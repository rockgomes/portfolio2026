// TODO(password protection): static pages cannot check a password on their own.
// Plan: a Netlify Edge Function on /project/* that reads the list of private
// slugs (generated at build time from `private: true`) and asks for a password
// before serving the page. Until that exists, private items are left out of
// listings and their pages are marked noindex, but they are NOT protected.
export const isPrivate = (data: { private?: boolean }) => data.private === true;
