from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, users, vehicles, bookings, payments, admin, reviews, documents, disputes
from app.config import settings

# Create all database tables (only creates if not exists)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title='Gari Niben Naki API',
    description='Car Rental System REST API',
    version='1.0.0',
    docs_url='/docs',      # Swagger UI at localhost:8000/docs
    redoc_url='/redoc',
)

# CORS allows your Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, 'http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Register all routers
app.include_router(auth.router, prefix='/api/auth', tags=['Authentication'])
app.include_router(users.router, prefix='/api/users', tags=['Users'])
app.include_router(vehicles.router, prefix='/api/vehicles', tags=['Vehicles'])
app.include_router(bookings.router, prefix='/api/bookings', tags=['Bookings'])
app.include_router(payments.router, prefix='/api/payments', tags=['Payments'])
app.include_router(admin.router, prefix='/api/admin', tags=['Admin'])
app.include_router(reviews.router, prefix='/api/reviews', tags=['Reviews'])
app.include_router(documents.router, prefix='/api/documents', tags=['Documents'])
app.include_router(disputes.router, prefix='/api/disputes', tags=['Disputes'])


@app.get('/')
def root():
    return {'message': 'Gari Niben Naki API is running!', 'docs': '/docs'}