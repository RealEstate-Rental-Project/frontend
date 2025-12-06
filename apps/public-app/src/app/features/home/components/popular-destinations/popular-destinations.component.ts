import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-popular-destinations',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './popular-destinations.component.html',
    styleUrls: ['./popular-destinations.component.scss']
})
export class PopularDestinationsComponent {
    destinations = [
        {
            name: 'Casablanca',
            count: 24,
            image: 'https://images.unsplash.com/photo-1577147443647-81856d5151af?q=80&w=1000&auto=format&fit=crop'
        },
        {
            name: 'Marrakech',
            count: 18,
            image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=1000&auto=format&fit=crop'
        },
        {
            name: 'Rabat',
            count: 42,
            image: 'https://images.unsplash.com/photo-1583232827257-1cadca075343?q=80&w=1470&auto=format&fit=crop'
        },
        {
            name: 'Tanger',
            count: 35,
            image: 'https://images.unsplash.com/photo-1580816256784-a51abad9c0f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHRhbmdlcnxlbnwwfHwwfHx8MA%3D%3D'
        }
    ];
}
