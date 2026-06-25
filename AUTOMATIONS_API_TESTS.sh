#!/bin/bash

# Automations Engine - API Test Examples
# Usage: bash AUTOMATIONS_API_TESTS.sh
#
# This script contains curl examples for testing all automation endpoints.
# Replace YOUR_TOKEN with your actual JWT token and UUIDs with real IDs.

# Configuration
API_URL="http://localhost:3001"
TOKEN="YOUR_JWT_TOKEN_HERE"
ACCOUNT_ID="your-account-uuid"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Automations Engine API Tests ===${NC}\n"

# ============================================
# 1. CREATE AUTOMATION (Welcome Series)
# ============================================
echo -e "${YELLOW}1. Creating Welcome Email Series Automation${NC}"
CREATE_AUTOMATION_RESPONSE=$(curl -s -X POST "$API_URL/api/automations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Welcome Email Series",
    "description": "Send welcome emails to new contacts",
    "type": "welcome",
    "trigger_type": "contact_created",
    "trigger_conditions": {},
    "workflow": [
      {
        "id": "step-1",
        "type": "send_email",
        "action": {
          "emailTemplate": "550e8400-e29b-41d4-a716-446655440001"
        },
        "order": 1
      },
      {
        "id": "step-2",
        "type": "delay",
        "action": {
          "delayMinutes": 1440
        },
        "order": 2
      },
      {
        "id": "step-3",
        "type": "send_email",
        "action": {
          "emailTemplate": "550e8400-e29b-41d4-a716-446655440002"
        },
        "order": 3
      }
    ],
    "is_recurring": false,
    "max_contacts_per_day": 1000,
    "tags": ["onboarding", "welcome"]
  }')

AUTOMATION_ID=$(echo $CREATE_AUTOMATION_RESPONSE | jq -r '.id')
echo "Created automation: $AUTOMATION_ID"
echo -e "${GREEN}Response:${NC}"
echo $CREATE_AUTOMATION_RESPONSE | jq '.' 2>/dev/null || echo $CREATE_AUTOMATION_RESPONSE
echo ""

# ============================================
# 2. LIST AUTOMATIONS
# ============================================
echo -e "${YELLOW}2. Listing All Automations${NC}"
curl -s -X GET "$API_URL/api/automations?status=draft&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# ============================================
# 3. GET AUTOMATION DETAILS
# ============================================
echo -e "${YELLOW}3. Getting Automation Details${NC}"
curl -s -X GET "$API_URL/api/automations/$AUTOMATION_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# ============================================
# 4. UPDATE AUTOMATION
# ============================================
echo -e "${YELLOW}4. Updating Automation${NC}"
curl -s -X PATCH "$API_URL/api/automations/$AUTOMATION_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Updated description for welcome series",
    "max_contacts_per_day": 500
  }' | jq '.'
echo ""

# ============================================
# 5. CREATE SALES QUALIFICATION AUTOMATION
# ============================================
echo -e "${YELLOW}5. Creating Sales Qualification Automation${NC}"
SALES_AUTO=$(curl -s -X POST "$API_URL/api/automations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Sales Inquiry Handler",
    "description": "Handle sales inquiries automatically",
    "type": "trigger",
    "trigger_type": "contact_tag",
    "trigger_conditions": {"tag": "inquiry"},
    "workflow": [
      {
        "id": "send-response",
        "type": "send_email",
        "action": {"emailTemplate": "550e8400-e29b-41d4-a716-446655440010"},
        "order": 1
      },
      {
        "id": "create-opp",
        "type": "create_opportunity",
        "action": {"opportunityType": "Sales Inquiry"},
        "order": 2
      },
      {
        "id": "tag-qualified",
        "type": "update_tag",
        "action": {"tag": "sales_qualified"},
        "order": 3
      }
    ],
    "is_recurring": false,
    "tags": ["sales", "qualification"]
  }')

SALES_AUTO_ID=$(echo $SALES_AUTO | jq -r '.id')
echo "Created sales automation: $SALES_AUTO_ID"
echo -e "${GREEN}Response:${NC}"
echo $SALES_AUTO | jq '.'
echo ""

# ============================================
# 6. TEST AUTOMATION (with contact)
# ============================================
echo -e "${YELLOW}6. Testing Automation with Contact${NC}"
echo "Note: Replace contact-uuid with a real contact ID"
curl -s -X POST "$API_URL/api/automations/$AUTOMATION_ID/test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "contactId": "550e8400-e29b-41d4-a716-446655440099"
  }' | jq '.'
echo ""

# ============================================
# 7. ACTIVATE AUTOMATION
# ============================================
echo -e "${YELLOW}7. Activating Automation${NC}"
curl -s -X POST "$API_URL/api/automations/$AUTOMATION_ID/activate" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# ============================================
# 8. LIST AUTOMATION EXECUTIONS
# ============================================
echo -e "${YELLOW}8. Getting Automation Execution History${NC}"
curl -s -X GET "$API_URL/api/automations/$AUTOMATION_ID/executions?status=completed&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# ============================================
# 9. PAUSE AUTOMATION
# ============================================
echo -e "${YELLOW}9. Pausing Automation${NC}"
curl -s -X POST "$API_URL/api/automations/$AUTOMATION_ID/pause" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# ============================================
# 10. CREATE CONDITIONAL AUTOMATION
# ============================================
echo -e "${YELLOW}10. Creating Conditional Automation${NC}"
COND_AUTO=$(curl -s -X POST "$API_URL/api/automations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Enterprise Segment Campaign",
    "description": "Send enterprise-specific emails",
    "type": "trigger",
    "trigger_type": "contact_tag",
    "trigger_conditions": {"tag": "campaign_target"},
    "workflow": [
      {
        "id": "check-enterprise",
        "type": "condition",
        "action": {
          "condition": {
            "field": "company",
            "operator": "contains",
            "value": "Corp"
          }
        },
        "order": 1
      },
      {
        "id": "send-enterprise-email",
        "type": "send_email",
        "action": {"emailTemplate": "550e8400-e29b-41d4-a716-446655440050"},
        "order": 2
      }
    ],
    "is_recurring": false,
    "tags": ["enterprise", "segmentation"]
  }')

COND_AUTO_ID=$(echo $COND_AUTO | jq -r '.id')
echo "Created conditional automation: $COND_AUTO_ID"
echo -e "${GREEN}Response:${NC}"
echo $COND_AUTO | jq '.'
echo ""

# ============================================
# 11. CREATE SMS + EMAIL AUTOMATION
# ============================================
echo -e "${YELLOW}11. Creating SMS + Email Automation${NC}"
SMS_AUTO=$(curl -s -X POST "$API_URL/api/automations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "VIP Alert - SMS and Email",
    "description": "Alert VIP customers via SMS and email",
    "type": "trigger",
    "trigger_type": "event_based",
    "trigger_conditions": {"event": "special_offer"},
    "workflow": [
      {
        "id": "send-sms",
        "type": "send_sms",
        "action": {"smsMessage": "Hi {{first_name}}, we have an exclusive offer!"},
        "order": 1
      },
      {
        "id": "delay-email",
        "type": "delay",
        "action": {"delayMinutes": 5},
        "order": 2
      },
      {
        "id": "send-email",
        "type": "send_email",
        "action": {"emailTemplate": "550e8400-e29b-41d4-a716-446655440040"},
        "order": 3
      }
    ],
    "is_recurring": false,
    "tags": ["vip", "offers"]
  }')

SMS_AUTO_ID=$(echo $SMS_AUTO | jq -r '.id')
echo "Created SMS automation: $SMS_AUTO_ID"
echo -e "${GREEN}Response:${NC}"
echo $SMS_AUTO | jq '.'
echo ""

# ============================================
# 12. LIST FILTERED AUTOMATIONS
# ============================================
echo -e "${YELLOW}12. Listing Active Automations${NC}"
curl -s -X GET "$API_URL/api/automations?status=active&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# ============================================
# 13. GET EXECUTION DETAILS
# ============================================
echo -e "${YELLOW}13. Getting Execution Details (if any)${NC}"
curl -s -X GET "$API_URL/api/automations/$AUTOMATION_ID/executions?status=in_progress&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# ============================================
# 14. DELETE AUTOMATION
# ============================================
echo -e "${YELLOW}14. Deleting Draft Automation${NC}"
curl -s -X DELETE "$API_URL/api/automations/$COND_AUTO_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo -e "${GREEN}=== API Tests Complete ===${NC}"
echo ""
echo "Summary of created automations:"
echo "  1. Welcome Email Series: $AUTOMATION_ID"
echo "  2. Sales Inquiry Handler: $SALES_AUTO_ID"
echo "  3. Enterprise Campaign: $COND_AUTO_ID (deleted)"
echo "  4. VIP Alert SMS+Email: $SMS_AUTO_ID"
echo ""
echo "Next steps:"
echo "  - Update template UUIDs with real IDs from your database"
echo "  - Update contact UUIDs for testing"
echo "  - Monitor execution history with /executions endpoint"
echo "  - Check email_logs and sms_logs for delivery status"
