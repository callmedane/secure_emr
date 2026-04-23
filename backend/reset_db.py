from pathlib import Path
from app import create_app
from app.extensions import db
from app.seed import seed_data
from app.bootstrap import ensure_schema

app = create_app()

with app.app_context():
    db_uri = app.config['SQLALCHEMY_DATABASE_URI']
    if db_uri.startswith('sqlite:///'):
        db_path = Path(db_uri.replace('sqlite:///', '', 1))
        db.session.remove()
        db.drop_all()
        if db_path.exists():
            db_path.unlink()
        db.create_all()
    else:
        db.session.remove()
        db.drop_all()
        db.create_all()

    ensure_schema()
    seed_data()
    print('Database reset and reseeded successfully.')
