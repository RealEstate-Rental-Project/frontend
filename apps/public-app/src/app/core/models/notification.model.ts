import { EventType } from "./event-type.enum";

export interface Notification {
  id: number;
  userId: number;
  eventType: EventType;
  title: string;
  message: string;
  status: string;
  sentAt: string;
  metadata: any;
}