# ==========================
# 📦 Flask App Configuration
# ==========================

import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_mysqldb import MySQL
from functools import wraps

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Set a proper key in production

# DB connection settings
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'cmp210'

mysql = MySQL(app)

# ==========================
# 🔐 Session Check & Logout
# ==========================

def is_logged_in():
    return session.get('logged_in') is True

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login_page'))

# ==========================
# 🌐 Page Routes
# ==========================

@app.route('/home')
def home_page():
    return render_template('index.html')

@app.route('/admin')
def admin_page():
    if not is_logged_in():
        return redirect(url_for('login_page'))
    return render_template('admin.html')

@app.route('/users')
def users_page():
    if not is_logged_in():
        return redirect(url_for('login_page'))
    return render_template('users.html')

@app.route('/product')
def product_page():
    return render_template('product.html')

@app.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    uname = data.get('username')
    pword = data.get('password')

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (uname, pword))
    user = cursor.fetchone()
    cursor.close()

    if user:
        session['logged_in'] = True
        return jsonify({"message": "✅ Login successful"})
    else:
        return jsonify({"error": "❌ Invalid credentials"}), 401

# ==========================
# 📦 Product API
# ==========================

@app.route('/api/products', methods=['GET'])
def get_products():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, name, price, stock FROM store")
    rows = cursor.fetchall()
    cursor.close()
    products = [{"id": r[0], "name": r[1], "price": float(r[2]), "stock": r[3]} for r in rows]
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json()
    cursor = mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO store (name, price, stock, details, image_url) VALUES (%s, %s, %s, %s, %s)",
        (data.get('name'), data.get('price'), data.get('stock'),
         data.get('details'), data.get('image_url', ''))
    )
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": "✅ Product added!"}), 201

@app.route('/api/products/<int:pid>', methods=['GET'])
def get_product_by_id(pid):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, name, price, stock, details, image_url FROM store WHERE id = %s", (pid,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        return jsonify({
            "id": row[0], "name": row[1], "price": float(row[2]),
            "stock": row[3], "details": row[4] or "", "image_url": row[5] or ""
        })
    return jsonify({"error": "🔍 Product not found."}), 404

@app.route('/api/products/<pid>', methods=['DELETE'])
def delete_product(pid):
    data = request.get_json()
    if data.get('confirm') != "Y":
        return jsonify({"message": f"⚠️ Confirm deletion of product ID {pid}."}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM store WHERE id = %s", (pid,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"error": f"❌ Product ID {pid} not found."}), 404

    cursor.execute("DELETE FROM store WHERE id = %s", (pid,))
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": f"🗑️ Product ID {pid} deleted."})

@app.route('/api/products/name/<string:name>', methods=['DELETE'])
def delete_product_by_name(name):
    data = request.get_json()
    if data.get('confirm') != "Y":
        return jsonify({"message": f"⚠️ Confirm deletion of product named '{name}'."}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT name FROM store WHERE name = %s", (name,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"error": f"❌ Product '{name}' not found."}), 404

    cursor.execute("DELETE FROM store WHERE name = %s", (name,))
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": f"🗑️ Product '{name}' deleted."})

@app.route('/api/products/all', methods=['DELETE'])
def delete_all_products():
    data = request.get_json()
    if data.get('confirm') != "Y":
        return jsonify({"message": "⚠️ Confirm deletion of ALL products."}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM store")
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": "🧨 All products deleted."})

@app.route('/api/products/<int:pid>', methods=['PUT'])
def update_product(pid):
    data = request.get_json()
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM store WHERE id = %s", (pid,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"error": f"❌ Product ID {pid} not found."}), 404

    cursor.execute("""
        UPDATE store
        SET name = %s, price = %s, stock = %s, details = %s, image_url = %s
        WHERE id = %s
    """, (data['name'], data['price'], data['stock'], data['details'], data['image_url'], pid))
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": f"✏️ Product ID {pid} updated."})

@app.route('/api/products/bulk', methods=['POST'])
def bulk_add_products():
    data = request.get_json()
    cursor = mysql.connection.cursor()
    for p in data.get('products', []):
        cursor.execute(
            "INSERT INTO store (name, price, stock, details, image_url) VALUES (%s, %s, %s, %s, %s)",
            (p['name'], p['price'], p['stock'], p['details'], p['image_url'])
        )
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": f"✅ {len(data.get('products', []))} added."})

# ==========================
# 👥 User API
# ==========================

@app.route('/api/users', methods=['GET'])
def list_user_credentials():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT username, password FROM users")
    rows = cursor.fetchall()
    cursor.close()
    return jsonify([{"username": r[0], "password": r[1]} for r in rows])

@app.route('/api/users/all', methods=['GET'])
def list_users():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, username FROM users WHERE username != 'rootadmin'")
    rows = cursor.fetchall()
    cursor.close()
    return jsonify([{"id": r[0], "username": r[1]} for r in rows])

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()
    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)",
                   (data.get('username'), data.get('password')))
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": "✅ User added!"})

@app.route('/api/users/<int:uid>', methods=['DELETE'])
def delete_user(uid):
    if uid == 999:
        return jsonify({"error": "❌ Cannot delete root admin."}), 403

    data = request.get_json()
    if data.get('confirm') != "Y":
        return jsonify({"message": f"⚠️ Confirm deletion of user ID {uid}."}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM users WHERE id = %s", (uid,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"error": f"❌ User ID {uid} not found."}), 404

    cursor.execute("DELETE FROM users WHERE id = %s", (uid,))
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": f"🗑️ User ID {uid} deleted."})

@app.route('/api/users/<int:uid>/password', methods=['PUT'])
def update_user_password(uid):
    if uid == 999:
        return jsonify({"error": "❌ Cannot change rootadmin password."}), 403

    data = request.get_json()
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE users SET password = %s WHERE id = %s", (data['password'], uid))
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": f"🔑 Password updated for user ID {uid}."})

# ==========================
# 🚀 App Entry Point
# ==========================

if __name__ == '__main__':
    app.run(debug=True)
