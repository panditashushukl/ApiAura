import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './components/topbar/topbar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { AuthModalComponent } from './components/auth-modal/auth-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopbarComponent, SidebarComponent, AuthModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('ApiAura');
}
