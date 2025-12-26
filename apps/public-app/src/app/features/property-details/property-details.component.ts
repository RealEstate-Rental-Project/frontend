import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { ReservationRequestComponent } from '../rentals/reservation-request/reservation-request.component';

@Component({
    selector: 'app-property-details',
    standalone: true,
    imports: [CommonModule, ReservationRequestComponent],
    templateUrl: './property-details.component.html',
    styleUrls: ['./property-details.component.scss']
})
export class PropertyDetailsComponent implements OnInit, AfterViewInit {
    property: Property | null = null;
    private map: any;

    constructor(
        private route: ActivatedRoute,
        private propertyService: PropertyService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.propertyService.getPropertyById(id).subscribe((data: Property) => {
                this.property = data;
                if (isPlatformBrowser(this.platformId)) {
                    setTimeout(() => {
                        this.initMap();
                    }, 100);
                }
            });
        }
    }

    ngAfterViewInit(): void {
        // Map initialization moved to ngOnInit subscription
    }

    private async initMap() {
        if (!this.property?.latitude || !this.property?.longitude) return;
        if (this.map) {
            this.map.remove(); // Clean up existing map if any
        }

        const L = await import('leaflet');
        const lat = this.property.latitude;
        const lng = this.property.longitude;

        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        this.map = L.map('map').setView([lat, lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        L.circle([lat, lng], {
            color: '#d4af37',
            fillColor: '#d4af37',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(this.map);
    }

    get mainImage(): string {
        // Return first room image or placeholder
        if (this.property?.rooms && this.property.rooms.length > 0 && this.property.rooms[0].roomImages.length > 0) {
            return this.property.rooms[0].roomImages[0].url;
        }
        return 'https://images.unsplash.com/photo-1600596542815-60c37c6525fa?q=80&w=1000&auto=format&fit=crop';
    }

    showGallery = false;
    showReservation = false;

    get galleryImages(): string[] {
        // Collect up to 4 images for the grid
        const images: string[] = [];
        this.property?.rooms.forEach(room => {
            room.roomImages.forEach(img => {
                if (images.length < 4 && img.url !== this.mainImage) {
                    images.push(img.url);
                }
            });
        });
        return images;
    }

    get allImages(): string[] {
        const images: string[] = [];
        this.property?.rooms.forEach(room => {
            room.roomImages.forEach(img => {
                images.push(img.url);
            });
        });
        return images;
    }

    toggleGallery(): void {
        this.showGallery = !this.showGallery;
        if (this.showGallery) {
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            document.body.style.overflow = 'auto';
        }
    }

    toggleReservation(): void {
        this.showReservation = !this.showReservation;
        if (this.showReservation) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
}
