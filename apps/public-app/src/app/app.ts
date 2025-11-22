import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// importing the component from the library
import { Hero } from '@frontend/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Hero],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected title = 'public-app';
}
