export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  is_active?: boolean;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  client_id: number;
  worker_id?: number;
  service_id: number;
  status: OrderStatus;
  total_amount: number;
  payment_intent_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderWithDetails extends Order {
  client: User;
  worker?: User;
  service: Service;
}

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
}

export enum UserRole {
  CLIENT = 'client',
  WORKER = 'worker',
  ADMIN = 'admin'
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELED = 'canceled',
  COMPLETED = 'completed'
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
