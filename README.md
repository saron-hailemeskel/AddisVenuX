# AddisVenuX — Feature Specification

> **Multi-Tenant Event Management & Digital Ticketing SaaS for Ethiopia**  
> *Powering Ethiopia's events, from discovery to digital entry.*

---

## Core Feature Overview

AddisVenuX provides a complete digital ticketing and event management ecosystem with two dedicated interfaces:
1. **Public Storefront** — Event discovery, filtering, and ticket purchasing for customers.
2. **Organizer Studio** — Protected multi-tenant workspace for event organizers to manage events, tiers, sales, and admissions.

---

## 1. Authentication & Role-Based Access Control (RBAC)

- **Secure User Authentication:**
  - Email and password registration & login.
  - Strong password hashing with bcrypt (no plain text storage).
  - Token-based authentication using JSON Web Tokens (JWT).
  - Secure session handling and route protection middleware.

- **Granular Roles & Permissions:**
  - **Customer:** Browse marketplace, purchase tickets, view order history, and access digital tickets.
  - **Organizer (Staff):** Manage organization events, set ticket tiers, view attendee lists, and scan/validate tickets.
  - **Organization Owner:** Full control over organization settings, staff invitations, role assignments, and revenue reports.
  - **Platform Administrator:** System-wide oversight, organization moderation, and platform analytics.

---

## 2. Multi-Tenant Architecture & Data Isolation

- **Independent Organization Workspaces:**
  - Each organization operates as an isolated tenant with its own staff, events, ticket inventory, orders, and sales metrics.
- **Tenant-Scoped Authorization:**
  - Strict resource ownership verification ensuring Organizers from Organization A can never view, edit, or delete resources belonging to Organization B.
- **Team Management:**
  - Invite team members to an organization with designated permissions (Owner vs. Staff).

---

## 3. Event Management Lifecycle

- **Comprehensive Event Details:**
  - Event title, description, category (Tech, Music, Culture, Business, etc.), venue name, city, address, start/end dates, start/end times, and cover banner image.
- **Lifecycle State Machine:**
  - **`DRAFT`:** Event being configured; invisible to the public.
  - **`PUBLISHED`:** Live on the public marketplace and open for ticket sales.
  - **`CANCELLED`:** Sales stopped, event flagged as cancelled.
  - **`COMPLETED`:** Event concluded, archived with post-event reporting.
- **Organizer Ownership Protection:**
  - All event mutation operations strictly require matching organization ownership.

---

## 4. Multi-Tier Ticketing & Inventory Management

- **Flexible Ticket Tiers:**
  - Multiple ticket tiers per event (e.g., Early Bird, Regular, VIP, VVIP).
  - Independent pricing per tier in Ethiopian Birr (ETB).
  - Total capacity limits defined per tier.
- **Real-Time Inventory Tracking:**
  - Dynamic tracking of total inventory vs. available (remaining) inventory.
  - Automated tier status handling (Available, Sold Out).

---

## 5. Concurrency-Safe Purchasing Engine (Zero Overselling)

- **Atomic Database Transactions:**
  - Prevents race conditions when multiple customers attempt to purchase the last available ticket at the exact same millisecond.
  - Inventory check and decrement execute within an atomic transaction.
- **Strict Availability Guarantees:**
  - Enforces database-level constraints (`available_tickets >= 0`).
  - Guarantees zero negative inventory and eliminates duplicate sales for the same ticket seat/spot.
  - Immediate user feedback: `SUCCESS` for the valid purchaser and graceful `SOLD OUT` for concurrent requests.

---

## 6. Order Management

- **Multi-Item Checkout:**
  - Support for purchasing multiple tickets across different tiers within a single order (e.g., 2 Regular + 1 VIP).
- **Order Calculation & Summary:**
  - Automatic subtotal, fees (if applicable), and total amount calculations in ETB.
- **Order State Tracking:**
  - **`PENDING`:** Order initiated during checkout.
  - **`CONFIRMED`:** Payment/reservation successful; digital tickets generated.
  - **`CANCELLED`:** Order abandoned or revoked.
  - **`EXPIRED`:** Uncompleted reservation window lapsed.
- **Customer Order History:**
  - Personal dashboard for customers to review past and upcoming event orders.

---

## 7. Digital Tickets

- **Automated Ticket Issuance:**
  - Instant ticket generation upon confirmed order.
  - Unique cryptographic ticket identifier generated for every single ticket.
- **Validation Codes & QR Codes:**
  - Scannable QR code and human-readable alphanumeric verification code per ticket.
- **Individual Ticket States:**
  - **`VALID`:** Unused and eligible for event entry.
  - **`USED`:** Already checked in at the event venue.
  - **`CANCELLED`:** Voided or refunded.
- **Digital Pass View:**
  - Clean, mobile-friendly digital ticket view displaying event details, venue, tier, attendee name, and verification QR code.

---

## 8. On-Site Ticket Validation & Door Check-In

- **Single-Use Check-In:**
  - Door staff can scan the QR code or enter the verification code.
  - The system instantly verifies ticket validity, event match, and admission status.
  - Upon successful verification, the ticket status changes immediately from `VALID` to `USED`.
- **Anti-Fraud & Duplicate Prevention:**
  - Any subsequent attempt to scan or enter an already `USED` ticket is immediately rejected with a duplicate entry warning and timestamp.

---

## 9. Event Discovery & Public Marketplace

- **Full-Text Keyword Search:**
  - Search events by title, description, or tags.
- **Multi-Parameter Filtering:**
  - **Category:** Filter by event type (Technology, Music, Cultural, Arts, Networking, Sports, etc.).
  - **Location:** Filter by city (Addis Ababa, Hawassa, etc.) or specific venue.
  - **Date Range:** Filter by Today, This Weekend, This Month, or custom date ranges.
  - **Price Range:** Free vs. Paid, or custom min/max ETB price.
- **Sorting & Pagination:**
  - Sort by upcoming date, price (low-to-high, high-to-low), and recently published.
  - Server-side pagination for optimal performance.

---

## 10. Organizer Studio & Analytics Dashboard

- **Centralized Management Hub:**
  - High-level overview of active events, total revenue, tickets sold, and check-in rates.
- **Live Sales & Inventory Monitoring:**
  - Tier-by-tier sales breakdown and real-time inventory remaining.
- **Attendee Roster:**
  - Searchable list of registered attendees, ticket tier, order ID, and real-time check-in status.

---

## 11. Platform Administration

- **System Oversight:**
  - Moderate public event listings and flagged content.
  - Platform-wide statistics (total organizations, total events, GMV, total tickets sold).
  - Manage and inspect registered organizations and users.
