import sqlite3

DB_NAME = "courier_db.sqlite"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create Shipments Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shipments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_name TEXT,
            sender_address TEXT,
            sender_city TEXT,
            sender_phone TEXT,
            receiver_name TEXT,
            receiver_address TEXT,
            receiver_city TEXT,
            receiver_phone TEXT,
            courier_desc TEXT,
            weight REAL,
            distance REAL,
            total_amount REAL,
            status TEXT DEFAULT 'Pending',
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized.")