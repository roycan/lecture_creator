# REST API Integration - External Service Communication (PlantUML)

## Purpose
Detailed sequence diagram showing complete REST API integration patterns including payment processing, email notifications, and inventory synchronization with error handling.

## Rendering
**VS Code:** Install "PlantUML" extension (requires Java)  
**Online:** [plantuml.com/plantuml](http://www.plantuml.com/plantuml)  
**CLI:** `plantuml 08-rest-api-integration-plantuml.md`

## Diagram

```plantuml
@startuml RestAPIIntegration

title REST API Integration - External Services\n(Payment, Email, Inventory)

actor Customer
participant "Store App" as Store
database "SQLite DB" as DB
participant "Payment API\n(PayMongo/Stripe)" as Payment
participant "Email API\n(SendGrid)" as Email
participant "Inventory API\n(Supplier)" as Inventory

== Scenario 1: Checkout with Payment ==

Customer -> Store: POST /checkout\n{cart items, payment method}
activate Store #90EE90

Store -> DB: BEGIN TRANSACTION
activate DB #FFD700

Store -> DB: SELECT products\nWHERE id IN (cart items)
DB --> Store: Product details + stock

Store -> Store: Validate stock levels
note right: Check all items available

Store -> DB: INSERT INTO orders\n(user_id, total, status='pending')
DB --> Store: order.id = 42

Store -> DB: INSERT INTO order_items\n(order_id, product_id, qty)
DB --> Store: OK

Store -> DB: UPDATE products\nSET stock = stock - qty
DB --> Store: OK

Store -> DB: COMMIT TRANSACTION
deactivate DB

note right of Store
  Transaction complete
  Order saved locally
end note

Store -> Payment: POST /v1/payment-intents\nAuthorization: Bearer sk_...\n{\n  amount: 350.00,\n  currency: 'PHP',\n  metadata: {orderId: 42}\n}
activate Payment #87CEEB

Payment -> Payment: Create payment intent
note right: Generate client_secret\nfor client-side confirmation

Payment --> Store: 200 OK\n{\n  id: 'pi_123',\n  status: 'requires_action',\n  client_secret: 'pi_123_secret_xyz'\n}
deactivate Payment

Store --> Customer: Redirect to payment page\nwith client_secret
deactivate Store

Customer -> Payment: Complete payment\n(enter card, GCash, etc.)
activate Payment #87CEEB

Payment -> Payment: Process payment\nwith payment provider

Payment --> Customer: Payment successful
deactivate Payment

note over Payment,Store
  Asynchronous webhook
  (doesn't wait for customer)
end note

Payment -> Store: Webhook: POST /webhooks/payment\nX-Signature: sha256_...\n{\n  type: 'payment.succeeded',\n  data: {\n    id: 'pi_123',\n    metadata: {orderId: 42}\n  }\n}
activate Store #4ECDC4

Store -> Store: Verify webhook signature
note right: Security: verify\nwebhook is authentic

Store -> DB: UPDATE orders\nSET status = 'paid',\n    payment_id = 'pi_123'\nWHERE id = 42
activate DB #FFD700
DB --> Store: OK
deactivate DB

note right of Store
  Payment confirmed
  Now send email
end note

Store -> Email: POST /v3/mail/send\nAuthorization: Bearer SG.xxx\n{\n  to: 'customer@example.com',\n  from: 'noreply@store.com',\n  subject: 'Order Confirmation #42',\n  html: '<h1>Thank you!</h1>...'\n}
activate Email #FFA500

Email -> Email: Queue email for delivery

Email --> Store: 202 Accepted\n{messageId: 'msg_abc123'}
deactivate Email

Email -> Customer: 📧 Email: "Order Confirmation #42"

Store --> Payment: 200 OK\n(webhook processed)
deactivate Store

rect rgb(200, 230, 201)
  note over Customer,Inventory: ✅ SUCCESS: Order complete, payment processed, email sent
end rect

== Scenario 2: Automated Stock Reorder ==

note over Store,Inventory: Cron job runs: node scripts/check-stock.js

Store -> Store: Check low stock levels
activate Store #FFD700

Store -> DB: SELECT * FROM products\nWHERE stock < reorder_level
activate DB #FFD700
DB --> Store: [{id:5, name:'Skyflakes',\n  stock:3, reorder_qty:100}]
deactivate DB

Store -> Inventory: POST /api/v1/purchase-orders\nAuthorization: Bearer inv_key\n{\n  items: [{sku:'SKY-001', qty:100}],\n  deliveryAddress: '...',\n  requestedDelivery: '2024-11-18'\n}
activate Inventory #E1BEE7

Inventory -> Inventory: Create PO in\nsupplier system

Inventory --> Store: 201 Created\n{\n  id: 'PO-2024-001',\n  status: 'pending',\n  estimatedDelivery: '2024-11-15'\n}
deactivate Inventory

Store -> DB: INSERT INTO purchase_orders\n(supplier_po_id, product_id,\n quantity, status)
activate DB #FFD700
DB --> Store: OK
deactivate DB

Store -> Email: POST /v3/mail/send\n{\n  to: 'manager@store.com',\n  subject: 'Low Stock Alert',\n  html: 'PO created: PO-2024-001'\n}
activate Email #FFA500

Email --> Store: 202 Accepted
deactivate Email

Email -> Store: 📧 Email to manager

deactivate Store

rect rgb(255, 243, 224)
  note over Store,Inventory: ⚠️ REORDER: Purchase order sent to supplier
end rect

== Scenario 3: Delivery Webhook ==

note over Inventory,Store: Supplier delivers goods,\nsends webhook

Inventory -> Store: Webhook: POST /webhooks/inventory\n{\n  type: 'delivery.completed',\n  poId: 'PO-2024-001',\n  items: [{sku:'SKY-001', qty:100}]\n}
activate Store #4ECDC4

Store -> DB: SELECT * FROM purchase_orders\nWHERE supplier_po_id = ?
activate DB #FFD700
DB --> Store: {id:10, product_id:5,\n quantity:100}
deactivate DB

Store -> DB: UPDATE purchase_orders\nSET status = 'delivered',\n    delivered_at = NOW()
activate DB #FFD700
DB --> Store: OK
deactivate DB

Store -> DB: UPDATE products\nSET stock = stock + 100\nWHERE id = 5
activate DB #FFD700
DB --> Store: OK (stock: 3 → 103)
deactivate DB

Store -> DB: INSERT INTO audit_log\n(action='STOCK_RECEIVED',\n product_id=5,\n old_data={stock:3},\n new_data={stock:103})
activate DB #FFD700
DB --> Store: OK
deactivate DB

Store --> Inventory: 200 OK\n(webhook processed)
deactivate Store

rect rgb(200, 230, 201)
  note over Store,Inventory: ✅ SYNCED: Local inventory updated from supplier
end rect

== Error Scenario: Payment API Timeout ==

Customer -> Store: POST /checkout
activate Store #90EE90

Store -> DB: Create order (transaction)
activate DB #FFD700
DB --> Store: order.id = 43
deactivate DB

Store -> Payment: POST /v1/payment-intents
activate Payment #87CEEB

Payment --> Store: ❌ 504 Gateway Timeout
deactivate Payment

note right of Store #FFB6C1
  Payment API unreachable
  Order saved as 'pending'
  Implement retry later
end note

Store -> DB: UPDATE orders\nSET status = 'payment_failed'\nWHERE id = 43
activate DB #FFD700
DB --> Store: OK
deactivate DB

Store --> Customer: Error page:\n"Payment temporarily unavailable.\nYour order is saved.\nPlease try again."
deactivate Store

rect rgb(255, 235, 238)
  note over Customer,Payment: ❌ ERROR: Payment API timeout\n(Order saved for retry)
end rect

@enduml
```

## Key Insights

1. **Four scenarios shown:**
   - **Success:** Complete checkout flow with payment and email
   - **Automation:** Cron job triggers reorder when stock low
   - **Webhook:** Supplier pushes delivery updates
   - **Error:** Payment API timeout handling

2. **Asynchronous patterns:**
   - Webhooks don't wait for customer
   - Email API returns 202 Accepted (queued, not sent yet)
   - Cron jobs run independently

3. **Transaction boundaries:**
   - Database transactions (yellow) are separate from API calls
   - API calls happen AFTER database commits
   - If API fails, database state is already saved

4. **Security:**
   - Authorization headers for all APIs
   - Webhook signature verification
   - API keys stored in environment variables

## Code Mapping

See `08-rest-api-integration-mermaid.md` for complete code including:
- Payment integration (PayMongo/Stripe)
- Email integration (SendGrid)
- Inventory integration (Supplier API)
- Webhook handlers with signature verification
- Error handling and retry logic
- Cron job for automated reordering

## Related Concepts
- Web App Basics Part 2C: External API integration
- REST API principles
- Webhook security
- Async/await patterns
- Error handling strategies
- Cron jobs and automation
