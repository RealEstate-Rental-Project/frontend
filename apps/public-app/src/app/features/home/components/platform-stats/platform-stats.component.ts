import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-platform-stats',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './platform-stats.component.html',
    styleUrls: ['./platform-stats.component.scss']
})
export class PlatformStatsComponent {
    stats = [
        { label: 'Total Properties', value: '1,200+' },
        { label: 'Happy Tenants', value: '850+' },
        { label: 'Volume Traded', value: '450 ETH' }
    ];
}
