import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  // Canonical site URL — used by Astro.site / Astro.url and drives
  // absolute URLs in Open-Graph / Twitter card meta tags so shared
  // links unfurl on LinkedIn, Slack, Twitter, etc.
  site: 'https://borbalaszilagyi.com',
  integrations: [react()],
});
