import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, SearchComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    featuredProperties: Property[] = [];

    constructor(private propertyService: PropertyService) { }

    ngOnInit(): void {
        this.propertyService.getFeaturedProperties().subscribe(properties => {
            this.featuredProperties = properties;
        });
    }
}
