# Software Requirements Specification (SRS)
## AddisVenuX — Multi-Tenant Event Management & Digital Ticketing SaaS for Ethiopia

**Document Version:** 1.0  
**Status:** Approved Specification  
**System Name:** AddisVenuX  
**Target Region:** Ethiopia  

---

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive Software Requirements Specification (SRS) for **AddisVenuX**, a multi-tenant Software-as-a-Service (SaaS) platform tailored for event organizers and attendees in Ethiopia. It outlines functional and non-functional requirements, data models, interface constraints, and verification criteria.

### 1.2 Scope
AddisVenuX provides:
- A public discovery and ticket purchasing storefront for attendees.
- A secured, multi-tenant Organizer Studio for event planners.
- A high-concurrency transactional engine guaranteeing zero ticket overselling.
- Digital ticket generation and rapid single-use QR validation for on-site gate check-in.
- Role-based access control and tenant isolation.

### 1.3 Definitions, Acronyms, and Abbreviations
- **ETB:** Ethiopian Birr (national currency).
- **JWT:** JSON Web Token used for stateless authentication.
- **RBAC:** Role-Based Access Control.
- **Tenant:** An independent organization utilizing AddisVenuX with isolated data.
- **Ticket Tier:** A specific pricing and admission category for an event (e.g., Early Bird, Regular, VIP).
- **Zero Overselling:** A technical guarantee that the number of tickets sold never exceeds the defined capacity under any concurrency condition.
- **QR Payload:** Cryptographically unique string embedded within a digital ticket QR code.

---

## 2. Overall Description

### 2.1 Product Perspective & Multi-Tenant Model
AddisVenuX operates as a multi-tenant SaaS. Organizations register as independent tenants on the platform:
```
                              AddisVenuX Platform
                                       |
                  +--------------------+--------------------+
                  |                                         |
         Tenant A: Addis Tech Events               Tenant B: Habesha Fest
                  |                                         |
     Members (Owner, Staff)                    Members (Owner, Staff)
                  |                                         |
     Events & Ticket Tiers                     Events & Ticket Tiers
                  |                                         |
     Orders & Tickets                          Orders & Tickets
```
- **Tenant Isolation Rule:** All organizer operations are strictly scoped by `organizationId`. An organizer belonging to Tenant A cannot view, query, or mutate resources belonging to Tenant B.

### 2.2 User Classes & Personas
1. **Public Customer / Attendee:**
   - Browses, searches, and filters events without mandatory authentication.
   - Registers/logs in to purchase tickets, track orders, and view digital ticket passes.
2. **Event Staff / Gate Scanner:**
   - Member of an organization with restricted operational permissions.
   - Accesses the event scanner to validate tickets at the door; cannot view organizational financial or configuration data.
3. **Organization Owner / Manager:**
   - Full control of their organization: creates events, manages ticket tiers, invites staff, monitors revenue and attendance analytics.
4. **Platform Administrator:**
   - Global administrator with cross-tenant visibility for moderation, dispute resolution, and system health monitoring.

### 2.3 Operating Environment
- **Server:** Node.js runtime (v18+ or v20+ LTS) running Express.js on Linux/Windows.
- **Database:** PostgreSQL (v14+) accessed through Prisma ORM.
- **Client Browsers:** Modern desktop and mobile browsers (Chrome, Safari, Firefox, Edge).
- **Mobile Access:** Mobile-optimized responsive web interfaces designed for low-bandwidth and variable latency mobile networks (3G/4G/LTE in Ethiopia).

---

## 3. Specific Functional Requirements

### 3.1 Module 1: Authentication & User Management
- **FR-AUTH-1 (User Registration):** The system shall allow users to register with `email`, `password`, `fullName`, and optional `phoneNumber`.
- **FR-AUTH-2 (Password Hashing):** The system shall hash all passwords using `bcrypt` (minimum 10 salt rounds) before database insertion. Plaintext passwords shall never be logged or stored.
- **FR-AUTH-3 (Login & Token Generation):** The system shall authenticate valid credentials and issue a signed JSON Web Token (JWT) containing the `userId` and platform role.
- **FR-AUTH-4 (Input Validation):** All authentication payloads must be validated against a strict Zod schema (valid email syntax, password minimum 8 characters).

### 3.2 Module 2: Multi-Tenancy & Organization Management
- **FR-ORG-1 (Create Organization):** Any authenticated user can create an organization by providing a unique name, slug, contact email, and optional phone/logo.
- **FR-ORG-2 (Automatic Ownership):** The creator of an organization is automatically assigned the `OWNER` role in `OrganizationMember`.
- **FR-ORG-3 (Member Management):** Organization Owners can invite or add members by email and assign roles (`ADMIN`, `STAFF`).
- **FR-ORG-4 (Tenant-Scoping Middleware):** Every organizer endpoint shall enforce ownership verification:
  $$\text{User} \in \text{OrganizationMember}(\text{organizationId}) \implies \text{Access Granted}$$
  Requests targeting unassociated tenant resources shall return `403 Forbidden`.

### 3.3 Module 3: Event Management Lifecycle
- **FR-EVT-1 (Event Creation):** Authorized organizers can create events specifying: `title`, `description`, `category`, `venueName`, `address`, `city` (default: "Addis Ababa"), `startDateTime`, `endDateTime`, and `bannerUrl`.
- **FR-EVT-2 (Lifecycle States):** Events shall follow a state machine:
  $$\text{DRAFT} \xrightarrow{\text{Publish}} \text{PUBLISHED} \xrightarrow{\text{Conclude}} \text{COMPLETED}$$
  $$\text{PUBLISHED} \xrightarrow{\text{Cancel}} \text{CANCELLED}$$
- **FR-EVT-3 (Public Visibility):** Only events with status `PUBLISHED` shall be queryable by public customer endpoints.
- **FR-EVT-4 (Event Modification):** Events can only be updated or cancelled by authorized members of the owning organization.

### 3.4 Module 4: Multi-Tier Ticketing & Inventory
- **FR-TCK-1 (Tier Configuration):** Organizers can define multiple ticket tiers per event (e.g., "Early Bird", "Regular", "VIP") with:
  - `name`: String
  - `price`: Decimal in ETB ($\ge 0.00$)
  - `totalCapacity`: Integer ($> 0$)
  - `availableCapacity`: Initially equal to `totalCapacity`
  - `maxPerOrder`: Integer (default: 5)
- **FR-TCK-2 (Tier Lifecycle):** Tiers automatically transition to `SOLD_OUT` when `availableCapacity = 0`. Organizers can also manually set status to `PAUSED`.

### 3.5 Module 5: Concurrency-Safe Purchasing & Orders
- **FR-ORD-1 (Cart & Multi-Item Orders):** Customers can purchase tickets across multiple tiers in a single order (e.g., 2 Regular + 1 VIP).
- **FR-ORD-2 (Concurrency-Safe Inventory Deduction):** The system must execute ticket purchasing inside an atomic database transaction.
  - The decrement must enforce a conditional check:
    $$\text{availableCapacity} \ge \text{requestedQuantity}$$
  - If the check fails, the transaction is immediately rolled back and the user receives a `409 Conflict` ("Ticket tier sold out or insufficient inventory").
- **FR-ORD-3 (Zero Overselling Guarantee):** Under high-concurrency traffic (e.g., 50 simultaneous requests for the last 2 tickets), the system shall guarantee that exactly 2 tickets are sold and `availableCapacity` remains $\ge 0$.
- **FR-ORD-4 (Order Statuses):** Orders support states: `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`.

### 3.6 Module 6: Digital Ticket Generation & Issuance
- **FR-TKT-1 (Individual Ticket Generation):** Upon order confirmation, the system creates an individual `Ticket` record for every unit purchased (e.g., 3 tickets generate 3 rows).
- **FR-TKT-2 (Cryptographic Identifier & Code):** Each ticket must be assigned:
  - A human-readable alphanumeric code: `ticketCode` (e.g., `AVX-7K9P2`)
  - A secure validation string: `qrPayload` (UUID / HMAC signed token)
- **FR-TKT-3 (Customer Pass Retrieval):** Customers can retrieve their active tickets via `GET /api/tickets/my-tickets` with full event and venue details.

### 3.7 Module 7: Gate Check-In & Ticket Validation
- **FR-VAL-1 (Scan Lookup):** Door staff can submit either a `ticketCode` or `qrPayload` via `POST /api/tickets/validate`.
- **FR-VAL-2 (Single-Use Enforcement):**
  - If ticket status is `VALID`: The system atomically updates status to `USED`, records `checkedInAt = NOW()`, and sets `checkedInById = staff.userId`. Return success with attendee and tier information.
  - If ticket status is `USED`: The system rejects the entry with `409 Conflict` ("Ticket already used at [timestamp]").
  - If ticket is invalid or cancelled: The system rejects with `400 Bad Request`.

### 3.8 Module 8: Event Discovery & Search
- **FR-DSC-1 (Filtering):** The public endpoint `GET /api/events` shall accept query parameters:
  - `search`: Keyword matching against `title` and `description`.
  - `category`: Filter by event category (`TECH`, `MUSIC`, `CULTURE`, etc.).
  - `city`: Filter by city location.
  - `startDate` / `endDate`: Filter events within a date range.
  - `minPrice` / `maxPrice`: Filter by ticket tier pricing.
- **FR-DSC-2 (Pagination & Sorting):** Results shall support standard pagination (`page`, `limit`) and sorting (`sortBy=startDateTime`, `sortOrder=asc|desc`).

### 3.9 Module 9: Organizer Analytics & Dashboard
- **FR-ANL-1 (Summary Metrics):** The system shall compute total revenue, tickets sold, and check-in percentages per event.
- **FR-ANL-2 (Attendee Roster):** Organizers can view and export a list of attendees with their tier, order number, and check-in status.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Concurrency
- **NFR-PERF-1 (Response Latency):** Public event queries and search shall respond within $< 200\text{ ms}$ under normal load.
- **NFR-PERF-2 (Ticket Validation Latency):** Gate check-in validation shall complete in $< 100\text{ ms}$ to avoid door congestion.
- **NFR-PERF-3 (ACID Guarantees):** All inventory adjustments must satisfy strict ACID transactional criteria.

### 4.2 Security & Data Protection
- **NFR-SEC-1 (Tenant Isolation):** No query shall return records belonging to another tenant unless explicitly public (e.g., published events).
- **NFR-SEC-2 (Password Storage):** Plaintext passwords must never be stored, logged, or cached.
- **NFR-SEC-3 (Sanitization & Validation):** All inputs must be parsed and sanitized with Zod prior to controller handling.
- **NFR-SEC-4 (SQL Injection Prevention):** All database operations must utilize Prisma parameterized queries.

### 4.3 Reliability & Error Handling
- **NFR-REL-1 (Standard Error Format):** All API errors shall return a standardized JSON structure:
  ```json
  {
    "success": false,
    "message": "Human readable error description",
    "errors": [] 
  }
  ```
- **NFR-REL-2 (Graceful Degradation):** Under sold-out scenarios, the API must fail fast with clean HTTP 409 responses rather than unhandled server crashes (500).

---

## 5. Verification & Acceptance Criteria

| ID | Test Scenario | Acceptance Criteria |
| :--- | :--- | :--- |
| **AC-01** | User registration and login | Valid token returned; invalid password rejected; password verified hashed in DB. |
| **AC-02** | Multi-tenant event editing | Organizer A cannot update an event belonging to Organizer B (`403 Forbidden`). |
| **AC-03** | Concurrent ticket purchase | 20 simultaneous purchase requests for 5 remaining tickets result in exactly 5 confirmed tickets and 15 sold-out rejections. Available capacity equals 0. |
| **AC-04** | Single-use ticket validation | First scan returns `VALID` $\rightarrow$ `USED`. Second scan returns `ALREADY USED` with rejection code. |
| **AC-05** | Public event search | Returns only `PUBLISHED` events matching the category/search criteria with pagination metadata. |
