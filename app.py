import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL

app = Flask(__name__)

# MySQL Config
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'cmp210'

mysql = MySQL(app)

# ---------------------- HTML PAGE ROUTES ----------------------

@app.route('/home')
def home_page():
    return render_template('index.html')

@app.route('/admin')
def admin_page():
    return render_template('admin.html')

@app.route('/users')
def users_page():
    return render_template('users.html')

@app.route('/product')
def product_page():
    return render_template('product.html')


# ---------------------- PRODUCT API ROUTES ----------------------

@app.route('/api/products', methods=['GET'])
def get_products():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, name, price, stock FROM store")
    rows = cursor.fetchall()
    cursor.close()

    products = []
    for row in rows:
        products.append({
            "id": row[0],
            "name": row[1],
            "price": float(row[2]),
            "stock": row[3]
        })

    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    stock = data.get('stock')
    details = data.get('details')
    image_url = data.get('image_url', '')

    cursor = mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO store (name, price, stock, details, image_url) VALUES (%s, %s, %s, %s, %s)",
        (name, price, stock, details, image_url)
    )
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "✅ Product added successfully!"}), 201

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, name, price, stock, details, image_url FROM store WHERE id = %s", (product_id,))
    row = cursor.fetchone()
    cursor.close()

    if row:
        return jsonify({
            "id": row[0],
            "name": row[1],
            "price": float(row[2]),
            "stock": row[3],
            "details": row[4] or "",
            "image_url": row[5] or ""
        })
    else:
        return jsonify({"error": "🔍 Το προϊόν δεν βρέθηκε"}), 404

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    data = request.get_json()
    confirm = data.get('confirm')

    if confirm != "Y":
        return jsonify({
            "message": f"⚠️ You are about to delete product with ID {product_id}.",
            "hint": "Send again with { 'confirm': 'Y' } to proceed."
        }), 400

    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM store WHERE id = %s", (product_id,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"🗑️ Product ID {product_id} deleted."})

@app.route('/api/products/name/<string:name>', methods=['DELETE'])
def delete_product_by_name(name):
    data = request.get_json()
    confirm = data.get('confirm')

    if confirm != "Y":
        return jsonify({
            "message": f"⚠️ You are about to delete product named '{name}'.",
            "hint": "Send again with {{ 'confirm': 'Y' }} to proceed."
        }), 400

    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM store WHERE name = %s", (name,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"🗑️ Product named '{name}' deleted."})

@app.route('/api/products/all', methods=['DELETE'])
def delete_all_products():
    data = request.get_json()
    confirm = data.get('confirm')

    if confirm != "Y":
        return jsonify({
            "message": "⚠️ You are about to delete ALL products.",
            "hint": "Send again with { 'confirm': 'Y' } to proceed."
        }), 400

    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM store")
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "🧨 All products deleted."})

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    stock = data.get('stock')
    details = data.get('details')
    image_url = data.get('image_url')

    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE store
        SET name = %s, price = %s, stock = %s, details = %s, image_url = %s
        WHERE id = %s
    """, (name, price, stock, details, image_url, product_id))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"✏️ Product ID {product_id} updated successfully."})

@app.route('/api/products/bulk', methods=['POST'])
def add_bulk_products():
    data = request.get_json()
    products = data.get('products', [])

    cursor = mysql.connection.cursor()
    for product in products:
        name = product.get('name')
        price = product.get('price')
        stock = product.get('stock')
        details = product.get('details')
        image_url = product.get('image_url')

        cursor.execute(
            "INSERT INTO store (name, price, stock, details, image_url) VALUES (%s, %s, %s, %s, %s)",
            (name, price, stock, details, image_url)
        )

    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"✅ {len(products)} products added in bulk."})


# ---------------------- USER API ROUTES ----------------------

@app.route('/api/users', methods=['GET'])
def get_user_credentials():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT username, password FROM users")
    rows = cursor.fetchall()
    cursor.close()

    return jsonify([{"username": row[0], "password": row[1]} for row in rows])

@app.route('/api/users/all', methods=['GET'])
def get_all_users():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, username FROM users WHERE username != 'rootadmin'")
    rows = cursor.fetchall()
    cursor.close()

    return jsonify([{"id": row[0], "username": row[1]} for row in rows])

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "✅ User added!"})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if user_id == 999:
        return jsonify({"error": "❌ Cannot delete root admin."}), 403

    data = request.get_json()
    confirm = data.get('confirm')

    if confirm != "Y":
        return jsonify({
            "message": f"⚠️ Confirm deletion of user ID {user_id} with {{ 'confirm': 'Y' }}"
        }), 400

    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"🗑️ User ID {user_id} deleted."})

@app.route('/api/users/<int:user_id>/password', methods=['PUT'])
def change_user_password(user_id):
    if user_id == 999:
        return jsonify({"error": "❌ Cannot change rootadmin password here."}), 403

    data = request.get_json()
    new_password = data.get('password')

    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE users SET password = %s WHERE id = %s", (new_password, user_id))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"🔑 Password updated for user ID {user_id}."})


# ---------------------- MAIN ----------------------

if __name__ == '__main__':
    app.run(debug=True)
