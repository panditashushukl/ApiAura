import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoTextSize = 'sm' | 'base' | 'lg' | 'xl';

@Component({
  selector: 'app-logo',
  imports: [CommonModule],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class LogoComponent {
  readonly size = input<LogoSize>('md');
  readonly withBadge = input<boolean>(true);
  readonly showText = input<boolean>(false);
  readonly textSize = input<LogoTextSize>('base');
}
