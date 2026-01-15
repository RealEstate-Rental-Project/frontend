import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { Property } from '../../../../core/models/property.model';
import { AuthService } from '../../../auth/services/auth.service';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-recommendations-section',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './recommendations-section.component.html',
    styleUrls: ['./recommendations-section.component.scss']
})
export class RecommendationsSectionComponent implements OnInit {
    recommendedProperties: Property[] = [];
    isLoggedIn = false;
    loading = true;

    constructor(
        private propertyService: PropertyService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        console.log('RecommendationsSectionComponent: OnInit');
        this.authService.isAuthenticated$.subscribe(authenticated => {
            console.log('RecommendationsSectionComponent: Auth state:', authenticated);
            this.isLoggedIn = authenticated;
            // Forcing load for testing even if not authenticated if that helps debug
            this.loadRecommendations();
        });
    }

    loadRecommendations(): void {
        console.log('RecommendationsSectionComponent: Loading recommendations...');
        this.loading = true;
        this.propertyService.getRecommendations().subscribe({
            next: (properties) => {
                console.log('RecommendationsSectionComponent: Success:', properties.length, 'properties');
                this.recommendedProperties = properties;
                this.loading = false;
            },
            error: (err) => {
                console.error('RecommendationsSectionComponent: Error:', err);
                this.loading = false;
            }
        });
    }

    getPropertyImage(property: Property): string {
        return property.rooms?.[0]?.roomImages?.[0]?.url || 'assets/placeholder.webp';
    }
}
