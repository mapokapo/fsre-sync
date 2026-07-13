export interface MessagingSubscriptionDto {
  createdAt: Date;
  deviceInfo: string;
  email: null | string;
  fcmToken: null | string;
  id: string;
  lastNotifiedAt: Date | null;
  studyProgramId: number;
}

export interface SubscribeDto {
  deviceInfo: string;
  email: null | string;
  fcmToken: null | string;
  studyProgramId: number;
}
