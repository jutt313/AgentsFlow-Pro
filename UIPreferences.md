# AgentFlow PRO - UI Preferences & Branding Guide

## 🎨 Color Palette

### **Primary Colors**
```css
/* Main Brand Red */
--primary-red: #c15f3c;
--primary-red-dark: #ab3207;
--primary-red-light: #d4735a;

/* Accent Red Variations */
--accent-red-1: #e67e5a;
--accent-red-2: #f4a582;
--accent-red-3: #f8c4a8;
--accent-red-4: #fce4d4;
```

### **Secondary Colors**
```css
/* Success Green */
--success-green: #10b981;
--success-green-dark: #059669;
--success-green-light: #34d399;

/* Green Variations for CTAs */
--cta-green: #10b981;
--cta-green-hover: #059669;
--cta-green-light: #d1fae5;
```

### **Neutral Colors**
```css
/* Grays */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### **Status Colors**
```css
/* Status Indicators */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

---

## 🎯 Brand Identity

### **Logo & Typography**
- **Primary Font**: Inter (clean, modern, professional)
- **Secondary Font**: Poppins (for headings, friendly yet professional)
- **Logo Style**: Modern, minimalist with red accent
- **Tagline**: "Stop building AI tools. Start hiring AI employees."

### **Brand Personality**
- **Professional**: Enterprise-grade reliability
- **Innovative**: Cutting-edge AI technology
- **Approachable**: Easy to use, no technical barriers
- **Confident**: Trustworthy and dependable

---

## 🎨 UI Design System

### **Light Theme Colors**
```css
/* Background Colors */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
--bg-card: #ffffff;

/* Text Colors */
--text-primary: #111827;
--text-secondary: #4b5563;
--text-tertiary: #6b7280;
--text-inverse: #ffffff;

/* Border Colors */
--border-light: #e5e7eb;
--border-medium: #d1d5db;
--border-dark: #9ca3af;
```

### **Component Colors**
```css
/* Headers */
--header-bg: #ffffff;
--header-text: #111827;
--header-accent: #c15f3c;

/* Cards */
--card-bg: #ffffff;
--card-border: #e5e7eb;
--card-shadow: rgba(0, 0, 0, 0.1);

/* Forms */
--form-bg: #ffffff;
--form-border: #d1d5db;
--form-border-focus: #c15f3c;
--form-label: #374151;

/* CTAs */
--cta-primary: #10b981;
--cta-primary-hover: #059669;
--cta-secondary: #c15f3c;
--cta-secondary-hover: #ab3207;
```

---

## 🎨 Visual Design Elements

### **Shadows & Depth**
```css
/* Shadow System */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Card Shadows */
--card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--card-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

### **Border Radius**
```css
/* Rounded Corners */
--radius-sm: 0.375rem;    /* 6px */
--radius-md: 0.5rem;      /* 8px */
--radius-lg: 0.75rem;     /* 12px */
--radius-xl: 1rem;        /* 16px */
--radius-2xl: 1.5rem;     /* 24px */
--radius-full: 9999px;    /* Fully rounded */
```

### **Spacing System**
```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## 🎨 Component Styles

### **Cards**
```css
.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--space-6);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}
```

### **Buttons**
```css
/* Primary CTA Button (Green) */
.btn-primary {
  background: var(--cta-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--cta-primary-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

/* Secondary Button (Red) */
.btn-secondary {
  background: var(--cta-secondary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--cta-secondary-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}
```

### **Forms**
```css
.form-input {
  background: var(--form-bg);
  border: 2px solid var(--form-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--form-border-focus);
  box-shadow: 0 0 0 3px rgba(193, 95, 60, 0.1);
}

.form-label {
  color: var(--form-label);
  font-weight: 600;
  margin-bottom: var(--space-2);
}
```

### **Headers**
```css
.header {
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4) var(--space-6);
}

.header-title {
  color: var(--header-text);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
}

.header-accent {
  color: var(--header-accent);
}
```

---

## 🎨 Layout & Grid System

### **Container Sizes**
```css
.container-sm: max-width: 640px;
.container-md: max-width: 768px;
.container-lg: max-width: 1024px;
.container-xl: max-width: 1280px;
.container-2xl: max-width: 1536px;
```

### **Grid System**
```css
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1: grid-template-columns: repeat(1, 1fr);
.grid-cols-2: grid-template-columns: repeat(2, 1fr);
.grid-cols-3: grid-template-columns: repeat(3, 1fr);
.grid-cols-4: grid-template-columns: repeat(4, 1fr);
```

---

## 🎨 Special Effects & Animations

### **Transitions**
```css
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition: color 0.3s ease, background-color 0.3s ease;
}

.transition-transform {
  transition: transform 0.3s ease;
}
```

### **Hover Effects**
```css
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(193, 95, 60, 0.3);
}
```

---

## 🎨 AgentFlow PRO Specific Components

### **Animated Glow Cards**
```css
.glow-card {
  background: var(--card-bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--card-shadow);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glow-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(193, 95, 60, 0.1) 50%, 
    rgba(16, 185, 129, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
}

.glow-card:hover::before {
  opacity: 1;
}

.glow-card:hover {
  border-color: var(--success-green);
  box-shadow: 
    0 0 30px rgba(16, 185, 129, 0.2),
    0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px) scale(1.02);
}

.glow-card-content {
  position: relative;
  z-index: 1;
}

/* Animated Background Glow */
@keyframes glow-pulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
  }
  50% { 
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.3);
  }
}

.glow-card-active {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### **Agent Status Cards**
```css
.agent-card {
  background: var(--card-bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.agent-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.05) 0%, 
    rgba(193, 95, 60, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.agent-card:hover::before {
  opacity: 1;
}

.agent-card:hover {
  border-color: var(--primary-red);
  box-shadow: 
    0 0 25px rgba(193, 95, 60, 0.15),
    0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.agent-status-online {
  background: var(--success-green-light);
  color: var(--success-green-dark);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}
```

### **Dynamic Chat-to-Diagram Interface**
```css
/* Initial State - Full Chat */
.team-creation-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  height: calc(100vh - 120px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Transitioned State - Chat + Diagram */
.team-creation-container.expanded {
  grid-template-columns: 1fr 2fr;
}

.chat-container {
  background: var(--card-bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.03) 0%, 
    rgba(193, 95, 60, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.chat-container:hover::before {
  opacity: 1;
}

.chat-messages {
  height: calc(100% - 80px);
  overflow-y: auto;
  padding-right: var(--space-2);
  margin-bottom: var(--space-4);
}

.chat-input-container {
  position: absolute;
  bottom: var(--space-6);
  left: var(--space-6);
  right: var(--space-6);
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-3);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.chat-input-container:focus-within {
  border-color: var(--primary-red);
  box-shadow: 
    0 0 20px rgba(193, 95, 60, 0.1),
    var(--shadow-lg);
}

.chat-input {
  width: 100%;
  border: none;
  outline: none;
  padding: var(--space-3);
  font-size: 1rem;
  background: transparent;
  color: var(--text-primary);
}

.chat-send-button {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  background: var(--cta-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-weight: 600;
  transition: all 0.3s ease;
}

.chat-send-button:hover {
  background: var(--cta-primary-hover);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

/* Diagram Container */
.workflow-container {
  background: var(--card-bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
  height: 100%;
  overflow: hidden;
  position: relative;
  opacity: 0;
  transform: translateX(50px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.workflow-container.show {
  opacity: 1;
  transform: translateX(0);
}

.workflow-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(16, 185, 129, 0.05) 0%, 
    rgba(193, 95, 60, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.workflow-container:hover::before {
  opacity: 1;
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 2px solid var(--border-light);
}

.workflow-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.workflow-status {
  background: var(--success-green-light);
  color: var(--success-green-dark);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}

.workflow-diagram {
  height: calc(100% - 120px);
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  border: 2px dashed var(--border-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 1.125rem;
  transition: all 0.3s ease;
}

.workflow-diagram.active {
  border-color: var(--success-green);
  background: var(--success-green-light);
  color: var(--success-green-dark);
}
```

### **Main Dashboard Layout**
```css
.dashboard-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
  padding: var(--space-6);
  min-height: calc(100vh - 80px);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
}

.dashboard-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.create-team-button {
  background: var(--cta-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-8);
  font-size: 1.125rem;
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.create-team-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.create-team-button:hover::before {
  left: 100%;
}

.create-team-button:hover {
  background: var(--cta-primary-hover);
  box-shadow: 
    0 0 30px rgba(16, 185, 129, 0.3),
    var(--shadow-xl);
  transform: translateY(-2px);
}

/* Teams Grid */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
}

.team-card {
  background: var(--card-bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.team-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.05) 0%, 
    rgba(193, 95, 60, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.team-card:hover::before {
  opacity: 1;
}

.team-card:hover {
  border-color: var(--success-green);
  box-shadow: 
    0 0 25px rgba(16, 185, 129, 0.15),
    0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px) scale(1.02);
}

.team-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.team-name {
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.team-status {
  background: var(--success-green-light);
  color: var(--success-green-dark);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
}

.team-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: var(--space-4);
}

.team-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-stat {
  text-align: center;
}

.team-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-red);
}

.team-stat-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.quick-action-button {
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-action-button:hover {
  background: var(--primary-red);
  color: var(--text-inverse);
  border-color: var(--primary-red);
  box-shadow: 0 0 15px rgba(193, 95, 60, 0.2);
}
```

### **Team Monitoring Dashboard**
```css
.monitoring-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  padding: var(--space-6);
  min-height: calc(100vh - 80px);
}

.monitoring-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  background: var(--card-bg);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
}

.monitoring-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.monitoring-controls {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.auto-healing-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--bg-secondary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  border: 2px solid var(--border-light);
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
  background: var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: var(--success-green);
}

.toggle-switch::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--bg-primary);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch.active::before {
  transform: translateX(26px);
}

/* Agent Status Cards */
.agent-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
}

.agent-status-card {
  background: var(--card-bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.agent-status-card.online {
  border-color: var(--success-green);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
}

.agent-status-card.error {
  border-color: var(--error);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.1);
}

.agent-status-card.warning {
  border-color: var(--warning);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
}

/* Logs Container */
.logs-container {
  background: var(--card-bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  height: 400px;
  overflow-y: auto;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--border-light);
}

.log-entry {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--border-light);
}

.log-timestamp {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  min-width: 80px;
}

.log-level {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.log-level.info {
  background: var(--info);
  color: var(--text-inverse);
}

.log-level.success {
  background: var(--success);
  color: var(--text-inverse);
}

.log-level.warning {
  background: var(--warning);
  color: var(--text-inverse);
}

.log-level.error {
  background: var(--error);
  color: var(--text-inverse);
}

.log-message {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

### **Landing Page Components**
```css
.landing-hero {
  background: linear-gradient(135deg, 
    var(--primary-red-light) 0%, 
    var(--primary-red) 50%, 
    var(--primary-red-dark) 100%);
  color: var(--text-inverse);
  padding: var(--space-24) var(--space-6);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.landing-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-family: 'Poppins', sans-serif;
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: var(--space-6);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: var(--space-8);
  opacity: 0.9;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary {
  background: var(--cta-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-8);
  font-size: 1.25rem;
  font-weight: 600;
  box-shadow: var(--shadow-xl);
  transition: all 0.3s ease;
}

.cta-primary:hover {
  background: var(--cta-primary-hover);
  box-shadow: 
    0 0 40px rgba(16, 185, 129, 0.4),
    var(--shadow-2xl);
  transform: translateY(-3px);
}

.cta-secondary {
  background: transparent;
  color: var(--text-inverse);
  border: 2px solid var(--text-inverse);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-8);
  font-size: 1.25rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cta-secondary:hover {
  background: var(--text-inverse);
  color: var(--primary-red);
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
}

/* Features Section */
.features-section {
  padding: var(--space-24) var(--space-6);
  background: var(--bg-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: var(--card-bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  text-align: center;
  box-shadow: var(--shadow-md);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.05) 0%, 
    rgba(193, 95, 60, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  border-color: var(--success-green);
  box-shadow: 
    0 0 30px rgba(16, 185, 129, 0.15),
    0 15px 35px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-6px) scale(1.03);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: var(--success-green-light);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-6);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
}

.feature-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}
```

### **Authentication Pages**
```css
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: var(--space-6);
}

.auth-card {
  background: var(--card-bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.03) 0%, 
    rgba(193, 95, 60, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.auth-card:hover::before {
  opacity: 1;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.auth-logo {
  width: 60px;
  height: 60px;
  background: var(--primary-red);
  border-radius: var(--radius-xl);
  margin: 0 auto var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 0 20px rgba(193, 95, 60, 0.3);
}

.auth-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.auth-input {
  background: var(--form-bg);
  border: 2px solid var(--form-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.auth-input:focus {
  outline: none;
  border-color: var(--form-border-focus);
  box-shadow: 0 0 0 3px rgba(193, 95, 60, 0.1);
}

.auth-button {
  background: var(--cta-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  font-size: 1rem;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  margin-top: var(--space-2);
}

.auth-button:hover {
  background: var(--cta-primary-hover);
  box-shadow: 
    0 0 25px rgba(16, 185, 129, 0.3),
    var(--shadow-lg);
  transform: translateY(-2px);
}

.auth-links {
  text-align: center;
  margin-top: var(--space-6);
}

.auth-link {
  color: var(--primary-red);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.auth-link:hover {
  color: var(--primary-red-dark);
  text-shadow: 0 0 8px rgba(193, 95, 60, 0.3);
}
```

---

## 🎨 Brand Colors Usage Guide

### **Primary Red (#c15f3c) Usage**
- Headers and titles
- Accent elements
- Secondary buttons
- Brand highlights
- Status indicators

### **Success Green (#10b981) Usage**
- Primary CTAs
- Success states
- Positive indicators
- Action buttons
- Confirmation elements

### **Color Combinations**
```css
/* Hero Section */
.hero-bg {
  background: linear-gradient(135deg, var(--primary-red-light) 0%, var(--primary-red) 100%);
  color: var(--text-inverse);
}

/* Card with Accent */
.card-accent {
  border-left: 4px solid var(--primary-red);
}

/* Success Message */
.success-message {
  background: var(--success-green-light);
  border: 1px solid var(--success-green);
  color: var(--success-green-dark);
}
```

---

## 🎨 Responsive Design

### **Breakpoints**
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### **Mobile Optimizations**
```css
.mobile-card {
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin: var(--space-2);
}

.mobile-button {
  width: 100%;
  padding: var(--space-4);
  font-size: 1.125rem;
}
```

---

## 🎨 Accessibility

### **Color Contrast**
- All text meets WCAG AA standards
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text

### **Focus States**
```css
.focus-visible {
  outline: 2px solid var(--primary-red);
  outline-offset: 2px;
}
```

---

## 🎨 Implementation Notes

### **CSS Custom Properties**
All colors are defined as CSS custom properties for easy theming and maintenance.

### **Design Tokens**
Use the defined spacing, colors, and typography scales consistently across all components.

### **Component Library**
Build reusable components using these design tokens for consistency.

### **Brand Consistency**
Always use the defined color palette and maintain the professional yet approachable brand personality.

---

*This UI preferences guide ensures AgentFlow PRO has a unique, professional, and beautiful design that reflects our innovative AI workforce platform.*
