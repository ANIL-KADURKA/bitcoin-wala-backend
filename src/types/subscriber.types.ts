export interface SubscriberInstance {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  organization?: string;
  is_active: boolean;
  is_subscribed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
