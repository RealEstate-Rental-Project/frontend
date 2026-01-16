import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { SearchComponent } from '../../search/search.component';
import { SearchCriteria } from '../../../core/services/search.service';

import { HeroComponent } from '../../../shared/components/hero/hero.component';

@Component({
  selector: 'app-properties-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroComponent],
  templateUrl: './properties-list.component.html',
  styleUrls: ['./properties-list.component.scss'],
})
export class PropertiesListComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  isLoading = true;
  showMap = false;
  private map: any;
  private markers: any[] = [];

  constructor(
    private propertyService: PropertyService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties() {
    this.isLoading = true;
    this.propertyService.getAllProperties().subscribe({
      next: (data) => {
        this.properties = data;
        this.filteredProperties = data;
        this.isLoading = false;
        if (this.showMap) {
          this.updateMapMarkers();
        }
      },
      error: (err) => {
        console.error('Error loading properties', err);
        this.isLoading = false;
      },
    });
  }

  onSearch(criteria: SearchCriteria) {
    this.isLoading = true;
    this.propertyService.searchProperties(criteria).subscribe({
      next: (data) => {
        this.filteredProperties = data;
        this.isLoading = false;
        if (this.showMap) {
          this.updateMapMarkers();
        }
      },
      error: (err) => {
        console.error('Error searching properties', err);
        this.isLoading = false;
      },
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

    const leafletModule = await import('leaflet');
    const L = (leafletModule as any).default || leafletModule;

    if (!this.map) {
      const mapContainer = document.getElementById('properties-map');
      if (!mapContainer) return;

      // Default center (e.g., Paris or based on first property)
      let center: [number, number] = [48.8566, 2.3522];
      if (this.filteredProperties.length > 0) {
        const firstProp = this.filteredProperties[0];
        if (
          firstProp.latitude !== undefined &&
          firstProp.longitude !== undefined
        ) {
          center = [firstProp.latitude, firstProp.longitude];
        }
      }

      this.map = L.map('properties-map').setView(center, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
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
        shadowSize: [41, 41],
      });
      L.Marker.prototype.options.icon = iconDefault;
    }

    this.updateMapMarkers();
  }

  private async updateMapMarkers() {
    if (!this.map || !isPlatformBrowser(this.platformId)) return;

    const leafletModule = await import('leaflet');
    const L = (leafletModule as any).default || leafletModule;

    // Clear existing markers
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    // Add new markers
    const bounds = L.latLngBounds([]);

    this.filteredProperties.forEach((property) => {
      if (property.latitude && property.longitude) {
        const marker = L.marker([property.latitude, property.longitude])
          .bindPopup(
            `
                        <div style="min-width: 200px;">
                            <h3 style="margin: 0 0 5px; font-size: 16px;">${property.title}</h3>
                            <p style="margin: 0; font-weight: bold;">${property.rentAmount} ETH/mo</p>
                            <a href="/properties/${property.idProperty}" style="display: block; margin-top: 5px; color: #d4af37;">View Details</a>
                        </div>
                    `
          )
          .addTo(this.map);

        this.markers.push(marker);
        bounds.extend([property.latitude, property.longitude]);
      }
    });

    if (this.markers.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}
