import sys
sys.path.append('.')
from app.database import engine
from sqlalchemy import text

tables = ['user', 'enrollment', 'attendance', 'grade']

with engine.connect() as conn:
    for t in tables:
        try:
            res = conn.execute(text(f'SELECT count(*) FROM "{t}"'))
            print(f'{t}: {res.fetchone()[0]}')
        except Exception as e:
            print(f'{t}: Error - {e}')
