import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { TenantScore } from '../../../core/models/tenant-score.model';

@Component({
    selector: 'app-tenant-profile-view',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './tenant-profile-view.component.html',
    styleUrls: ['./tenant-profile-view.component.scss']
})
export class TenantProfileViewComponent implements OnInit {
    tenantId: number | null = null;
    tenant: User | null = null;
    tenantScore: TenantScore | null = null;
    loading = true;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private notificationService: NotificationService
    ) { }

    async ngOnInit() {
        // Get tenant ID from route
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error = 'No tenant ID provided';
            this.loading = false;
            return;
        }

        this.tenantId = Number(id);

        try {
            // Fetch tenant data and score in parallel
            const [tenant, score] = await Promise.all([
                this.userService.getUserById(this.tenantId),
                this.notificationService.getTenantScore(this.tenantId).toPromise()
            ]);

            this.tenant = tenant;
            this.tenantScore = score as TenantScore;
        } catch (err) {
            console.error('Error loading tenant profile:', err);
            this.error = 'Failed to load tenant profile. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    get avatarUrl(): string {
        if (!this.tenant) return '';
        return `https://ui-avatars.com/api/?name=${this.tenant.firstName}+${this.tenant.lastName}&background=random&size=200`;
    }

    get scorePercentage(): number {
        return this.tenantScore?.trust_score || 0;
    }

    get scoreColor(): string {
        const score = this.scorePercentage;
        if (score > 75) return '#10b981'; // Green
        if (score >= 40) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    }

    get categoryBadgeClass(): string {
        const category = this.tenantScore?.risk_category;
        if (category === 'Safe') return 'badge-safe';
        if (category === 'Moderate') return 'badge-moderate';
        return 'badge-risky';
    }

    goBack(): void {
        this.router.navigate(['/']);
    }
}
