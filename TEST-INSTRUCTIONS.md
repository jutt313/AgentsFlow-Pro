# Testing the Designer Agent Chat UI

## ✅ Pre-requisites
- Dev server is running: `npm run dev` ✅
- Database is connected ✅
- Designer Agent backend is ready ✅
- All UI components are built ✅

---

## 🧪 Testing Steps

### **1. Access the Application**
Open your browser and navigate to:
```
http://localhost:3000
```

### **2. Login/Register**
- If not logged in, go to `/login` or `/register`
- Create an account or login with existing credentials
- You should be redirected to the dashboard

### **3. Dashboard**
- Verify you see:
  - Welcome message with your name
  - Stats cards (Total Workflows, Active Agents, System Status)
  - "Create New Workflow" button with glow effect

### **4. Start New Workflow**
- Click the **"Create New Workflow"** button
- You should be redirected to `/workflow/new`

### **5. Designer Agent Chat Interface**

#### **Initial State (Chat Only):**
- ✅ Chat card is **centered** on the page
- ✅ Welcome message from Designer Agent visible:
  - Icon: 💬
  - Text: "Hi! I'm your Designer Agent"
  - Subtitle: "Tell me about your business needs..."
- ✅ Input bar at the bottom with placeholder text
- ✅ Send button (arrow icon) is visible
- ✅ "Back to Dashboard" button in header
- ✅ "Session Active" badge appears after first message

#### **Send First Message:**
Type something like:
```
I want to automate my e-commerce store
```

**Expected behavior:**
- ✅ Your message appears on the right side (user-message)
- ✅ User avatar (👤) is visible
- ✅ Typing indicator appears (three animated dots)
- ✅ Agent response appears after ~2-5 seconds
- ✅ Agent avatar (🤖) is visible
- ✅ Messages auto-scroll to bottom

#### **Continue Conversation:**
Answer the Designer Agent's questions. The agent should:
- Ask about your business type
- Ask clarifying questions about what you want to automate
- Gradually understand your needs

#### **Design Stage (Split View):**
After 2-3 exchanges, when the agent starts designing:

**Expected behavior:**
- ✅ Chat card **slides LEFT** (30% width)
- ✅ Diagram card **slides IN from RIGHT** (70% width)
- ✅ Smooth animation (0.5s)
- ✅ Diagram placeholder shows initially:
  - Icon: 📊
  - Text: "Workflow Diagram"
  - Subtitle: "Your AI team structure will appear here..."

#### **Blueprint Visualization:**
As the agent designs your team:

**Expected behavior:**
- ✅ "Building your workflow..." indicator appears (top-right of diagram)
- ✅ Pulsing dot animation
- ✅ Nodes appear in the diagram:
  - **Manager node** (👔) - Orange glow - at top
  - **Agent nodes** (various emojis) - Green glow - in middle
  - **Integration nodes** (🔌) - Purple glow - at bottom
- ✅ Animated lines connect nodes
- ✅ Nodes have hover effects (lift up, enhanced glow)

### **6. Test Interactions**

#### **Chat Input:**
- ✅ Type multiple lines (use Shift+Enter for new line)
- ✅ Press Enter to send
- ✅ Input clears after sending
- ✅ Input is disabled while agent is responding
- ✅ Send button is disabled when input is empty

#### **Diagram Controls:**
- ✅ Zoom in/out using controls (bottom-left of diagram)
- ✅ Pan by dragging the canvas
- ✅ "Fit View" button centers the diagram
- ✅ Hover over nodes to see glow effects
- ✅ No ReactFlow attribution/branding visible

#### **Session Persistence:**
- ✅ Refresh the page (`Cmd/Ctrl + R`)
- ✅ Chat history should reload
- ✅ Diagram should reload if it was visible
- ✅ Can continue conversation from where you left off

### **7. Navigation**
- ✅ Click "Back to Dashboard" button
- ✅ Returns to dashboard
- ✅ Click "Create New Workflow" again
- ✅ Creates a new session (or resumes existing one)

---

## 🎨 Visual Checks

### **Design Quality:**
- ✅ No plain backgrounds (everything has gradients/glass effect)
- ✅ Glow effects on all cards
- ✅ Green, orange, and purple color accents
- ✅ Rounded corners on all elements
- ✅ Professional shadows with depth
- ✅ Smooth animations everywhere
- ✅ Custom scrollbars (green theme)
- ✅ Consistent typography (Poppins font)

### **Responsiveness:**
- ✅ Resize browser window
- ✅ Layout should adapt gracefully
- ✅ Chat should remain readable
- ✅ Diagram should scale appropriately

---

## 🐛 Common Issues & Solutions

### **Issue: "Failed to initialize session"**
**Solution:** 
- Check that you're logged in
- Check dev server is running
- Check database is connected

### **Issue: "Network error" when sending message**
**Solution:**
- Verify API endpoint `/api/agents/designer/chat` exists
- Check server logs for errors
- Ensure DeepSeek API key is in `.env`

### **Issue: Diagram doesn't appear**
**Solution:**
- Check if blueprint data is being returned from API
- Open browser console for errors
- Verify ReactFlow package is installed

### **Issue: Chat history doesn't persist**
**Solution:**
- Check localStorage is enabled in browser
- Verify session is being saved to database
- Check `/api/agents/designer/sessions` endpoint

### **Issue: Styling looks broken**
**Solution:**
- Hard refresh browser (`Cmd/Ctrl + Shift + R`)
- Clear browser cache
- Check CSS file loaded correctly

---

## 📸 Expected Screenshots

### **Initial State:**
- Dark navy gradient background
- Single chat card centered
- Welcome message visible
- Input bar at bottom
- Glowing effects on card

### **Split View:**
- Chat on left (30%)
- Diagram on right (70%)
- Both cards have glassmorphism
- Smooth transition animation
- No layout jumps

### **Diagram with Nodes:**
- Manager at top (orange)
- Agents in middle (green)
- Integrations at bottom (purple)
- Lines connecting all nodes
- Controls in bottom-left
- No ReactFlow branding

---

## 🎯 Success Criteria

**The UI is working correctly if:**
1. ✅ Chat loads and centers properly
2. ✅ Can send and receive messages
3. ✅ Typing indicator shows during AI response
4. ✅ Layout shifts smoothly when diagram appears
5. ✅ Diagram displays with correct node types
6. ✅ All animations are smooth
7. ✅ Session persists across refreshes
8. ✅ No console errors
9. ✅ Visual design matches specification
10. ✅ Navigation works correctly

---

## 🚀 Next Testing Phase

After UI testing is complete, test:
1. **Full Conversation Flow**: Complete a full workflow design session
2. **Credential Collection**: Test integration credential input
3. **Blueprint Approval**: Test final approval flow
4. **Builder Agent Handoff**: Verify blueprint is passed correctly
5. **Error Scenarios**: Test with invalid inputs, network failures

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check server logs for backend errors
3. Verify all environment variables are set
4. Ensure all dependencies are installed (`npm install`)
5. Restart dev server (`npm run dev`)

---

**Happy Testing! 🎉**

