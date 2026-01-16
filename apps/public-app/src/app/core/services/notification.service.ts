import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../models/notification.model';
import { API_CONSTANTS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private stompClient?: Client;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  /* =========================
     WEBSOCKET
  ========================== */
  connect(userId: number): void {
    if (this.stompClient?.active) return;

    this.stompClient = new Client({
      webSocketFactory: () =>
        new SockJS(
          `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.NOTIFICATIONS.SOCKET}`,
          null,
          { transports: ['websocket'] }
        ),

      debug: () => { },

      onConnect: () => {
        this.stompClient?.subscribe(
          `/topic/notifications/${userId}`,
          (message: IMessage) => {
            const notification: Notification = JSON.parse(message.body);
            this.addNotification(notification);
          }
        );
      },

      onStompError: frame => {
        console.error('STOMP error:', frame);
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
  }

  /* =========================
     HTTP
  ========================== */

  loadNotifications(userId: number): void {
    this.http.get<Notification[]>(
      `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.NOTIFICATIONS.BASE}/user/${userId}`
    ).subscribe(notifs => {
      this.notificationsSubject.next(notifs);
      this.updateUnreadCount(notifs);
      console.log(notifs);
    });
  }

  getUnreadCount(userId: number): void {
    this.http.get<number>(
      `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.NOTIFICATIONS.BASE}/unread/count/${userId}`
    ).subscribe(count => this.unreadCountSubject.next(count));
  }

  getTenantScore(userId: number) {
    return this.http.get(
      `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.RENTAL_AGREEMENT.SCORE(userId)}`
    );
  }

  markAsRead(notificationId: number): void {
    this.http.put(
      `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}/read`,
      {}
    ).subscribe(() => {
      const updated = this.notificationsSubject.value.map(n =>
        n.id === notificationId ? { ...n, status: 'READ' } : n
      );
      this.notificationsSubject.next(updated);
      this.updateUnreadCount(updated);
    });
  }

  /* =========================
     HELPERS
  ========================== */

  private addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unread = notifications.filter(n => n.status !== 'READ').length;
    this.unreadCountSubject.next(unread);
  }
}
