
# -----------------------------------------
# Import Libraries and Setup
# -----------------------------------------

import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL

# Initialize Flask app
app = Flask(__name__)

# Configure MySQL connection
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'cmp210'

# Initialize MySQL extension
mysql = MySQL(app)

# -----------------------------------------
# Page Routes (HTML pages)
# -----------------------------------------

# Route: /home
# Method: GET
# Purpose: Render the home page (index.html)
@app.route('/home')
def home_page():
    return render_template('index.html')

# Route: /admin
# Method: GET
# Purpose: Render the admin panel page
@app.route('/admin')
def admin_page():
    return render_template('admin.html')

# Route: /users
# Method: GET
# Purpose: Render the user management page
@app.route('/users')
def users_page():
    return render_template('users.html')

# Route: /product
# Method: GET
# Purpose: Render a specific product details page
@app.route('/product')
def product_page():
    return render_template('product.html')

# -----------------------------------------
# API Routes for Products
# -----------------------------------------

# Route: /api/products
# Method: GET
# Purpose: Return all products
@app.route('/api/products', methods=['GET'])
def get_products():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, name, price, stock FROM store")
    rows = cursor.fetchall()
    cursor.close()
    products = [{"id": row[0], "name": row[1], "price": float(row[2]), "stock": row[3]} for row in rows]
    return jsonify(products)

# (Continuing with more after this)

# Route: /api/products
# Method: POST
# Purpose: Add a new product to the store
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

# Route: /api/products/<product_id>
# Method: GET
# Purpose: Get a single product's full details by ID
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, name, price, stock, details, image_url FROM store WHERE id = %s", (product_id,))
    row = cursor.fetchone()
    cursor.close()

    if row:
        return jsonify({
            "id": row[0], "name": row[1], "price": float(row[2]),
            "stock": row[3], "details": row[4] or "", "image_url": row[5] or ""
        })
    else:
        return jsonify({"error": "🔍 Product not found."}), 404

# Route: /api/products/<product_id>
# Method: DELETE
# Purpose: Delete a product by ID (with confirmation)
@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    data = request.get_json()
    confirm = data.get('confirm')
    if confirm != "Y":
        return jsonify({"message": f"⚠️ Confirm deletion of product ID {product_id}."}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM store WHERE id = %s", (product_id,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"error": f"❌ Product ID {product_id} not found."}), 404

    cursor.execute("DELETE FROM store WHERE id = %s", (product_id,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"🗑️ Product ID {product_id} deleted."})

# Route: /api/products/name/<name>
# Method: DELETE
# Purpose: Delete a product by its name (with confirmation)
@app.route('/api/products/name/<string:name>', methods=['DELETE'])
def delete_product_by_name(name):
    data = request.get_json()
    confirm = data.get('confirm')
    if confirm != "Y":
        return jsonify({"message": f"⚠️ Confirm deletion of product named '{name}'."}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT name FROM store WHERE name = %s", (name,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"error": f"❌ Product named '{name}' not found."}), 404

    cursor.execute("DELETE FROM store WHERE name = %s", (name,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"🗑️ Product named '{name}' deleted."})

# Route: /api/products/all
# Method: DELETE
# Purpose: Delete all products from the store (with confirmation)
@app.route('/api/products/all', methods=['DELETE'])
def delete_all_products():
    data = request.get_json()
    confirm = data.get('confirm')
    if confirm != "Y":
        return jsonify({"message": "⚠️ Confirm deletion of ALL products."}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM store")
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "🧨 All products deleted."})

# Route: /api/products/<product_id>
# Method: PUT
# Purpose: Update a product's details
@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    stock = data.get('stock')
    details = data.get('details')
    image_url = data.get('image_url')

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM store WHERE id = %s", (product_id,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"error": f"❌ Product ID {product_id} not found."}), 404

    cursor.execute("""
        UPDATE store
        SET name = %s, price = %s, stock = %s, details = %s, image_url = %s
        WHERE id = %s
    """, (name, price, stock, details, image_url, product_id))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"✏️ Product ID {product_id} updated successfully."})

# Route: /api/products/bulk
# Method: POST
# Purpose: Add multiple products in bulk
@app.route('/api/products/bulk', methods=['POST'])
def add_bulk_products():
    data = request.get_json()
    products = data.get('products', [])

    cursor = mysql.connection.cursor()
    for product in products:
        cursor.execute(
            "INSERT INTO store (name, price, stock, details, image_url) VALUES (%s, %s, %s, %s, %s)",
            (product['name'], product['price'], product['stock'], product['details'], product['image_url'])
        )
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"✅ {len(products)} products added in bulk."})

# -----------------------------------------
# API Routes for Users
# -----------------------------------------

# Route: /api/users
# Method: GET
# Purpose: Return all users with passwords (for login check)
@app.route('/api/users', methods=['GET'])
def get_user_credentials():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT username, password FROM users")
    rows = cursor.fetchall()
    cursor.close()

    return jsonify([{"username": row[0], "password": row[1]} for row in rows])

# Route: /api/users/all
# Method: GET
# Purpose: Return all users (without passwords)
@app.route('/api/users/all', methods=['GET'])
def get_all_users():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, username FROM users WHERE username != 'rootadmin'")
    rows = cursor.fetchall()
    cursor.close()

    return jsonify([{"id": row[0], "username": row[1]} for row in rows])

# Route: /api/users
# Method: POST
# Purpose: Add a new user
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

# Route: /api/users/<user_id>
# Method: DELETE
# Purpose: Delete a user by ID (except rootadmin)
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if user_id == 999:
        return jsonify({"error": "❌ Cannot delete root admin."}), 403

    data = request.get_json()
    confirm = data.get('confirm')
    if confirm != "Y":
        return jsonify({"message": f"⚠️ Confirm deletion of user ID {user_id}."}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"error": f"❌ User ID {user_id} not found."}), 404

    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": f"🗑️ User ID {user_id} deleted."})

# Route: /api/users/<user_id>/password
# Method: PUT
# Purpose: Update a user's password
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

# -----------------------------------------
# Main Run
# -----------------------------------------

# Start the Flask development server
if __name__ == '__main__':
    app.run(debug=True)
