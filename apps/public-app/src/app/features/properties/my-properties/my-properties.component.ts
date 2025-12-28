import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyRequestsComponent } from '../property-requests/property-requests.component';

@Component({
    selector: 'app-my-properties',
    standalone: true,
    imports: [CommonModule, RouterModule, PropertyRequestsComponent],
    templateUrl: './my-properties.component.html',
    styleUrls: ['./my-properties.component.scss']
})
export class MyPropertiesComponent implements OnInit {
    properties: any[] = [];
    loading = true;
    selectedPropertyId: number | null = null;

    constructor(private propertyService: PropertyService) { }

    ngOnInit(): void {
        this.propertyService.getMyProperties().subscribe({
            next: (data: any[]) => {
                this.properties = data;
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Failed to fetch properties', err);
                this.loading = false;
            }
        });
    }

    openRequests(propertyId: number) {
        this.selectedPropertyId = propertyId;
    }

    closeRequests() {
        this.selectedPropertyId = null;
    }
}
