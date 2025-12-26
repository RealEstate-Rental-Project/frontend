import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchCriteria } from '../../core/services/search.service';
import { PropertyService } from '../../core/services/property.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit {
    @Output() search = new EventEmitter<SearchCriteria>();

    criteria: SearchCriteria = {
        city: '',
        typeOfRental: 'MONTHLY',
        minRentAmount: 0,
        maxRentAmount: 10000
    };

    showMap = false;
    private map: any;

    constructor(
        private searchService: SearchService,
        private propertyService: PropertyService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        // Leaflet requires window object, so we check if we are in browser
    }

    onSearch() {
        this.search.emit(this.criteria);
        this.propertyService.searchProperties(this.criteria).subscribe(results => {
            console.log('Results:', results);
            // Emit results or navigate to search results page
            // For now, we might want to share these results with PropertiesListComponent
            // But typically, the parent component (Hero -> Home) handles the event
            // and calls the service.
            // Since PropertiesListComponent also calls searchProperties when criteria changes (via input or service),
            // we need to ensure the flow is correct.

            // Actually, looking at the architecture:
            // HeroComponent emits 'search' event.
            // PropertiesListComponent has onSearch(criteria).

            // If this component is just for input, emitting the event might be enough if the parent handles it.
            // But the user complained about the empty service call HERE.
            // So I will leave the service call but switch it to PropertyService to ensure it works if used directly.
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

    private marker: any;

    private async initMap() {
        if (this.map) return;

        // Dynamic import to avoid SSR issues with Leaflet
        const L = await import('leaflet');

        this.map = L.map('map').setView([48.8566, 2.3522], 13); // Default to Paris

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        this.map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            this.criteria.latitude = lat;
            this.criteria.longitude = lng;
            this.criteria.radiusInKm = 5; // Default radius

            if (this.marker) {
                this.marker.remove();
            }

            this.marker = L.marker([lat, lng]).addTo(this.map);
        });
    }

    clearLocation() {
        this.criteria.latitude = undefined;
        this.criteria.longitude = undefined;
        this.criteria.radiusInKm = undefined;
        if (this.marker) {
            this.marker.remove();
            this.marker = null;
        }
    }
}
