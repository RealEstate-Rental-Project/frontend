import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { PopularDestinationsComponent } from './components/popular-destinations/popular-destinations.component';
import { PlatformStatsComponent } from './components/platform-stats/platform-stats.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { HeroComponent } from '../../shared/components/hero/hero.component';
import { RecommendationsSectionComponent } from './components/recommendations-section/recommendations-section.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FeaturesSectionComponent,
        PopularDestinationsComponent,
        PlatformStatsComponent,
        FooterComponent,
        HeroComponent,
        RecommendationsSectionComponent
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    featuredProperties: Property[] = [];
    @ViewChild('featuredGrid') featuredGrid!: ElementRef;
    showMap = false;
    private map: any;
    private markers: any[] = [];

    constructor(
        private propertyService: PropertyService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        this.propertyService.getFeaturedProperties().subscribe(properties => {
            this.featuredProperties = properties;
            if (this.showMap) {
                this.updateMapMarkers();
            }
        });
    }

    scrollFeatured(direction: 'prev' | 'next'): void {
        if (!this.featuredGrid) return;
        const container = this.featuredGrid.nativeElement;
        const scrollAmount = container.offsetWidth + 32; // Container width + gap (2rem = 32px)
        container.scrollBy({
            left: direction === 'next' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        });
    }

    toggleView(): void {
        this.showMap = !this.showMap;
        if (this.showMap) {
            setTimeout(() => {
                this.initMap();
            }, 100);
        }
    }

    private async initMap() {
        if (!isPlatformBrowser(this.platformId)) return;

        const L = await import('leaflet');

        if (!this.map) {
            const mapContainer = document.getElementById('home-map');
            if (!mapContainer) return;

            // Default center (e.g., Paris or based on first property)
            let center: [number, number] = [48.8566, 2.3522];
            if (this.featuredProperties.length > 0) {
                const firstProp = this.featuredProperties[0];
                if (firstProp.latitude !== undefined && firstProp.longitude !== undefined) {
                    center = [firstProp.latitude, firstProp.longitude];
                }
            }

            this.map = L.map('home-map').setView(center, 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.map);

            // Fix for missing markers
            const iconRetinaUrl = 'assets/marker-icon-2x.png';
            const iconUrl = 'assets/marker-icon.png';
            const shadowUrl = 'assets/marker-shadow.png';
            const iconDefault = L.icon({
                iconRetinaUrl,
                iconUrl,
                shadowUrl,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [41, 41]
            });
            L.Marker.prototype.options.icon = iconDefault;
        }

        this.updateMapMarkers();
    }

    private async updateMapMarkers() {
        if (!this.map || !isPlatformBrowser(this.platformId)) return;

        const L = await import('leaflet');

        // Clear existing markers
        this.markers.forEach(marker => marker.remove());
        this.markers = [];

        // Add new markers
        const bounds = L.latLngBounds([]);

        this.featuredProperties.forEach(property => {
            if (property.latitude && property.longitude) {
                const marker = L.marker([property.latitude, property.longitude])
                    .bindPopup(`
                        <div style="min-width: 200px;">
                            <h3 style="margin: 0 0 5px; font-size: 16px;">${property.title}</h3>
                            <p style="margin: 0; font-weight: bold;">${property.rentAmount} ETH/mo</p>
                            <a href="/properties/${property.idProperty}" style="display: block; margin-top: 5px; color: #d4af37;">View Details</a>
                        </div>
                    `)
                    .addTo(this.map);

                this.markers.push(marker);
                bounds.extend([property.latitude, property.longitude]);
            }
        });

        if (this.markers.length > 0) {
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
    getPropertyImage(property: Property): string {
        if (property.rooms && property.rooms.length > 0 && property.rooms[0].roomImages && property.rooms[0].roomImages.length > 0) {
            return property.rooms[0].roomImages[0].url;
        }
        return 'assets/placeholder.webp';
    }
}
