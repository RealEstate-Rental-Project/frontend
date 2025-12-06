import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchCriteria } from '../../core/services/search.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit {
    criteria: SearchCriteria = {
        location: '',
        type: 'LONG_TERM',
        minPrice: 0,
        maxPrice: 10000
    };

    showMap = false;
    private map: any;

    constructor(
        private searchService: SearchService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        // Leaflet requires window object, so we check if we are in browser
    }

    onSearch() {
        this.searchService.searchProperties(this.criteria).subscribe(results => {
            console.log('Results:', results);
            // Emit results or navigate to search results page
        });
    }

    toggleMap() {
        this.showMap = !this.showMap;
        if (this.showMap && isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                this.initMap();
            }, 100);
        } else if (!this.showMap && this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    private async initMap() {
        if (this.map) return;

        // Dynamic import to avoid SSR issues with Leaflet
        const L = await import('leaflet');

        this.map = L.map('map').setView([48.8566, 2.3522], 13); // Default to Paris

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }
}
