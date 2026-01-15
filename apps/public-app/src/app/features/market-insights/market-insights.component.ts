import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MarketInsightsService } from '../../core/services/market-insights.service';
import { TypeOfRental } from '../../core/models/property.model';
import { HeatmapPointDTO } from '../../core/models/heatmap.model';

@Component({
    selector: 'app-market-insights',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './market-insights.component.html',
    styleUrls: ['./market-insights.component.scss']
})
export class MarketInsightsComponent implements OnInit, OnDestroy {
    selectedType: TypeOfRental = TypeOfRental.MONTHLY;
    heatmapData: HeatmapPointDTO[] = [];
    isLoading = false;
    errorMessage = '';
    TypeOfRental = TypeOfRental;

    private map: any;
    private markers: any[] = [];

    constructor(
        private marketInsightsService: MarketInsightsService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        this.loadHeatmapData();
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
        }
    }

    loadHeatmapData(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.marketInsightsService.getMarketHeatmap(this.selectedType).subscribe({
            next: (response) => {
                this.heatmapData = response.data;
                this.isLoading = false;
                if (this.heatmapData.length > 0) {
                    setTimeout(() => {
                        this.initMap();
                    }, 100);
                }
            },
            error: (error) => {
                console.error('Failed to load heatmap data:', error);
                this.errorMessage = 'Failed to load market insights. Please try again later.';
                this.isLoading = false;
            }
        });
    }

    onTypeChange(type: TypeOfRental): void {
        if (this.selectedType !== type) {
            this.selectedType = type;
            this.loadHeatmapData();
        }
    }

    private async initMap() {
        if (!isPlatformBrowser(this.platformId)) return;

        const L = await import('leaflet');

        // Remove existing map if any
        if (this.map) {
            this.map.remove();
        }

        const mapContainer = document.getElementById('heatmap-container');
        if (!mapContainer) return;

        // Calculate center from data points
        let center: [number, number] = [48.8566, 2.3522]; // Default: Paris
        if (this.heatmapData.length > 0) {
            const avgLat = this.heatmapData.reduce((sum, point) => sum + point.latitude, 0) / this.heatmapData.length;
            const avgLng = this.heatmapData.reduce((sum, point) => sum + point.longitude, 0) / this.heatmapData.length;
            center = [avgLat, avgLng];
        }

        this.map = L.map('heatmap-container').setView(center, 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        // Required to fix map rendering issues in some containers
        setTimeout(() => {
            this.map.invalidateSize();
        }, 200);

        // Clear existing markers
        this.markers.forEach(marker => marker.remove());
        this.markers = [];

        console.log(`Adding ${this.heatmapData.length} markers to map`);

        // Add markers for each heatmap point
        const bounds = L.latLngBounds([]);

        this.heatmapData.forEach(point => {
            if (!point.latitude || !point.longitude) return;

            const color = this.getTrendColor(point.trend_status);

            // Create custom circle marker
            const circleMarker = L.circleMarker([point.latitude, point.longitude], {
                radius: 15,
                fillColor: color,
                color: '#fff',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.85
            });

            // Create popup content
            const popupContent = `
                <div style="min-width: 260px; font-family: 'Inter', sans-serif; padding: 4px;">
                    <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #1a1a2e; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
                        ${point.neighborhood}
                    </h3>
                    <div style="margin-bottom: 12px; background: #f8f9fa; padding: 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.03);">
                        <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; font-weight: 600;">Average Price</div>
                        <div style="display: flex; align-items: baseline; gap: 6px;">
                            <span style="color: #d4af37; font-weight: 800; font-size: 26px;">${point.current_avg_price?.toFixed(4) || '0.0000'}</span>
                            <span style="color: #1a1a2e; font-size: 14px; font-weight: 600;">ETH/m²</span>
                        </div>
                    </div>
                    <div style="margin-bottom: 10px; padding: 10px; background: ${color}08; border-radius: 10px; display: flex; align-items: center; gap: 10px; border: 1px solid ${color}20;">
                        <div style="width: 32px; height: 32px; background: ${color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="${this.getTrendIconPath(point.trend_status)}"></path>
                            </svg>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #888; text-transform: uppercase; font-weight: 600;">Market Trend</div>
                            <div style="color: ${color}; font-weight: 700; font-size: 15px;">
                                ${this.formatTrendStatus(point.trend_status)}
                            </div>
                        </div>
                    </div>
                    <p style="margin: 10px 0 0; font-size: 13px; color: #666; line-height: 1.6; padding: 0 4px;">
                        ${point.trend_description || 'Market data analyzed by AI.'}
                    </p>
                </div>
            `;

            circleMarker.bindPopup(popupContent);
            circleMarker.addTo(this.map);

            this.markers.push(circleMarker);
            bounds.extend([point.latitude, point.longitude]);
        });

        // Fit map to show all markers
        if (this.markers.length > 0) {
            console.log('Fitting bounds to markers');
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    private getTrendColor(trendStatus: string): string {
        if (!trendStatus) return '#3b82f6'; // Default to blue if status is missing
        const status = trendStatus.toUpperCase();
        if (status === 'HOT') {
            return '#ef4444'; // Red for hot market (rising prices)
        } else if (status === 'COOL') {
            return '#22c55e'; // Green for cool market (declining prices - good for renters)
        } else {
            return '#3b82f6'; // Blue for stable market
        }
    }

    private formatTrendStatus(status: string): string {
        if (!status) return 'Stable';
        const statusUpper = status.toUpperCase();
        if (statusUpper === 'HOT') return 'High Demand';
        if (statusUpper === 'COOL') return 'Low Demand';
        if (statusUpper === 'STABLE') return 'Balanced';
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    private getTrendIconPath(status: string): string {
        const statusUpper = (status || '').toUpperCase();
        if (statusUpper === 'HOT') return 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'; // Trending Up
        if (statusUpper === 'COOL') return 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'; // Trending Down
        return 'M5 12h14'; // Stable/Horizontal
    }
}
