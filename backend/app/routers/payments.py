from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe
from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.models.user    import User
from app.utils.dependencies import get_current_user
from app.config import settings
from pydantic import BaseModel

router = APIRouter()
stripe.api_key = settings.stripe_secret_key


class CreatePaymentIntent(BaseModel):
    booking_id: int


@router.post('/create-intent')
def create_payment_intent(
    data: CreatePaymentIntent,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    '''
    Step 1: Create a Stripe PaymentIntent.
    Returns a client_secret that the frontend uses to show the payment form.
    '''
    booking = db.query(Booking).filter(
        Booking.id == data.booking_id,
        Booking.customer_id == current_user.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')

    # Amount is in cents for Stripe (multiply by 100)
    intent = stripe.PaymentIntent.create(
        amount=int(booking.total_amount * 100),
        currency='usd',
        metadata={'booking_id': booking.id, 'user_id': current_user.id},
    )

    # Save payment record
    payment = Payment(
        booking_id=booking.id,
        stripe_payment_intent_id=intent.id,
        amount=booking.total_amount,
    )
    db.add(payment)
    db.commit()

    return {'client_secret': intent.client_secret, 'payment_id': payment.id}


@router.post('/webhook')
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    '''
    Stripe calls this URL automatically when a payment succeeds or fails.
    You must register this URL in your Stripe Dashboard > Webhooks.
    '''
    payload   = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid payload')
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail='Invalid signature')

    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        booking_id = int(intent['metadata']['booking_id'])

        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == intent['id']
        ).first()
        if payment:
            payment.status = PaymentStatus.SUCCEEDED
            payment.stripe_charge_id = intent.get('latest_charge')
            booking = db.query(Booking).filter(Booking.id == booking_id).first()
            if booking:
                booking.status = BookingStatus.CONFIRMED
            db.commit()

    elif event['type'] == 'payment_intent.payment_failed':
        intent = event['data']['object']
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == intent['id']
        ).first()
        if payment:
            payment.status = PaymentStatus.FAILED
            db.commit()

    return {'received': True}


@router.post('/refund/{booking_id}')
def refund_payment(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.booking_id == booking_id).first()
    if not payment or payment.status != PaymentStatus.SUCCEEDED:
        raise HTTPException(status_code=400, detail='No successful payment found')

    refund = stripe.Refund.create(charge=payment.stripe_charge_id)
    payment.status         = PaymentStatus.REFUNDED
    payment.refunded_amount = payment.amount
    db.commit()
    return {'message': 'Refund processed', 'refund_id': refund.id}