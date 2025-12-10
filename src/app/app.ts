import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KiteOptionFinderComponent } from './kite-option-finder/kite-option-finder';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, KiteOptionFinderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tv-bot-test');
}
