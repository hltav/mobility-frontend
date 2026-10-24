import { Component, input } from '@angular/core';

const paths = {
  settings:
    'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z',
  shield: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z',
  info: 'M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  expand: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',
  external: 'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',
  close: 'm6 6 12 12M6 18 18 6',
  filter: 'M3 4h18l-7 8v8l-4-2v-6Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  compass: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-6-3-2 4-4 2 2-4Z',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M5 21v-2a7 7 0 0 1 14 0v2',
  navigation: 'm21 3-6 18-4-8-8-4Z',
  'bus-side':
    'M3 6h15a3 3 0 0 1 3 3v8H3ZM3 11h18M8 6v5m6-5v5M6 17a2 2 0 1 0 4 0m5 0a2 2 0 1 0 4 0M6 14h1m10 0h1',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
  bus: 'M5 17V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v11H5Zm0-7h14M8 14h.01M16 14h.01M7 17v3M17 17v3M8 6h8',
  locate:
    'M12 2v3M12 19v3M2 12h3M19 12h3M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z',
  monitor: 'M3 3h18v13H3ZM8 21h8m-4-5v5',
  logout: 'M9 3H4v18h5m5-14 5 5-5 5M8 12h13',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  route:
    'M6 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm12 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM9 6h7a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8',
} as const;
export type IconName = keyof typeof paths;

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path [attr.d]="paths[name()]" />
  </svg>`,
  styles: [
    ':host{display:inline-flex;width:var(--icon-size,1.25rem);height:var(--icon-size,1.25rem);flex-shrink:0}svg{width:100%;height:100%}',
  ],
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly paths = paths;
}
