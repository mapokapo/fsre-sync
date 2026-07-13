import { ServiceErrorCode } from "@/features/common/errors/service-error.codes.ts";
import { ServiceError } from "@/features/common/errors/service.error.ts";

export class EmailSendMessageFailed extends ServiceError {
  constructor(message: string, cause?: unknown) {
    super(ServiceErrorCode.EMAIL_SEND_MESSAGE_FAILED, message, cause);
  }
}

export class FcmSendMessageFailed extends ServiceError {
  constructor(message: string, cause?: unknown) {
    super(ServiceErrorCode.FCM_SEND_MESSAGE_FAILED, message, cause);
  }
}

export class MessagingSubscriptionAlreadyRegistered extends ServiceError {
  constructor(
    public readonly email: null | string,
    public readonly fcmToken: null | string,
    public readonly studyProgramId: number,
  ) {
    super(
      ServiceErrorCode.MESSAGING_SUBSCRIPTION_ALREADY_REGISTERED,
      `Subscription already registered for study program ${studyProgramId.toString()}`,
    );
  }
}
