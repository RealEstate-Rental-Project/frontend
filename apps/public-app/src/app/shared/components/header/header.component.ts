import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../features/auth/services/auth.service';
import { StorageUtils } from '../../../features/auth/utils/storage.utils';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { EventType } from '../../../core/models/event-type.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('slideIn', [
      state('closed', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('open', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('closed => open', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('open => closed', [
        animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  wallet: string | null = null;
  unreadCount = 0;
  isNotificationPanelOpen = false;
  showOnboarding = false;

  notifications$: Observable<Notification[]>;

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.isAuthenticated$.subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) {
          this.wallet = StorageUtils.getwallet();
          const userId = Number(StorageUtils.getUserId());

          // Check if onboarding is needed
          const hasSeenProfileGuide = localStorage.getItem('hasSeenProfileGuide');
          if (!hasSeenProfileGuide) {
            this.showOnboarding = true;
          }

          // Connexion WebSocket et chargement des notifications
          this.notificationService.connect(userId);
          this.notificationService.loadNotifications(userId);
          this.notificationService.getUnreadCount(userId);

          // Écoute du compteur de notifications non lues
          this.subscriptions.add(
            this.notificationService.unreadCount$.subscribe(count => {
              this.unreadCount = count;
            })
          );
        } else {
          this.wallet = null;
          this.unreadCount = 0;
          this.notificationService.disconnect();
          this.isNotificationPanelOpen = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleNotificationPanel(event: Event): void {
    event.stopPropagation();
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;

    // Charger les notifications si le panel s'ouvre
    if (this.isNotificationPanelOpen && this.isLoggedIn) {
      const userId = Number(StorageUtils.getUserId());
      this.notificationService.loadNotifications(userId);
    }
  }

  closeNotificationPanel(): void {
    this.isNotificationPanelOpen = false;
  }

  dismissOnboarding(): void {
    this.showOnboarding = false;
    localStorage.setItem('hasSeenProfileGuide', 'true');
  }

  onNotificationClick(notification: Notification): void {
    // Mark notification as read
    this.markAsRead(notification.id);

    // Navigate based on event type and metadata
    if (notification.eventType === EventType.RENTAL_REQUEST_CREATED && notification.metadata?.tenantId) {
      this.router.navigate(['/tenant-profile', notification.metadata.tenantId]);
      this.closeNotificationPanel();
    }
    // Future: Add other navigation logic for different event types
    // e.g., if (notification.eventType === EventType.PAYMENT_RECEIVED && notification.metadata?.propertyId)
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId);
  }

  logout(): void {
    this.notificationService.disconnect();
    this.authService.logout();
    this.isNotificationPanelOpen = false;
  }

  // Formater le temps relatif (ex: "2 hours ago", "Just now")
  formatTime(sentAt: string): string {
    const now = new Date();
    const sent = new Date(sentAt);
    const diffMs = now.getTime() - sent.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return sent.toLocaleDateString();
  }

  // Obtenir la classe CSS pour l'icône de notification
  getNotificationIconClass(eventType: EventType): string {
    switch (eventType) {
      case EventType.RENTAL_REQUEST_CREATED:
        return 'icon-info';
      case EventType.RENTAL_REQUEST_ACCEPTED:
        return 'icon-success';
      case EventType.RENTAL_REQUEST_REJECTED:
        return 'icon-error';
      case EventType.PAYMENT_RECEIVED:
        return 'icon-payment';
      case EventType.CONTRACT_CREATED:
        return 'icon-contract';
      case EventType.KEY_DELIVERED:
        return 'icon-key';
      default:
        return 'icon-default';
    }
  }

  // Obtenir le path SVG pour l'icône
  getNotificationIconPath(eventType: EventType): string {
    switch (eventType) {
      case EventType.RENTAL_REQUEST_CREATED:
        return 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z';
      case EventType.RENTAL_REQUEST_ACCEPTED:
        return 'M22 11.08V12a10 10 0 1 1-5.93-9.14';
      case EventType.RENTAL_REQUEST_REJECTED:
        return 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z';
      case EventType.PAYMENT_RECEIVED:
        return 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6';
      case EventType.CONTRACT_CREATED:
        return 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8';
      case EventType.KEY_DELIVERED:
        return 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4';
      default:
        return 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9';
    }
  }
}