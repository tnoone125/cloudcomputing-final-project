from flask import Flask, g, request, jsonify
import mysql.connector

app = Flask(__name__)
app.config.from_object(__name__)

app.config['MYSQL_HOST'] = 'mysql'
app.config['MYSQL_USER'] = 'todouser'
app.config['MYSQL_PASSWORD'] = 'p@ss123'
app.config['MYSQL_DB'] = 'todo'

@app.route("/api/items")
def get_items():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT what_to_do, due_date, status FROM entries')
    entries = cursor.fetchall()
    tdlist = [dict(what_to_do=row[0], due_date=row[1], status=row[2]) for row in entries]
    return jsonify(tdlist)

@app.route("/api/mark", methods=['PUT'])
def mark_as_done():
    item = request.json.get('item')
    query = "UPDATE entries SET status='done' WHERE what_to_do=%s"
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, (item,))
    db.commit()
    resp = jsonify(success=True)
    return resp

@app.route("/api/delete", methods=['DELETE'])
def delete_entry():
    item = request.json.get('item')
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM entries WHERE what_to_do=%s", (item,))
    db.commit()
    resp = jsonify(success=True)
    return resp

@app.route("/api/add", methods=['POST'])
def add_entry():
    data = request.json
    what_to_do = data.get('what_to_do')
    due_date = data.get('due_date')
    db = get_db()
    cursor = db.cursor()
    cursor.execute('INSERT INTO entries (what_to_do, due_date) VALUES (%s, %s)', (what_to_do, due_date))
    db.commit()
    resp = jsonify(success=True)
    return resp

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'mysql_db'):
        g.mysql_db = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DB']
        )
    return g.mysql_db

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'mysql_db'):
        g.mysql_db.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
