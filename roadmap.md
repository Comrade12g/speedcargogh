# Speed Cargo operations system — roadmap

## Phase 1 — Database (in progress)
- [ ] Schema: customers, containers, shipments, warehouse_events, clearing_records, deliveries, invoices
- [ ] notification_templates (editable wording) + notifications log
- [ ] Auto tracking IDs (SPC-…), auto invoice at intake, stage-transition enqueue triggers
- [ ] staff role + RLS/grants
- [ ] Storage bucket for warehouse photos

## Phase 2 — Core ops flow
- [ ] Public tracking lookup by Speed Cargo tracking ID (server route, safe fields only)
- [ ] Staff/ops console: intake, Yiwu receiving (photo), container assignment, ocean status, clearing, Spintex arrival, delivery dispatch
- [ ] Invoice editing (freight/clearing/delivery fees)

## Phase 3 — WhatsApp notifications
- [ ] Sender using WhatsApp Cloud API (secrets WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN)
- [ ] Admin notification log view with resend
- [ ] Template editor

## Done
- [x] Tracking page now embeds the Jiandaoyun tracking form

## Keep intact
Company info, office/warehouse management, daily rate sheet, existing site content CMS.
