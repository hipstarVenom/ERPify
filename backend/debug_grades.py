from app.database import SessionLocal
from app.models.grade import Grade

db = SessionLocal()
try:
    grades = db.query(Grade).all()
    print(f"Count: {len(grades)}")
    for g in grades:
        print(g.id, g.enrollment_id, g.marks, g.grade)
except Exception as e:
    print(f"ERROR: {e}")
finally:
    db.close()
