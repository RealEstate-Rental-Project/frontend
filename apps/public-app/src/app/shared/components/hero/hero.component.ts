import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../features/search/search.component';
import { SearchCriteria } from '../../../core/services/search.service';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule, SearchComponent],
    templateUrl: './hero.component.html',
    styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
    @Input() title = 'Find Your Dream Home';
    @Input() subtitle = 'Discover luxury properties for long and short term rental.';
    @Input() backgroundImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop';
    @Output() search = new EventEmitter<SearchCriteria>();
    @Output() viewMap = new EventEmitter<void>();

    onSearch(criteria: SearchCriteria) {
        this.search.emit(criteria);
    }

    onViewMap() {
        this.viewMap.emit();
    }
}
