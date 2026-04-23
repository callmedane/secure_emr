from app import create_app
from app.seed import seed_data
from app.bootstrap import ensure_schema

app = create_app()

with app.app_context():
    ensure_schema()
    seed_data()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
