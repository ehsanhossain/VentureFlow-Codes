2. Purpose & Goals

We already have structured Buyer and Seller master data in the application.
This module will use that data to:

Visualize all ongoing M&A opportunities in a kanban-style deal pipeline.

Track progress from sourcing to success using standardized M&A stages (Buyer & Seller side).

Provide a dashboard view for executives to monitor:

Expected transaction value

Number of active deals

Late-stage deals

Average progress and velocity

Serve as the central cockpit for M&A execution teams (TVC/TCG) to coordinate work.

The UI layout and stage design should follow the reference screenshot in the Deal Pipeline PDF:

Left: vertical list of stages

Top: dashboard KPI cards

Center/right: kanban board with columns per stage and cards per deal

3. Users & Roles

M&A Advisor / Analyst

Creates and updates deals.

Moves cards across stages.

Edits deal details (value, PIC, status, notes).

Partner / Director / COO

Views dashboard KPIs.

Reviews pipeline by stage, value, and status.

Filters deals by region, sector, PIC.

Support Staff (Admin / Coordinator)

Manages stage configurations.

Manages permissions.

Updates master data (buyers, sellers).

4. Core Concepts
4.1 Deal

A Deal is a relationship between a Buyer and a Seller (or target company) with:

Buyer (linked to existing Buyer table)

Seller / Target (linked to existing Seller table)

Deal name (e.g., “SunRise MGL B – Amazing Logistics S”)

Industry

Region / Country

Estimated Enterprise Value (EV) – e.g., $85M

Stage (K…A – see below)

Progress (%) – e.g., 25%

Priority: Low / Medium / High

PIC (Person in Charge)

Target timeline (e.g., “Target: Q4 2024”)

Status: Active, On Hold, Lost, Won

4.2 Stage Model (Buyer-Side)

Use alphabet code + label (like screenshot): 

Deal Pieline

K – Buyer Sourcing

K1: Look for current seller side’s requirements

K2: Look for prospects from parents, network, database

J – Onboarding

J1: Sign NDA with TCF/TVC & get buyer data

J2: Engagement Letter / Mandate Agreement

J3: Register buyer in VentureFlow

I – Target Sourcing

H – Interest Check

G – NDA & IM Delivery

F – Top Meeting & IOI

E – LOI / Exclusivity

D – Due Diligence

C – SPA Negotiation

B – Deal Closing

A – Success

(For future, same engine can support Seller-side view with mirrored stages.)

5. UI / UX Requirements (for Antigravity)
5.1 Layout (follow screenshot reference)

Top Navigation Bar

Page title: “Deal Pipeline”

Search bar (global search for deals)

“+ Create New Deal” primary button (top-right)

Left Sidebar – Pipeline Workflow

Section label: “Pipeline Workflow”

Toggle buttons: “Buyer Side Stages” / “Seller Side Stages” (for future)

List of stages, from K to A, vertically:

Each stage row shows:

Stage Code + Name (e.g., “K Buyer Sourcing”)

Badge with deal count (e.g., “3” deals)

Expand / Collapse icon to show sub-steps (K1, K2 etc.)

When a stage is selected, its column on the kanban is highlighted.

Top Metrics – Dashboard

Section title: “Dashboard – Executive overview and team performance metrics”

KPI cards in a row (same style as screenshot):

Card 1: “Expected Transaction” – e.g., $875M + small delta text like +1.01% this week

Card 2: “Velocity Score” – numeric + weekly change

Card 3: “Active Deals”

Card 4: “Late Stage”

Card 5: “Avg Progress”

KPI cards should be clickable to filter the board (e.g., clicking “Late Stage” filters to LOI/DD/SPA/Closing).

Main Content – Deal Board (Kanban)

Tab options:

“Deal Board” | “Table View” | “Analysis”

Default: “Deal Board”

Kanban Columns

One column per stage (K → A), horizontally scrollable.

Each column header shows:

Stage Code & Name (e.g., “K Buyer Sourcing”)

Deal count badge

Deal Card Design (similar to screenshot) 

Deal Pieline

Top line: Buyer logo avatar + buyer short name (e.g., “SunRise MGL B”)

Below: “Acquiring” label + target company name (e.g., “Amazing Logistics S”)

Info section:

Industry text (e.g., “Industry: Logistics”)

Deal size text (e.g., “~$85M”)

PIC name and target closing (e.g., “PIC: Sule / Target: Q4 2024”)

Priority badge (Low/Medium/High)

Progress bar with % (e.g., 25%)

Footer icons:

Comment count

Attachment count

Last updated date or relative time

Cards must be draggable to move between stages.

6. Functional Requirements
6.1 Deal Creation

“+ Create New Deal” button opens a modal:

Step 1: Select Buyer (search existing buyers)

Step 2: Select Seller / Target (search existing sellers)

Step 3: Enter:

Deal Name (auto-suggest “{Buyer} – {Seller}”)

Industry (from seller)

Estimated EV (numeric + currency)

Stage (default = K Buyer Sourcing)

PIC (select from user list)

Priority

Target Closing Date

Primary CTA: “Create Deal”

6.2 Stage Movement

Drag & drop card from one column to another.

On drop:

Update stage and progress %.

Create an activity log entry (e.g., “Moved from NDA & IM Delivery to LOI / Exclusivity by Ehsan on 2025-12-11.”)

Trigger any automation/webhooks if needed.

6.3 Progress Calculation

Each stage should have a default progress range:

K: 5%

J: 10%

I: 20%

H: 30%

G: 40%

F: 50%

E: 65%

D: 80%

C: 90%

B: 95%

A: 100%

Progress % should update automatically on stage change, but user can override manually (with permissions).

6.4 Dashboard Metrics Logic

Expected Transaction

Sum of Estimated EV for all Active deals (exclude Lost or Closed without success).

Velocity Score

Approximate formula:

Average number of stage transitions per active deal over last X days (e.g., 30 days).

Display as single number + weekly change vs previous period.

Active Deals

Count of deals with status = Active.

Late Stage

Count of deals currently at stages E, D, C, B (LOI–Closing).

Avg Progress

Average of progress % across all active deals.

6.5 Filtering & Search

Global search (top) – search by:

DealName, BuyerName, SellerName, Industry, Country.

Filters (above kanban):

Stage

PIC

Country / Region

Industry

Buyer Type (Strategic / Financial)

Deal Size range

6.6 Deal Detail View

Clicking a card opens a Deal Detail drawer or full-page view:

Summary tab (high-level details + current stage)

Activity log (stage changes, comments)

Documents (LOI, NDA, IM, SPA, DD reports)

Tasks & Notes

Timeline (Gantt-like view of key milestones)

7. Data Model (High-Level)

Use existing Buyer and Seller tables; add new tables/fields as below.

7.1 Tables

deals

id (PK)

buyer_id (FK → buyers)

seller_id (FK → sellers)

name

industry

region

estimated_ev_value

estimated_ev_currency

stage_code (K…A)

progress_percent

priority (low, medium, high)

pic_user_id

target_close_date

status (active / on_hold / lost / won)

created_at, updated_at

deal_stage_history

id

deal_id

from_stage

to_stage

changed_by_user_id

changed_at

deal_documents

id

deal_id

document_type (NDA, IM, LOI, SPA, DD_REPORT, OTHER)

file_path / URL

uploaded_by

uploaded_at

deal_comments

id

deal_id

comment_body

commented_by

created_at

8. Analytics & G4A Integration

Event Tracking

Track events such as:

Deal created

Stage changed

Deal marked as lost / won

KPI filter used

Push these to G4A / analytics layer as events with properties:

deal_id, stage, industry, region, user_role, etc.

Funnels

Build funnel reports:

Buyer Sourcing → Onboarding → Target Sourcing → … → Success

Conversion rate per stage.

Cohort Analysis

Group deals by created month and track how many reached LOI, DD, SPA, Success.

Marketing Keywords for TVC Website (for later SEO)

M&A deal pipeline software

cross-border M&A CRM

buy-side and sell-side deal management

M&A pipeline analytics

VentureFlow deal board

9. Non-Functional Requirements

Must support multi-region and multi-currency (USD, JPY, THB, etc.).

Performance: pipeline view should load within 3 seconds for up to 500 active deals.

Role-based permissions:

Some users view-only, others can move stages or edit deals.

Audit: all stage changes and key field edits should be logged.

10. Acceptance Criteria (Checklist)

User can create a new deal linking existing buyer & seller.

Deals are visible as cards under the correct stage column.

User can drag & drop a card to another stage; stage and progress update.

Dashboard shows the 5 KPIs and they are calculated correctly.

Filters and search work as expected.

Deal detail view shows summary, docs, comments, and activity history.

Basic events are sent to analytics / G4A endpoint (or queued for integration).

UI visually resembles the reference screenshot layout (sidebar + KPIs + kanban).