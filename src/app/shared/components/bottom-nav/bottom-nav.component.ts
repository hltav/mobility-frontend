import { Component, input } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `<nav class="bottom-nav" aria-label="Navegação principal">
    <div class="bottom-nav-inner">
      @for (item of items; track item.path) {
        <a
          [routerLink]="preview() ? '/preview' + item.path : item.path"
          routerLinkActive="is-active"
          ariaCurrentWhenActive="page"
          [routerLinkActiveOptions]="activeMatchOptions"
        >
          <span class="nav-icon"><app-icon [name]="item.icon" /></span>{{ item.label }}
        </a>
      }
    </div>
  </nav>`,
})
export class BottomNavComponent {
  readonly activeMatchOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };
  readonly preview = input(false);
  readonly items: { path: string; label: string; icon: IconName }[] = [
    { path: '/home', label: 'Início', icon: 'home' },
    { path: '/search', label: 'Buscar', icon: 'search' },
    { path: '/map', label: 'Mapa', icon: 'compass' },
    { path: '/favorites', label: 'Favoritos', icon: 'heart' },
    { path: '/profile', label: 'Perfil', icon: 'user' },
  ];
}
