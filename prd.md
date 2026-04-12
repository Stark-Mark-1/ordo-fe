Ordo - Warm & Appetizing

Product Overview

The Pitch: Ordo is a frictionless, visually appetizing point-of-sale and storefront builder for independent food vendors. It turns chaotic order-taking into a streamlined, joyful process.

For: Pop-up chefs, food truck owners, and independent bakers who need to set up a menu and start taking orders in under three minutes.

Device: desktop

Design Direction: A soft, organic aesthetic using warm, food-adjacent tones like burnt orange and creamy off-white. Generous border radii and welcoming typography create a low-stress, approachable environment.

Inspired by: Toast POS, Omsom, Sweetgreen

Screens

Landing Page: High-conversion entry point with direct email signup



OTP Verification: Frictionless magic-link style code entry



Store Setup: Quick-start form for basic merchant details



Menu Builder: Rapid item entry (name, price, photo)



Dashboard (New Order): Fast POS interface to tap items and checkout



Past Orders: Ledger of completed and pending sales



Profile & Settings: Editable inventory and merchant profile



Key Flows

Onboarding & Menu Setup: Merchant creates their digital storefront.





User is on Landing Page -> sees value prop and email input



User enters email -> receives 6-digit OTP



User verifies OTP -> lands on Store Setup



User enters store name, location, contact -> continues to Menu Builder



User adds items (name, price, photo) -> clicks Start Selling



Redirected to Dashboard to take first order

Taking an Order: Merchant processes a customer in real-time.





User is on Dashboard -> sees search bar and visual item grid



User clicks/taps item cards -> items populate in the right-hand Cart sidebar



User clicks Complete Order -> order logs to Past Orders, cart clears



Success toast appears



Design System

Color Palette





Primary: #D95D39 - Burnt orange (Buttons, primary actions)



Background: #FDFBF7 - Creamy off-white (App background)



Surface: #FFFFFF - Clean white (Cards, inputs, sidebars)



Text: #2C1A14 - Espresso brown (Headings, primary text)



Muted: #8A736A - Mocha (Placeholders, secondary text, borders)



Accent: #E89F71 - Soft peach (Hover states, subtle highlights)



Success: #5D7B64 - Sage green (Order completed, saved states)

Typography

Distinctive, characterful fonts that feel warm, slightly retro, and highly legible.





Headings: Fraunces, 600, 24-48px (Soft, organic serif)



Body: Outfit, 400, 16px (Geometric, friendly sans-serif)



Small text: Outfit, 400, 14px



Buttons: Outfit, 500, 16px

Style notes: Generous border radii (16px for cards, 999px for pills/buttons), soft diffused drop shadows (0 8px 30px rgba(44, 26, 20, 0.05)), slightly indented input fields with no heavy borders.

Design Tokens

:root {
  --color-primary: #D95D39;
  --color-background: #FDFBF7;
  --color-surface: #FFFFFF;
  --color-text: #2C1A14;
  --color-muted: #8A736A;
  --color-accent: #E89F71;
  --color-success: #5D7B64;
  
  --font-heading: 'Fraunces', serif;
  --font-body: 'Outfit', sans-serif;
  
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-pill: 99px;
  
  --shadow-soft: 0 8px 30px rgba(44, 26, 20, 0.05);
}





Screen Specifications

Landing Page

Purpose: Convert visitors into merchants via email signup.

Layout: Split screen desktop. Left: 60% width, cream background, content centered. Right: 40% width, edge-to-edge food illustration/photography with a warm orange overlay.

Key Elements:





Hero Heading: Fraunces, 48px, #2C1A14. Text: "Start selling in three minutes."



Email Input: Large text field, 56px height, #FFFFFF background, placeholder: "chef@kitchen.com"



CTA Button: Pill shape, #D95D39 background, Outfit 500. Text: "Get Started"

States:





Loading: Button text replaces with spinner, opacity 0.7



Error: Red border on input, #D95D39 text: "Please enter a valid email."

OTP Verification

Purpose: Secure, passwordless login.

Layout: Centered single-column card on #FDFBF7 background.

Key Elements:





Header: "Check your oven" (Subtitle: "We sent a 6-digit code to your email")



OTP Inputs: 6 individual square inputs, 64x64px, #FFFFFF bg, #8A736A border, 16px radius. Text centered, 24px.



Resend Link: #D95D39 text, underline on hover.

Interactions:





Typing: Auto-advances to next input cell.

Store Setup

Purpose: Capture basic merchant details.

Layout: Centered 500px wide container. Stepper at top.

Key Elements:





Progress Indicator: "Step 1 of 2", #8A736A text.



Inputs: Store Name, Location, Contact Number. 56px height, soft inner shadow, no borders.



Next Button: Full width, #D95D39 bg, text: "Build Menu"

Menu Builder

Purpose: Add and review items before launching.

Layout: Two columns. Left: Add item form (40%). Right: Live preview list of added items (60%).

Key Elements:





Item Form: Name (text), Price (number), Photo (drag-and-drop zone, 120px height, dashed #8A736A border).



Add Button: Secondary button, #E89F71 bg, #2C1A14 text.



Item Card (Preview): 16px radius, #FFFFFF bg, flex-row. Shows thumbnail, name, price, and a delete icon.



Launch CTA: Fixed at top right. "Start Taking Orders".

Dashboard (New Order)

Purpose: The core POS interface for taking orders rapidly.

Layout: 70/30 split. Left: Menu grid. Right: Active Cart sidebar.

Key Elements:





Search Bar: Top left, full width of grid, 56px tall.



Menu Grid: 4-column grid of items. Each card: Square, #FFFFFF, soft shadow, large price tag badge (#FDFBF7 bg, #D95D39 text).



Cart Sidebar: Fixed right, #FFFFFF bg, left border #FDFBF7. Lists items, quantities (+/- buttons), subtotal, tax, total.



Checkout Button: Bottom of sidebar, full width, #D95D39. "Charge $XX.XX"

Interactions:





Click Item Card: Pops slightly (scale 0.98), adds instantly to Cart.



Hover Item Card: Elevates shadow, border turns #E89F71.

Past Orders

Purpose: Review and manage historical transactions.

Layout: Single column, wide list view. Top navigation bar to toggle between "New Order", "Past Orders", "Profile".

Key Elements:





Filter Tabs: Pill-shaped toggles: "All", "Today", "Pending", "Completed".



Order Row: 80px height, #FFFFFF bg. Columns: Time, Order ID, Items Summary, Total, Status Badge.



Status Badge: #5D7B64 bg + white text for Completed. #E89F71 bg + brown text for Pending.

States:





Empty: Large illustration of an empty plate, "No orders yet. Let's get cooking!"

Profile & Settings

Purpose: Edit details and manage the active menu.

Layout: Left sidebar navigation (Store Info, Menu Items, Billing), Right content area.

Key Elements:





Editable Menu List: Table view of items with inline editing (pencil icon).



Store Info Form: Pre-filled inputs from onboarding.



Save Button: Bottom right, #D95D39.





Build Guide

Stack: HTML + Tailwind CSS v3

Build Order:





Design Tokens & Layout Shell: Setup tailwind.config.js with custom colors (primary: '#D95D39') and fonts (Fraunces, Outfit).



Dashboard (New Order): Build this first. It's the most complex screen and dictates the design language for cards, sidebars, and inputs.



Menu Builder: Reuses cards from the Dashboard, establishes the form design.



Landing Page & OTP: High-impact visual screens using established UI components.



Past Orders & Profile: List views and administrative 