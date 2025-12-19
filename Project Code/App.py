from flask import Flask, render_template, request, jsonify
import sqlite3
import webbrowser
from threading import Timer
from Database import init_db, DB_NAME

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('CourierService.html')

# API: Add OR Update Shipment
@app.route('/api/save_shipment', methods=['POST'])
def save_shipment():
    try:
        data = request.form
        shipment_id = data.get('shipment_id')

        conn = get_db()
        cursor = conn.cursor()

        if shipment_id: # UPDATE EXISTING
            cursor.execute('''
                UPDATE shipments SET 
                sender_name=?, sender_address=?, sender_city=?, sender_phone=?,
                receiver_name=?, receiver_address=?, receiver_city=?, receiver_phone=?,
                courier_desc=?, weight=?, distance=?, total_amount=?
                WHERE id=?
            ''', (
                data['s_name'], data['s_addr'], data['s_city'], data['s_phone'],
                data['r_name'], data['r_addr'], data['r_city'], data['r_phone'],
                data['c_desc'], data['c_weight'], data['c_dist'], data['c_amount'],
                shipment_id
            ))
            msg = "Shipment Updated Successfully!"
        else: # INSERT NEW
            cursor.execute('''
                INSERT INTO shipments (
                    sender_name, sender_address, sender_city, sender_phone,
                    receiver_name, receiver_address, receiver_city, receiver_phone,
                    courier_desc, weight, distance, total_amount, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data['s_name'], data['s_addr'], data['s_city'], data['s_phone'],
                data['r_name'], data['r_addr'], data['r_city'], data['r_phone'],
                data['c_desc'], data['c_weight'], data['c_dist'], data['c_amount'],
                'Booked'
            ))
            msg = "Shipment Added Successfully!"

        conn.commit()
        conn.close()
        return jsonify({'message': msg, 'status': 'success'})
    except Exception as e:
        return jsonify({'message': str(e), 'status': 'error'})

@app.route('/api/shipments', methods=['GET'])
def get_shipments():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shipments ORDER BY id DESC")
    rows = cursor.fetchall()
    shipments = [dict(row) for row in rows]
    conn.close()
    return jsonify(shipments)

@app.route('/api/shipment/<int:id>', methods=['GET'])
def get_shipment(id):
    conn = get_db()
    row = conn.execute("SELECT * FROM shipments WHERE id = ?", (id,)).fetchone()
    conn.close()
    if row:
        return jsonify(dict(row))
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/update_status', methods=['POST'])
def update_status():
    data = request.json
    conn = get_db()
    conn.execute("UPDATE shipments SET status = ? WHERE id = ?", (data['status'], data['id']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Status Updated'})

@app.route('/api/delete_shipment/<int:id>', methods=['DELETE'])
def delete_shipment(id):
    conn = get_db()
    conn.execute("DELETE FROM shipments WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Shipment Deleted'})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM shipments").fetchone()[0]
    delivered = conn.execute("SELECT COUNT(*) FROM shipments WHERE status='Delivered'").fetchone()[0]
    transit = conn.execute("SELECT COUNT(*) FROM shipments WHERE status='In Transit'").fetchone()[0]
    conn.close()
    return jsonify({'total': total, 'delivered': delivered, 'transit': transit})

def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000")

if __name__ == '__main__':
    init_db()
    Timer(1, open_browser).start()
    app.run(debug=True, use_reloader=False)