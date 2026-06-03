from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType


def create_notification(
    db: Session,
    user_id: int,
    type: NotificationType,
    title: str,
    message: str,
    link: str = None,
):
    '''
    Create an in-app notification for a user.
    Call this from any router when something important happens.
    '''
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link,
    )
    db.add(notif)
    db.commit()
    return notif


# Convenience wrappers for common notifications
def notify_booking_confirmed(db: Session, customer_id: int, booking_ref: str):
    create_notification(
        db, customer_id,
        NotificationType.BOOKING_CONFIRMED,
        title='Booking Confirmed!',
        message=f'Your booking {booking_ref} has been confirmed.',
        link=f'/dashboard/bookings',
    )


def notify_car_approved(db: Session, owner_id: int, car_name: str):
    create_notification(
        db, owner_id,
        NotificationType.CAR_APPROVED,
        title='Your car listing was approved!',
        message=f'{car_name} is now live and available for booking.',
        link='/owner/cars',
    )


def notify_car_rejected(db: Session, owner_id: int, car_name: str, reason: str):
    create_notification(
        db, owner_id,
        NotificationType.CAR_REJECTED,
        title='Car listing rejected',
        message=f'{car_name} was rejected. Reason: {reason}',
        link='/owner/cars',
    )