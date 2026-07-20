# 🌿 GreenCart
### Direct Farmer-to-Consumer Agricultural Marketplace

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)](https://www.java.com)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.14-brightgreen?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)](https://www.mysql.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=flat-square&logo=github)](https://github.com/asgar-asgar/GreenCart)

> **Eliminating middlemen. Empowering farmers. Delivering fresh.**
> A farmer lists produce. A consumer orders it. No one takes a cut in between.

---

## 📌 The Problem We Solve

In traditional agricultural supply chains, farmers receive only **15–20%** of the final retail price.
A farmer sells tomatoes at ₹5/kg. The consumer pays ₹40/kg. **₹35 goes to middlemen.**

GreenCart removes that chain entirely.

---

## ✨ Features at a Glance

| Role | Capabilities |
|------|-------------|
| 🧑‍🌾 **Farmer** | Register → List products with images → Manage incoming orders → Track delivery status → View earnings analytics |
| 🛒 **Consumer** | Register → Browse marketplace → Filter by category & city → Add to cart → Place order → Track order → View savings |
| 🌐 **Public** | View platform impact stats without login |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Frontend)                   │
│         HTML5  ·  CSS3  ·  Vanilla JavaScript           │
│   index.html · farmer.html · consumer.html · stats.html │
└───────────────────────┬─────────────────────────────────┘
                        │  HTTP / JSON  (Fetch API)
┌───────────────────────▼─────────────────────────────────┐
│              SPRING BOOT APPLICATION                    │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   config/   │  │  controller/ │  │     dto/      │  │
│  │─────────────│  │──────────────│  │───────────────│  │
│  │ Security    │  │ AuthCtrl     │  │ LoginRequest  │  │
│  │ Config      │  │ ProductCtrl  │  │ RegisterReq   │  │
│  │ WebConfig   │  │ OrderCtrl    │  │ ProductReq    │  │
│  └─────────────┘  └──────┬───────┘  │ OrderRequest  │  │
│                           │          └───────────────┘  │
│                  ┌────────▼────────┐                    │
│                  │   service/      │                    │
│                  │─────────────────│                    │
│                  │ UserService     │                    │
│                  │ ProductService  │                    │
│                  │ OrderService    │                    │
│                  └────────┬────────┘                    │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  repository/    │                    │
│                  │─────────────────│                    │
│                  │ UserRepo        │                    │
│                  │ ProductRepo     │                    │
│                  │ OrderRepo       │                    │
│                  │ OrderItemRepo   │                    │
│                  └────────┬────────┘                    │
│                           │  Spring Data JPA            │
│                  ┌────────▼────────┐                    │
│                  │   entity/       │                    │
│                  │─────────────────│                    │
│                  │ User            │                    │
│                  │ Product         │                    │
│                  │ Order           │                    │
│                  │ OrderItem       │                    │
│                  └────────┬────────┘                    │
└───────────────────────────┼─────────────────────────────┘
                            │  Hibernate ORM
┌───────────────────────────▼─────────────────────────────┐
│                    MySQL DATABASE                        │
│                      (farmdb)                           │
│                                                         │
│   users ──────── products                              │
│     │                │                                  │
│     └──── orders ────┘                                  │
│               │                                         │
│           order_items                                   │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│               uploads/products/                         │
│          (Product images - local filesystem)            │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```sql
users           products            orders          order_items
─────────       ────────────        ──────────      ───────────
id (PK)         id (PK)             id (PK)         id (PK)
name            name                consumer_id FK  order_id FK
email           description         deliveryAddress product_id FK
password        price               totalAmount     quantity
mobile          quantity            status          price
address         category            createdAt
role            imagePath
                availability
                farmer_id FK → users
```

**Relationships:**
- `User (FARMER)` → has many → `Products`
- `User (CONSUMER)` → has many → `Orders`
- `Order` → has many → `OrderItems`
- `OrderItem` → belongs to → `Product`

---

## 🔄 Order Lifecycle

```
Consumer places order
        │
        ▼
  ORDER_PLACED  ──→  OUT_FOR_DELIVERY  ──→  DELIVERED ✅
  (auto set)         (Farmer action)         (Farmer action)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.5.14 |
| Security | Spring Security (Session-based) |
| Data Access | Spring Data JPA + Hibernate ORM |
| Database | MySQL 8.0 |
| Build Tool | Apache Maven |
| Server | Embedded Apache Tomcat 10 |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| API Testing | Postman |
| IDE | IntelliJ IDEA |

---

## 📁 Project Structure

```
GreenCart/
├── src/
│   ├── main/
│   │   ├── java/com/farm/GreenCart/
│   │   │   ├── GreenCartApplication.java   ← Entry point
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java     ← Auth rules & BCrypt
│   │   │   │   └── WebConfig.java          ← Image serving & CORS
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java     ← /api/auth/**
│   │   │   │   ├── ProductController.java  ← /api/products/**
│   │   │   │   └── OrderController.java    ← /api/orders/**
│   │   │   ├── dto/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── ProductRequest.java
│   │   │   │   └── OrderRequest.java
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── Product.java
│   │   │   │   ├── Order.java
│   │   │   │   └── OrderItem.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── OrderRepository.java
│   │   │   │   └── OrderItemRepository.java
│   │   │   └── service/
│   │   │       ├── UserService.java
│   │   │       ├── ProductService.java
│   │   │       └── OrderService.java
│   │   └── resources/
│   │       ├── application.properties      ← DB config
│   │       └── static/                     ← Frontend files
│   │           ├── index.html              ← Login & Register
│   │           ├── farmer.html             ← Farmer Dashboard
│   │           ├── consumer.html           ← Consumer Marketplace
│   │           ├── stats.html              ← Public Stats Page
│   │           ├── css/
│   │           │   ├── style.css
│   │           │   ├── farmer.css
│   │           │   ├── consumer.css
│   │           │   └── stats.css
│   │           └── js/
│   │               ├── auth.js
│   │               ├── farmer.js
│   │               └── consumer.js
│   └── test/
├── uploads/
│   └── products/                           ← Uploaded product images
└── pom.xml
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- MySQL 8.0
- Maven 3.8+

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/GreenCart.git
cd GreenCart
```

### 2. Create the Database

```sql
CREATE DATABASE farmdb;
```

### 3. Configure application.properties

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/farmdb
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
server.port=8080
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.web.resources.static-locations=classpath:/static/,file:uploads/
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

### 5. Open in Browser

```
http://localhost:8080
```

> Tables are auto-created by Hibernate on first run. No manual SQL setup needed.

---

## 🔌 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/register` | Register new user | Public |
| `POST` | `/login` | Login and create session | Public |
| `POST` | `/logout` | Invalidate session | Required |
| `GET` | `/me` | Get current user details | Required |

### Products — `/api/products`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/add` | Add new product with image | FARMER |
| `GET` | `/` | Get all available products | Public |
| `GET` | `/my` | Get farmer's own products | FARMER |
| `GET` | `/search?keyword=` | Search by product name | Public |
| `GET` | `/by-city?city=` | Filter by farmer city | Public |

### Orders — `/api/orders`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/place` | Place a new order | CONSUMER |
| `GET` | `/my` | Get consumer's orders | CONSUMER |
| `GET` | `/incoming` | Get farmer's orders | FARMER |
| `PUT` | `/{id}/out-for-delivery` | Update order status | FARMER |
| `PUT` | `/{id}/deliver` | Mark order delivered | FARMER |

---

## 💡 Key Design Decisions

**Why Session-based Auth over JWT?**
Frontend and backend are served from the same origin (Spring Boot embedded server). Sessions are simpler, sufficient and more secure for this setup. JWT would add complexity without benefit here.

**Why Vanilla JS over React/Angular?**
Zero build tooling. Zero dependency conflicts. Works on any machine with a browser. The UI logic is straightforward enough that a framework adds overhead without value.

**Why local filesystem for images?**
Appropriate for a prototype and development environment. Production migration path is clear: swap `ProductService` image handling to use AWS S3 without touching any other layer.

**Why MVC layering with DTO separation?**
Controller never contains business logic. Service never directly touches HTTP context. DTO protects entity internals from API surface. Each layer is independently testable and replaceable.

---

## 📊 Economic Impact Model

GreenCart calculates savings using a **40% middleman markup assumption** — the average margin extracted by traditional agricultural supply chains.

```
Consumer Savings  = Total Spent × 0.40
Farmer Extra Income = Total Revenue × 0.40
Traditional Market Cost = GreenCart Price × 1.40
```

---

## 🔮 Roadmap

- [ ] Android mobile app (Flutter on same REST API)
- [ ] Razorpay / PayTM payment gateway
- [ ] WebSocket real-time order notifications
- [ ] GPS-based proximity filtering
- [ ] Rating and review system
- [ ] Multilingual support (Hindi first)
- [ ] Admin dashboard
- [ ] Cloud deployment (AWS / Azure)
- [ ] AI-based price recommendation

---

## 👥 Team

| Name | Role |
|------|------|
| [Asgar Ali] | Backend — Spring Boot, MySQL, APIs |
| [Abhinav Patel] | [Frontend - JS, HTML, CSS] |



<div align="center">
  <strong>🌿 GreenCart — Farm Fresh, Direct to You</strong><br>
  Built with Java · Spring Boot · MySQL
</div>
