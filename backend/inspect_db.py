from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'grade'"))
        for row in result:
            print(row[0])
    except Exception as e:
        print(f"ERROR: {e}")
