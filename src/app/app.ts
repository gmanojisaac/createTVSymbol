import { Component, signal } from '@angular/core';

import { KiteOptionFinderComponent } from './kite-option-finder/kite-option-finder';
@Component({
  selector: 'app-root',
  imports: [ KiteOptionFinderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tv-bot-test');
}
