import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    styleUrls: ['./properties-list.component.scss']
})
export class PropertiesListComponent implements OnInit {
    properties: Property[] = [];
    filteredProperties: Property[] = [];
    isLoading = true;

    constructor(private propertyService: PropertyService) { }

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
            },
            error: (err) => {
                console.error('Error loading properties', err);
                this.isLoading = false;
            }
        });
    }

    onSearch(criteria: SearchCriteria) {
        this.isLoading = true;
        this.propertyService.searchProperties(criteria).subscribe({
            next: (data) => {
                this.filteredProperties = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error searching properties', err);
                this.isLoading = false;
            }
        });
    }
}
