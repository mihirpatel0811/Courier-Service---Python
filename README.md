# 📦 GoParcel Logistics Management System

"GoParcel" is a Python Flask-based logistics system featuring a modern Glassmorphism UI. It streamlines operations through an admin dashboard, automated cost calculation, and real-time visual tracking. The project utilizes SQLite for storage and generates dynamic A4 invoices.

![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.0+-green?style=for-the-badge&logo=flask)
![Frontend](https://img.shields.io/badge/Glassmorphism-UI-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

> **GoParcel** is a full-stack web application designed to digitize and automate the manual processes of a courier service provider. 

The system serves as a centralized **Admin Portal** that facilitates shipment booking, automated cost calculation, real-time status updates, and invoice generation. It features a modern, high-performance frontend utilizing **Glassmorphism** design principles for an immersive user experience.

---

---

## 🚀 Key Features

* **🧠 Smart Booking Engine:** Automatically calculates shipping costs based on weight, distance, and standard GST rates.
* **📍 Live Tracking System:** Visual timeline (progress bar) that updates statuses: *Booked → In Transit → Out for Delivery → Delivered*.
* **📊 Interactive Dashboard:** Statistical overview of Total Shipments, Active Transit, and Delivered items using Chart.js.
* **📄 Automated Invoicing:** Generates detailed, printable A4 invoices dynamically (UI elements hide automatically during printing).
* **✨ Glassmorphism UI:** A futuristic interface using transparency, blur filters (`backdrop-filter`), and sophisticated gradients.
* **📝 CRUD Operations:** Administrators can View, Edit, and Delete shipment records efficiently.

---

## 🛠️ Technologies Used

### Backend
* **Python 3.x:** Core programming language.
* **Flask Framework:** Handles API routes and business logic.
* **SQLite3:** Serverless database for managing shipment and user data.

### Frontend
* **HTML5 & CSS3:** Semantic structure with advanced animations.
* **Tailwind CSS:** Utility-first framework for responsive styling.
* **JavaScript (ES6):** Client-side logic and DOM manipulation.
* **Chart.js:** Data visualization for the dashboard.
* **AJAX / Fetch API:** Asynchronous data transport (JSON).

---

## ⚙️ Setup and Installation

Follow these steps to get GoParcel running on your local machine.

### Prerequisites
* Python 3.x installed.
* `pip` (Python Package Installer).

### Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/YourUsername/GoParcel.git](https://github.com/YourUsername/GoParcel.git)
    cd GoParcel
    ```

2.  **Install Dependencies**
    ```bash
    pip install flask
    # If you have a requirements.txt file, use: pip install -r requirements.txt
    ```

3.  **Initialize the Database**
    Run the script to create tables and schema.
    ```bash
    python Database.py
    ```

4.  **Run the Application**
    Start the Flask server.
    ```bash
    python App.py
    ```

5.  **Access the Portal**
    Open your browser and navigate to:
    `http://127.0.0.1:5000`

---

## 🔑 Usage

### Admin Login Credentials
The system is protected by a secure login gateway. Use the default credentials below:

| Role | Email ID | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin.17193@gmail.com` | `admin@17193` |

### Core Workflows

1.  **Dashboard:** View real-time counters and shipment distribution charts immediately after login.
2.  **Booking:** Enter Sender/Receiver details. The price is calculated automatically:
    > **Formula:** `Total = (Base Rate + (Weight * 20) + (Distance * 10)) + 18% GST`
3.  **Tracking:** Use the generated **Shipment ID** (e.g., `MB_17193...`) in the Tracking section to view the live status timeline.
4.  **Invoicing:** Click "Generate Invoice" on any tracked shipment to view/print a tax-ready bill.

---

## 📂 Project Structure

```text
GoParcel/
├── static/
│   ├── css/            # Tailwind and Custom CSS
│   ├── js/             # Main logic and Chart.js config
│   └── images/         # Assets and icons
├── templates/
│   ├── index.html      # Login/Landing page
│   ├── dashboard.html  # Admin Dashboard
│   ├── booking.html    # Shipment entry form
│   └── invoice.html    # Printable invoice layout
├── App.py              # Main Flask Application
├── Database.py         # Database initialization script
├── database.db         # SQLite database file (created after init)
└── README.md           # Project Documentation
