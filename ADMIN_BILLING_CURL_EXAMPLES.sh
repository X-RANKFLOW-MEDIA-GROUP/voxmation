#!/bin/bash
# Admin Billing Endpoints - cURL Examples
# Usage: source this file or copy individual commands

API_BASE="https://api.yourapp.com"
TOKEN="your_jwt_token_here"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Admin Billing Endpoints - cURL Examples ===${NC}\n"

# ============================================================================
# 1. LIST SUBSCRIPTIONS
# ============================================================================

echo -e "${GREEN}1. LIST ALL SUBSCRIPTIONS${NC}"
echo "Get all subscriptions for the account:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/subscriptions?limit=25&offset=0\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

echo -e "${GREEN}2. LIST ACTIVE SUBSCRIPTIONS${NC}"
echo "Get only active subscriptions:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/subscriptions?status=active&limit=25\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

echo -e "${GREEN}3. FILTER SUBSCRIPTIONS BY PLAN${NC}"
echo "Get subscriptions for specific plan:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/subscriptions?planId=plan_pro_id&limit=25\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

echo -e "${GREEN}4. FILTER SUBSCRIPTIONS BY CURRENCY${NC}"
echo "Get EUR subscriptions:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/subscriptions?currency=EUR&limit=25\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

echo -e "${GREEN}5. FILTER SUBSCRIPTIONS BY STATUS${NC}"
echo "Get paused subscriptions:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/subscriptions?status=paused&limit=25\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

# ============================================================================
# 2. CHANGE SUBSCRIPTION PLAN
# ============================================================================

echo -e "${GREEN}6. UPGRADE SUBSCRIPTION PLAN${NC}"
echo "Change to a higher tier plan with proration:"
echo ""
echo "curl -X PATCH \"${API_BASE}/api/admin/subscriptions/subscription_id_here\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"planId\": \"plan_enterprise_id\","
echo "    \"prorationBehavior\": \"create_prorations\""
echo "  }'"
echo ""

echo -e "${GREEN}7. DOWNGRADE SUBSCRIPTION PLAN${NC}"
echo "Change to a lower tier plan:"
echo ""
echo "curl -X PATCH \"${API_BASE}/api/admin/subscriptions/subscription_id_here\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"planId\": \"plan_starter_id\","
echo "    \"prorationBehavior\": \"create_prorations\""
echo "  }'"
echo ""

echo -e "${GREEN}8. CHANGE BILLING CYCLE (MONTHLY TO YEARLY)${NC}"
echo "Change from monthly to yearly billing:"
echo ""
echo "curl -X PATCH \"${API_BASE}/api/admin/subscriptions/subscription_id_here\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"planId\": \"plan_pro_id\","
echo "    \"billingCycle\": \"yearly\","
echo "    \"prorationBehavior\": \"none\""
echo "  }'"
echo ""

echo -e "${GREEN}9. CHANGE PLAN WITHOUT PRORATION${NC}"
echo "Change plan with no proration adjustments:"
echo ""
echo "curl -X PATCH \"${API_BASE}/api/admin/subscriptions/subscription_id_here\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"planId\": \"plan_professional_id\","
echo "    \"prorationBehavior\": \"none\""
echo "  }'"
echo ""

# ============================================================================
# 3. LIST INVOICES
# ============================================================================

echo -e "${GREEN}10. LIST ALL INVOICES${NC}"
echo "Get all invoices for the account:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/invoices?limit=25&offset=0\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

echo -e "${GREEN}11. LIST PAID INVOICES${NC}"
echo "Get only paid invoices:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/invoices?status=paid&limit=25\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

echo -e "${GREEN}12. LIST OPEN INVOICES${NC}"
echo "Get invoices awaiting payment:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/invoices?status=open&limit=25\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

echo -e "${GREEN}13. LIST INVOICES BY CURRENCY${NC}"
echo "Get EUR invoices:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/invoices?currency=EUR&limit=25\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

echo -e "${GREEN}14. LIST INVOICES FOR SPECIFIC SUBSCRIPTION${NC}"
echo "Get all invoices for a subscription:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/invoices?subscriptionId=subscription_id_here&limit=25\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

echo -e "${GREEN}15. LIST MULTIPLE FILTERS${NC}"
echo "Get paid USD invoices for a subscription:"
echo ""
echo "curl -X GET \"${API_BASE}/api/admin/invoices?status=paid&currency=USD&subscriptionId=subscription_id_here\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo ""

# ============================================================================
# 4. RESEND INVOICES
# ============================================================================

echo -e "${GREEN}16. RESEND INVOICE TO CUSTOMER${NC}"
echo "Send invoice email to customer:"
echo ""
echo "curl -X POST \"${API_BASE}/api/admin/invoices/invoice_id_here/resend\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{}'"
echo ""

# ============================================================================
# PRACTICAL WORKFLOWS
# ============================================================================

echo -e "${BLUE}=== Practical Workflow Examples ===${NC}\n"

echo -e "${GREEN}WORKFLOW 1: Admin Reviews Account Subscriptions${NC}"
echo ""
echo "# Step 1: Get all active subscriptions"
echo "curl -X GET \"${API_BASE}/api/admin/subscriptions?status=active\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" | jq '.'"
echo ""
echo "# Step 2: If subscription needs upgrade, get invoice history"
echo "curl -X GET \"${API_BASE}/api/admin/invoices?subscriptionId=SUBSCRIPTION_ID\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" | jq '.'"
echo ""

echo -e "${GREEN}WORKFLOW 2: Admin Upgrades Customer Plan${NC}"
echo ""
echo "# Step 1: Change the subscription plan"
echo "curl -X PATCH \"${API_BASE}/api/admin/subscriptions/SUBSCRIPTION_ID\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"planId\": \"NEW_PLAN_ID\"}' | jq '.'"
echo ""
echo "# Step 2: Verify the change in billing history"
echo "# (Check database billing_history table)"
echo ""

echo -e "${GREEN}WORKFLOW 3: Support Team Resends Invoice${NC}"
echo ""
echo "# Step 1: Find the invoice"
echo "curl -X GET \"${API_BASE}/api/admin/invoices?status=open&limit=25\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" | jq '.data[] | select(.invoiceNumber == \"INV-001\")'"
echo ""
echo "# Step 2: Resend it"
echo "curl -X POST \"${API_BASE}/api/admin/invoices/INVOICE_ID/resend\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{}' | jq '.'"
echo ""

echo -e "${GREEN}WORKFLOW 4: Finance Report - Monthly Revenue${NC}"
echo ""
echo "# Get all paid invoices from this month"
echo "curl -X GET \"${API_BASE}/api/admin/invoices?status=paid&limit=100\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" | jq '[.data[] | .amountTotal] | add'"
echo ""

# ============================================================================
# TESTING WITH VALID DATA
# ============================================================================

echo -e "${BLUE}=== Testing Template ===${NC}\n"

cat << 'TEMPLATE'
# Replace these with actual values:
API_BASE="https://api.yourapp.com"
TOKEN="your_jwt_token"
SUBSCRIPTION_ID="sub_uuid_123"
INVOICE_ID="inv_uuid_123"
PLAN_ID="plan_enterprise_id"

# Test 1: List subscriptions
curl -X GET "${API_BASE}/api/admin/subscriptions?limit=10&offset=0" \
  -H "Authorization: Bearer ${TOKEN}"

# Test 2: Upgrade plan
curl -X PATCH "${API_BASE}/api/admin/subscriptions/${SUBSCRIPTION_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"planId\": \"${PLAN_ID}\"}"

# Test 3: Get invoices
curl -X GET "${API_BASE}/api/admin/invoices?status=paid&limit=10" \
  -H "Authorization: Bearer ${TOKEN}"

# Test 4: Resend invoice
curl -X POST "${API_BASE}/api/admin/invoices/${INVOICE_ID}/resend" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}'
TEMPLATE

echo ""
echo -e "${BLUE}=== Error Responses ===${NC}\n"

echo -e "${RED}Missing Token:${NC}"
echo "curl -X GET \"${API_BASE}/api/admin/subscriptions\""
echo "Response: { \"error\": \"Missing authorization token\" }"
echo ""

echo -e "${RED}Insufficient Permissions:${NC}"
echo "curl -X GET \"${API_BASE}/api/admin/subscriptions\" \\"
echo "  -H \"Authorization: Bearer user_token_without_admin_role\""
echo "Response: { \"error\": \"Insufficient permissions for this action\" }"
echo ""

echo -e "${RED}Missing Required Parameter:${NC}"
echo "curl -X PATCH \"${API_BASE}/api/admin/subscriptions/sub_id\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\" \\"
echo "  -d '{\"billingCycle\": \"yearly\"}'"
echo "Response: { \"error\": \"Plan ID is required\" }"
echo ""

echo -e "${RED}Not Found:${NC}"
echo "curl -X GET \"${API_BASE}/api/admin/subscriptions/nonexistent_id\" \\"
echo "  -H \"Authorization: Bearer ${TOKEN}\""
echo "Response: { \"error\": \"Subscription not found\" }"
echo ""

# ============================================================================
# HELPFUL TOOLS
# ============================================================================

echo -e "${BLUE}=== Helpful Tools & Tips ===${NC}\n"

cat << 'TIPS'
# Pretty print JSON response:
curl ... | jq '.'

# Save response to file:
curl ... > response.json

# Extract specific field:
curl ... | jq '.data[0].planName'

# Count total items:
curl ... | jq '.total'

# Filter array:
curl ... | jq '.data[] | select(.status == "active")'

# Use environment variables:
TOKEN="your_token"
curl -H "Authorization: Bearer ${TOKEN}" ...

# Loop through results:
curl ... | jq '.data[] | .id' | while read id; do
  echo "Processing: $id"
done

# Test with verbose output:
curl -v -X GET "..." \
  -H "Authorization: Bearer TOKEN"

# Time the request:
time curl -X GET "..." \
  -H "Authorization: Bearer TOKEN"

# Get response headers only:
curl -I -X GET "..." \
  -H "Authorization: Bearer TOKEN"
TIPS

echo ""
echo -e "${BLUE}=== Documentation ===${NC}\n"
echo "For complete documentation, see:"
echo "  - /server/docs/ADMIN_BILLING.md"
echo "  - /server/docs/API_ENDPOINTS_SUMMARY.md"
echo "  - /server/examples/billing-endpoints.ts"
echo "  - /server/clients/adminBillingClient.ts"
echo ""
