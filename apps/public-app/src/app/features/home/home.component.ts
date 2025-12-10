import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchComponent } from '../search/search.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { PopularDestinationsComponent } from './components/popular-destinations/popular-destinations.component';
import { PlatformStatsComponent } from './components/platform-stats/platform-stats.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SearchComponent,
        FeaturesSectionComponent,
        PopularDestinationsComponent,
        PlatformStatsComponent,
        FooterComponent
    ],
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
