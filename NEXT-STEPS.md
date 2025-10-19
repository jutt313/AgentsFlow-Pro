# Next Steps - Automation Mode Deployment

## ⚠️ Required Before Testing

### 1. Run Database Migration
The Prisma schema has been updated with new models. You MUST run the migration before the application will work:

```bash
cd "/Users/chaffanjutt/Downloads/dev/AgentFlow PRO"
npx prisma migrate dev --name automation-mode
npx prisma generate
```

This will:
- Update the `Credential` model with new fields
- Create the `WebhookTrigger` table
- Create the `WebhookEvent` table
- Generate Prisma Client with new types

### 2. Set Environment Variables
Add these to your `.env` file:

```env
# Credential Encryption (must be 32 characters)
CREDENTIAL_ENCRYPTION_KEY=your-32-character-secret-key!!

# API Base URL for webhooks
NEXT_PUBLIC_API_URL=http://localhost:3000

# (Existing vars should remain)
DATABASE_URL=...
DEEPSEEK_API_KEY=...
JWT_SECRET=...
```

### 3. Restart Development Server
After migration and env setup:

```bash
npm run dev
```

## 🧪 Testing the Implementation

### Test Flow 1: Simple Automation
1. Navigate to `/workflow/new`
2. You should see: "Hi! I'm your Designer Agent for Automation"
3. Enter: "When Shopify order arrives, send Slack notification"
4. Agent should immediately show initial diagram with 3-4 steps
5. Agent asks clarifying questions (1-2 at a time)
6. Agent offers recommendations
7. Agent requests Shopify and Slack credentials
8. Agent shows final blueprint for approval
9. Say "Yes, finalize it!"
10. Blueprint should be type-tagged as "Automation"

### Test Flow 2: Credential Collection
1. Start automation design
2. When credential buttons appear, click one (e.g., "Slack")
3. Modal should show exact fields needed:
   - Bot User OAuth Token
   - Default Channel ID (optional)
4. Fill in credentials
5. Submit
6. Credentials should be saved with AES-256-GCM encryption

### Test Flow 3: Webhook Creation
To test webhook APIs directly:

```bash
# Create webhook
curl -X POST http://localhost:3000/api/triggers/webhook/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "YOUR_WORKFLOW_ID",
    "sourceApp": "shopify",
    "eventType": "orders/create"
  }'

# Response will include webhook URL and secret
```

### Test Flow 4: Verify Webhook
```bash
curl -X POST http://localhost:3000/api/triggers/webhook/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerId": "TRIGGER_ID_FROM_ABOVE",
    "testPayload": {"test": "data"}
  }'
```

### Test Flow 5: Send Webhook Event
```bash
# Calculate signature first
TIMESTAMP=$(date +%s)
SECRET="your-webhook-secret"
BODY='{"order_id": "12345"}'
SIGNATURE=$(echo -n "${TIMESTAMP}.${BODY}" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $2}')

# Send webhook
curl -X POST http://localhost:3000/api/webhooks/trigger/YOUR_TRIGGER_ID \
  -H "X-AF-Signature: $SIGNATURE" \
  -H "X-AF-Timestamp: $TIMESTAMP" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

## 🐛 Troubleshooting

### Issue: Prisma Client errors
**Solution:** Run `npx prisma generate` again

### Issue: Encryption errors
**Solution:** Ensure `CREDENTIAL_ENCRYPTION_KEY` is exactly 32 characters

### Issue: Webhook signature invalid
**Solution:** 
- Verify timestamp is within 5 minutes
- Ensure signature calculation: `HMAC-SHA256(secret, timestamp + body)`
- Use raw body string, not parsed JSON

### Issue: Designer Agent doesn't generate diagram
**Solution:**
- Check DEEPSEEK_API_KEY is set
- Check console for API errors
- Ensure user message is descriptive enough

## 📊 What to Monitor

### Database Tables
```sql
-- Check credentials are encrypted
SELECT id, platform, created_at FROM "Credential" LIMIT 5;

-- Check webhook triggers
SELECT id, url, verified_at FROM "WebhookTrigger" LIMIT 5;

-- Check webhook events
SELECT id, trigger_id, verified, processed FROM "WebhookEvent" LIMIT 5;

-- Check designer sessions
SELECT id, stage, status FROM designer_sessions ORDER BY created_at DESC LIMIT 5;
```

### Logs to Watch
- `🔑 Credentials saved:` - Credential storage
- `✅ Webhook event received and verified:` - Webhook processing
- `🔄 Stage: INITIAL` - Conversation stage transitions
- `📊 Moving to design stage` - Diagram generation

## 🎯 Success Indicators

You'll know it's working when:

1. **Automation greeting appears** instead of mode selection buttons
2. **Initial diagram generates** immediately after describing goal
3. **Targeted questions asked** (1-2 at a time, not all at once)
4. **Recommendations offered** (e.g., "Add AI summarizer?")
5. **Credential modals show exact fields** from credential registry
6. **Webhook URLs generated** with setup instructions
7. **Blueprint tagged** as `type: "Automation"`
8. **No encryption errors** in console

## 📝 Known Limitations

1. **Builder Agent integration** - Webhook events stored but not executed (Phase 2)
2. **Recommendation UI** - Basic text presentation (can add interactive pills)
3. **Diagram rendering** - Uses existing WorkflowDiagram component (works but can be enhanced)
4. **Testing tools** - Manual testing only (formal tests can be added)

## 🚀 Ready to Test!

Once you've completed steps 1-3 above, the Automation Mode should be fully functional. Start with Test Flow 1 to validate the complete user journey.

## 💡 Tips

- Use descriptive automation goals for better diagram generation
- Check console logs for detailed execution flow
- Test with real platform credentials (use test/sandbox accounts)
- Try different automation scenarios to see recommendation variations

---

**Implementation Complete!** 🎉

All core features are ready. The Designer Agent will now:
- Generate diagrams immediately
- Ask minimal targeted questions
- Offer smart recommendations
- Collect exact credentials securely
- Generate webhook URLs with HMAC security
- Produce type-tagged Automation blueprints

