# Enhanced Development & Verification Protocol for Claude Code

## 🚀 MANDATORY VISUAL PROGRESS CHECKLIST

**IMPORTANT**: Claude Code MUST display this checklist to the user at the start of EVERY session and update it in real-time as each step is completed.

### Display Instructions for Claude Code
```markdown
At the start of every task, create and display this checklist to the user.
Update with ✅ as each step completes, ⚠️ for warnings, and ❌ for failures that need attention.
Show this BEFORE doing any work:
```

### 📊 MASTER VERIFICATION CHECKLIST

```markdown
═══════════════════════════════════════════════════════════════
🔧 SYSTEM INITIALIZATION & VERIFICATION CHECKLIST
═══════════════════════════════════════════════════════════════

📋 PRE-FLIGHT CHECKS
├─ [ ] MCP Server Connection Test
├─ [ ] Node.js Path Verification
├─ [ ] UI Verifier Tools Available
├─ [ ] Chrome/Puppeteer Functional
└─ [ ] Working Directory Confirmed

🔌 PORT ALLOCATION
├─ [ ] Checked existing server status
├─ [ ] Found available port (starting from 3000)
├─ [ ] Cleaned up any port conflicts
└─ [ ] Port [NUMBER] selected and confirmed

🚀 SERVER STARTUP
├─ [ ] Server configuration prepared
├─ [ ] Production mode set (if Next.js)
├─ [ ] Server process started on port [NUMBER]
├─ [ ] Waited for initialization ([X] seconds)
└─ [ ] Server logs checked for errors

✓ TRADITIONAL VERIFICATION
├─ [ ] Port is actively listening
├─ [ ] HTTP response received (status: [CODE])
├─ [ ] Response content verified as correct application
├─ [ ] No startup errors in logs
└─ [ ] Base URL confirmed: http://localhost:[PORT]

🔍 UI VERIFIER VISUAL VERIFICATION (NO CLICKS/INTERACTIONS)
├─ [ ] check_dev_server - Server responding
├─ [ ] take_screenshot - Visual capture saved
├─ [ ] get_console_logs - Console checked for errors
├─ [ ] verify_ui_element - Elements visible and positioned
├─ [ ] check_accessibility - Visual accessibility verified
└─ [ ] Console confirmed clean after fixes (if any)

📝 TASK-SPECIFIC REQUIREMENTS
├─ [ ] Task type identified: [TYPE]
├─ [ ] Requirements understood
├─ [ ] Implementation strategy planned
├─ [ ] Baseline visual state captured
└─ [ ] Ready to begin development

═══════════════════════════════════════════════════════════════
Status: [IN PROGRESS/READY/FAILED]
Time Elapsed: [XX seconds]
═══════════════════════════════════════════════════════════════
```

### 📊 DEVELOPMENT CHANGE CHECKLIST

**Display this for EVERY code change:**

```markdown
═══════════════════════════════════════════════════════════════
🔄 CHANGE VERIFICATION CHECKLIST (VISUAL ONLY)
═══════════════════════════════════════════════════════════════

📸 BEFORE CHANGES
├─ [ ] Screenshot captured (baseline)
├─ [ ] Console state recorded
├─ [ ] Element positions documented
├─ [ ] Visual layout saved
└─ [ ] Current UI state documented

✏️ IMPLEMENTING CHANGES
├─ [ ] Change type: [Frontend/Backend/Style/Layout]
├─ [ ] Files modified: [COUNT]
├─ [ ] Code syntax verified
├─ [ ] Dependencies checked
└─ [ ] Build successful (if applicable)

🔍 AFTER CHANGES - VISUAL VERIFICATION ONLY
├─ [ ] Hot reload detected (if applicable)
├─ [ ] New elements visible on screen
├─ [ ] Elements properly aligned and positioned
├─ [ ] Console errors: [NONE/FOUND/FIXED]
├─ [ ] Visual comparison: [CHANGES VISIBLE/NOT VISIBLE]
└─ [ ] Layout integrity maintained

🛠️ CONSOLE ERROR RESOLUTION (if needed)
├─ [ ] Console errors identified: [COUNT]
├─ [ ] Error details captured
├─ [ ] Fixes applied to code
├─ [ ] Console re-checked after fixes
└─ [ ] Console confirmed clean

✅ FINAL VISUAL VERIFICATION
├─ [ ] Visual changes match requirements
├─ [ ] No visual regressions
├─ [ ] Elements properly positioned
├─ [ ] Console completely clean
└─ [ ] Screenshot documented

═══════════════════════════════════════════════════════════════
Change Status: [SUCCESS/PENDING/FAILED]
Console Errors Fixed: [COUNT]
Visual Verifications: [COUNT]
═══════════════════════════════════════════════════════════════
```

### 📊 FINAL DELIVERY CHECKLIST

**Display before reporting any task as complete:**

```markdown
═══════════════════════════════════════════════════════════════
✅ FINAL DELIVERY VERIFICATION (VISUAL FOCUS)
═══════════════════════════════════════════════════════════════

🎯 TASK COMPLETION
├─ [ ] Visual requirements met
├─ [ ] All UI elements visible
├─ [ ] Proper alignment verified
├─ [ ] Visual changes confirmed
└─ [ ] Layout goals achieved

🔍 VISUAL QUALITY ASSURANCE
├─ [ ] No console errors present
├─ [ ] All elements properly positioned
├─ [ ] Responsive layout verified (visual only)
├─ [ ] Visual hierarchy correct
└─ [ ] Accessibility score: [SCORE]/100

📸 DOCUMENTATION
├─ [ ] Before/after screenshots taken
├─ [ ] Visual changes documented
├─ [ ] Console log history clean
├─ [ ] Known visual issues noted
└─ [ ] Visual guidelines provided

🚀 DEPLOYMENT READINESS
├─ [ ] Production mode enabled (if applicable)
├─ [ ] Console errors: ZERO
├─ [ ] Visual presentation perfect
├─ [ ] All elements rendered
└─ [ ] Screenshots confirm readiness

🎉 FINAL CONFIRMATION
├─ [ ] Server URL: http://localhost:[PORT]
├─ [ ] All visual elements confirmed
├─ [ ] Console verified clean
├─ [ ] UI Verifier visual confirmation
└─ [ ] Ready for user review

═══════════════════════════════════════════════════════════════
DELIVERY STATUS: ✅ VISUALLY VERIFIED AND READY
Total Time: [XX minutes]
Console Errors Resolved: [COUNT]
Visual Checks Passed: [COUNT]
═══════════════════════════════════════════════════════════════
```

---

## 🎯 CORE PRINCIPLE - VISUAL VERIFICATION ONLY
**The UI Verifier performs VISUAL VERIFICATION ONLY - no click simulation, no functionality testing, no interaction testing. It ensures elements are visible, properly positioned, and the console is clean. Functionality testing is the user's responsibility.**

---

## 📋 UI VERIFIER VISUAL-ONLY PROTOCOL

### What UI Verifier DOES:
✅ **Takes screenshots** to verify visual changes
✅ **Checks element visibility** without interaction
✅ **Verifies positioning and alignment** visually
✅ **Monitors console logs** for errors
✅ **Reports console issues** to Claude Code
✅ **Re-checks console** after fixes
✅ **Documents visual state** with screenshots
✅ **Compares visual changes** before/after

### What UI Verifier DOES NOT DO:
❌ **NO clicking buttons**
❌ **NO form submissions**
❌ **NO interaction simulation**
❌ **NO functionality testing**
❌ **NO user flow testing**
❌ **NO event triggering**
❌ **NO dynamic behavior testing**
❌ **NO API response testing through UI**

---

## 📋 DETAILED IMPLEMENTATION GUIDE

### Phase 1: MCP Server Health Check (MANDATORY FIRST STEP)

**Show user**: "🔄 Initializing MCP Server Health Check..."

```bash
# AUTOMATIC MCP HEALTH CHECK SEQUENCE
1. Test MCP Connection
   ✓ Update checklist: "MCP Server Connection Test"
   - Check if ui-verifier commands are available
   - If NOT connected:
     ⚠️ Show: "MCP not connected, attempting auto-fix..."
     a. Verify node exists: which node
     b. Check config: cat ~/.claude.json
     c. Verify server file: ls ~/ui-verifier-mcp/working-mcp.js
     d. Fix any path issues found
     e. Restart MCP server
     f. Wait 3 seconds
     g. Re-test connection
     ✅ Update: "MCP Server Connection Test"

2. Validate MCP Visual Tools
   ✓ Update checklist: "UI Verifier Tools Available"
   - Test command: "Use ui-verifier to take a screenshot"
   - If ERROR:
     ⚠️ Show: "Visual tools not responding, running diagnostics..."
     a. Check node_modules: ls ~/ui-verifier-mcp/node_modules
     b. Run npm install if needed
     c. Verify Puppeteer/Chrome available
     d. Restart and retry
     ✅ Update: "UI Verifier Tools Available"

3. Confirm Visual Tools Responsive
   ✓ Update checklist: "Chrome/Puppeteer Functional"
   - check_dev_server → Must respond
   - take_screenshot → Must work
   - get_console_logs → Must function
   ✅ Update: "Chrome/Puppeteer Functional"
```

### Phase 2: Port Allocation & Server Startup

**Show user**: "🔍 Finding available port and starting server..."

#### Step 1: Determine Port Status
```javascript
// Update checklist item by item
console.log("Checking existing server status...");
// ✓ Update: "Checked existing server status"

if (applicationHasRunningServer) {
  console.log(`Found existing server on port ${currentPort}`);
  // Verify with: Use ui-verifier to check_dev_server at current port
  if (serverHealthy) {
    // ✓ Update: "Port [NUMBER] selected and confirmed"
    // Continue to Phase 3
  } else {
    console.log("Existing server unhealthy, restarting...");
    // Proceed to Step 2
  }
} else {
  console.log("No existing server found, allocating new port...");
  // Proceed to Step 2
}
```

#### Step 2: Find Available Port
```javascript
// PORT SELECTION ALGORITHM
console.log("Scanning for available port starting from 3000...");
let port = 3000;
let portFound = false;

while (!portFound) {
  console.log(`Checking port ${port}...`);
  const isUsed = await checkPortInUse(port);
  
  if (!isUsed) {
    console.log(`✅ Port ${port} is available!`);
    portFound = true;
    selectedPort = port;
    // ✓ Update: "Found available port (starting from 3000)"
    // ✓ Update: "Port [NUMBER] selected and confirmed"
  } else {
    console.log(`Port ${port} is in use, checking if it's our app...`);
    const response = await fetch(`http://localhost:${port}`);
    if (isOurApplication(response)) {
      console.log("Found our app, cleaning up...");
      await killProcessOnPort(port);
      await sleep(2000);
      // ✓ Update: "Cleaned up any port conflicts"
      portFound = true;
      selectedPort = port;
    } else {
      console.log(`Port ${port} used by another app, trying ${port + 1}...`);
      port++;
    }
  }
}
```

#### Step 3: Start Server with Verification
```javascript
console.log(`Starting server on port ${selectedPort}...`);
// ✓ Update: "Server configuration prepared"

// Special handling for Next.js
if (framework === 'next.js' && isProduction) {
  console.log("Setting production mode for Next.js...");
  // ✓ Update: "Production mode set (if Next.js)"
}

const startCommand = getStartCommand(framework, selectedPort);
await startServer(startCommand, {
  port: selectedPort,
  logFile: `server-${selectedPort}.log`,
  mode: isProduction ? 'production' : 'development'
});
// ✓ Update: "Server process started on port [NUMBER]"

// Wait for initialization
const waitTime = {
  'next.js': 10000,
  'react': 8000,
  'express': 3000,
  'python': 2000,
  'default': 5000
};

const wait = waitTime[framework] || waitTime.default;
console.log(`Waiting ${wait/1000} seconds for server initialization...`);
await sleep(wait);
// ✓ Update: "Waited for initialization ([X] seconds)"

// Check logs
console.log("Checking server logs for errors...");
const logs = await readServerLogs();
// ✓ Update: "Server logs checked for errors"
```

### Phase 3: Visual-Only Verification

**Show user**: "🔍 Running visual verification suite (no functionality testing)..."

#### Layer 1: Traditional Verification
```javascript
console.log("Starting traditional verification...");

// Basic connectivity check
console.log("Checking if port is listening...");
const portListening = await checkPortListening(selectedPort);
if (portListening) {
  // ✓ Update: "Port is actively listening"
} else {
  console.log("⚠️ Port not listening, troubleshooting...");
  const logs = await readServerLogs();
  await diagnoseAndFix(logs);
}

// HTTP response check
console.log("Testing HTTP response...");
const response = await fetch(`http://localhost:${selectedPort}`);
if (response.ok) {
  console.log(`✅ Received HTTP ${response.status}`);
  // ✓ Update: "HTTP response received (status: [CODE])"
} else {
  console.log(`⚠️ HTTP error ${response.status}, fixing...`);
  await troubleshootHTTPError(response);
}

// Content verification
console.log("Verifying application content...");
const content = await response.text();
if (isExpectedApplication(content)) {
  // ✓ Update: "Response content verified as correct application"
} else {
  console.log("⚠️ Wrong application served, investigating...");
  await verifyCorrectApplicationServed();
}

// ✓ Update: "No startup errors in logs"
// ✓ Update: "Base URL confirmed: http://localhost:[PORT]"
```

#### Layer 2: UI Verifier Visual-Only Verification
```javascript
console.log("Starting UI Verifier VISUAL ONLY verification...");
console.log("NOTE: No functionality testing will be performed - visual verification only");

// 1. Server Check
console.log("Verifying server with UI Verifier...");
await execute(`Use ui-verifier to check if localhost:${port} is running`);
// ✓ Update: "check_dev_server - Server responding"

// 2. Visual Documentation
console.log("Taking screenshot for visual verification...");
await execute(`Use ui-verifier to take a screenshot`);
// ✓ Update: "take_screenshot - Visual capture saved"

// 3. Console Health Check - CRITICAL
console.log("Checking console for errors...");
const consoleLogs = await execute(`Use ui-verifier to get console logs`);
if (consoleLogs.errors.length > 0) {
  console.log(`⚠️ Found ${consoleLogs.errors.length} console errors`);
  console.log("Reporting to Claude Code for fixes...");
  // Fix errors
  await fixConsoleErrors(consoleLogs.errors);
  // Re-check console
  console.log("Re-checking console after fixes...");
  const recheck = await execute(`Use ui-verifier to get console logs`);
  if (recheck.errors.length === 0) {
    console.log("✅ Console now clean!");
  } else {
    console.log("⚠️ Some errors persist, attempting additional fixes...");
  }
}
// ✓ Update: "get_console_logs - Console checked and cleaned"

// 4. Visual Element Verification (NO INTERACTION)
console.log("Verifying element visibility and positioning...");
await execute(`Use ui-verifier to verify main application container is visible and properly positioned`);
// ✓ Update: "verify_ui_element - Elements visible and positioned"

// 5. Visual Accessibility Check
console.log("Running visual accessibility audit...");
const score = await execute(`Use ui-verifier to check visual accessibility`);
console.log(`Visual accessibility score: ${score}/100`);
// ✓ Update: "check_accessibility - Visual accessibility verified"

// 6. Final Console Verification
console.log("Final console check to ensure it's clean...");
const finalConsoleCheck = await execute(`Use ui-verifier to get console logs`);
if (finalConsoleCheck.errors.length === 0) {
  // ✓ Update: "Console confirmed clean after fixes"
} else {
  console.log("⚠️ Console still has errors, documenting for user...");
}

// ✓ Update: "All visual verification complete"
```

---

## 🔄 CONTINUOUS DEVELOPMENT VERIFICATION PROTOCOL

### Display for Every Change
**Show user**: "📝 Implementing changes with visual verification only..."

### Pre-Change Visual Baseline
```javascript
console.log("📸 Capturing visual baseline before changes...");

async function captureVisualBaseline() {
  const baseline = {};
  
  console.log("Taking screenshot...");
  baseline.screenshot = await execute("Use ui-verifier to take_screenshot");
  // ✓ Update: "Screenshot captured (baseline)"
  
  console.log("Recording console state...");
  baseline.console = await execute("Use ui-verifier to get_console_logs");
  // ✓ Update: "Console state recorded"
  
  console.log("Documenting element positions...");
  baseline.elementPositions = await execute("Use ui-verifier to verify element positions");
  // ✓ Update: "Element positions documented"
  
  console.log("Saving visual layout...");
  baseline.layout = await execute("Use ui-verifier to capture layout");
  // ✓ Update: "Visual layout saved"
  
  // ✓ Update: "Current UI state documented"
  
  return baseline;
}
```

### Post-Change Visual Verification
```javascript
console.log("🔍 Verifying visual changes only (no functionality testing)...");

async function verifyVisualChanges(changeType, baseline) {
  console.log(`Change type: ${changeType}`);
  console.log("NOTE: Performing visual verification only - no clicks or interactions");
  // ✓ Update: "Change type: [Frontend/Backend/Style/Layout]"
  
  const verification = {};
  
  switch(changeType) {
    case 'frontend':
    case 'style':
    case 'layout':
      console.log("Waiting for hot reload...");
      await execute("Use ui-verifier to wait_for_hot_reload");
      // ✓ Update: "Hot reload detected (if applicable)"
      
      console.log("Checking if new elements are visible...");
      verification.elementsVisible = await execute(
        `Use ui-verifier to verify new elements are visible and properly positioned`
      );
      // ✓ Update: "New elements visible on screen"
      
      console.log("Verifying element alignment...");
      verification.alignment = await execute(
        "Use ui-verifier to check element alignment and positioning"
      );
      // ✓ Update: "Elements properly aligned and positioned"
      
      console.log("CRITICAL: Checking console for errors...");
      verification.consoleErrors = await execute(
        "Use ui-verifier to check for console errors"
      );
      if (verification.consoleErrors.length > 0) {
        console.log(`⚠️ Found ${verification.consoleErrors.length} console errors`);
        await fixConsoleErrors(verification.consoleErrors);
        // Re-check console
        const recheck = await execute("Use ui-verifier to get console logs");
        verification.consoleClean = recheck.errors.length === 0;
      }
      // ✓ Update: "Console errors: [NONE/FOUND/FIXED]"
      
      console.log("Taking screenshot for visual comparison...");
      verification.visual = await execute(
        "Use ui-verifier to take screenshot and compare visually"
      );
      // ✓ Update: "Visual comparison: [CHANGES VISIBLE/NOT VISIBLE]"
      
      console.log("Checking layout integrity...");
      verification.layout = await execute(
        "Use ui-verifier to verify layout integrity"
      );
      // ✓ Update: "Layout integrity maintained"
      break;
      
    case 'backend':
      console.log("Backend changes - checking for console errors only...");
      verification.consoleErrors = await execute(
        "Use ui-verifier to check for console errors"
      );
      if (verification.consoleErrors.length > 0) {
        console.log(`⚠️ Backend changes caused ${verification.consoleErrors.length} console errors`);
        await fixConsoleErrors(verification.consoleErrors);
      }
      // ✓ Update: "Console checked after backend changes"
      
      console.log("Verifying UI still renders correctly...");
      verification.uiIntact = await execute(
        "Use ui-verifier to verify UI elements still visible"
      );
      // ✓ Update: "UI elements still visible"
      break;
  }
  
  // Fix any console errors found
  if (verification.consoleErrors && verification.consoleErrors.length > 0) {
    console.log(`⚠️ Fixing ${verification.consoleErrors.length} console errors...`);
    // ✓ Update: "Console errors identified: [COUNT]"
    await fixConsoleErrors(verification.consoleErrors);
    // ✓ Update: "Fixes applied to code"
    
    // ALWAYS re-check console after fixes
    console.log("Re-checking console to ensure it's clean...");
    const finalCheck = await execute("Use ui-verifier to get console logs");
    if (finalCheck.errors.length === 0) {
      console.log("✅ Console now completely clean!");
      // ✓ Update: "Console confirmed clean"
    } else {
      console.log("⚠️ Some console errors persist, documenting...");
      // ✓ Update: "Some console errors remain"
    }
  }
  
  console.log("✅ Visual verification complete!");
  // ✓ Update: "Visual changes verified"
  
  return verification;
}
```

---

## 🚨 CONSOLE ERROR RESOLUTION PROTOCOL

### Console Error Detection and Fix Cycle

**Show user**: "🔧 Console error detection and resolution..."

```javascript
async function consoleErrorResolution() {
  console.log("═══════════════════════════════════════");
  console.log("🔍 CONSOLE ERROR CHECK");
  console.log("═══════════════════════════════════════");
  
  // Step 1: Initial console check
  console.log("Checking console for errors...");
  const errors = await execute("Use ui-verifier to get console logs");
  
  if (errors.length === 0) {
    console.log("✅ Console is clean - no errors found!");
    return true;
  }
  
  console.log(`⚠️ Found ${errors.length} console errors:`);
  errors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error.type}: ${error.message}`);
  });
  
  // Step 2: Categorize errors
  const errorCategories = {
    syntax: [],
    reference: [],
    type: [],
    network: [],
    other: []
  };
  
  errors.forEach(error => {
    if (error.message.includes('SyntaxError')) errorCategories.syntax.push(error);
    else if (error.message.includes('ReferenceError')) errorCategories.reference.push(error);
    else if (error.message.includes('TypeError')) errorCategories.type.push(error);
    else if (error.message.includes('Failed to fetch') || error.message.includes('404')) errorCategories.network.push(error);
    else errorCategories.other.push(error);
  });
  
  // Step 3: Apply fixes by category
  for (const [category, categoryErrors] of Object.entries(errorCategories)) {
    if (categoryErrors.length > 0) {
      console.log(`Fixing ${categoryErrors.length} ${category} errors...`);
      await fixErrorCategory(category, categoryErrors);
    }
  }
  
  // Step 4: Re-check console after fixes
  console.log("Re-checking console after applying fixes...");
  const recheckErrors = await execute("Use ui-verifier to get console logs");
  
  if (recheckErrors.length === 0) {
    console.log("✅ All console errors resolved!");
    return true;
  } else {
    console.log(`⚠️ ${recheckErrors.length} errors remain after fixes`);
    console.log("Attempting secondary fixes...");
    
    // Step 5: Second attempt at fixing
    await secondaryErrorFixes(recheckErrors);
    
    // Step 6: Final console check
    console.log("Final console check...");
    const finalErrors = await execute("Use ui-verifier to get console logs");
    
    if (finalErrors.length === 0) {
      console.log("✅ Console now clean after secondary fixes!");
      return true;
    } else {
      console.log(`⚠️ ${finalErrors.length} persistent errors documented for user review`);
      return false;
    }
  }
}
```

### Common Console Error Auto-Fix Patterns

```javascript
const CONSOLE_ERROR_FIXES = {
  // Syntax Errors
  syntaxError: async (error) => {
    console.log(`Fixing syntax error in ${error.file}:${error.line}`);
    // Check for missing brackets, semicolons, quotes
    await fixSyntaxInFile(error.file, error.line);
    console.log("Syntax fix applied");
  },
  
  // Reference Errors
  referenceError: async (error) => {
    console.log(`Fixing reference error: ${error.variable} is not defined`);
    // Check if variable needs to be declared or imported
    await declareOrImportVariable(error.variable);
    console.log("Reference fix applied");
  },
  
  // Type Errors
  typeError: async (error) => {
    console.log(`Fixing type error: ${error.message}`);
    // Add null checks, type conversions
    await addTypeChecks(error.location);
    console.log("Type fix applied");
  },
  
  // Network/Resource Errors
  resourceError: async (error) => {
    console.log(`Fixing resource error: ${error.resource}`);
    // Check file paths, URLs
    await fixResourcePath(error.resource);
    console.log("Resource fix applied");
  },
  
  // React-specific Errors
  reactError: async (error) => {
    console.log(`Fixing React error: ${error.message}`);
    // Fix key props, hooks usage, etc.
    await fixReactIssue(error);
    console.log("React fix applied");
  }
};
```

---

## 🏁 FINAL VISUAL VERIFICATION BEFORE REPORTING READY

### The Visual-Only Verification Checklist

**Show user**: "🎯 Running final visual verification (no functionality testing)..."

```javascript
async function canReportReady() {
  console.log("═══════════════════════════════════════");
  console.log("🎯 FINAL VISUAL VERIFICATION");
  console.log("NO FUNCTIONALITY TESTING - VISUAL ONLY");
  console.log("═══════════════════════════════════════");
  
  const checks = {
    'MCP Server Health': await testMCPConnection(),
    'Server Running': await execute("Use ui-verifier to check_dev_server"),
    'Screenshot Captured': await execute("Use ui-verifier to take_screenshot"),
    'Console Completely Clean': await ensureConsoleClean(),
    'Elements Visible': await verifyAllElementsVisible(),
    'Elements Properly Positioned': await checkElementPositioning(),
    'Visual Layout Correct': await verifyLayoutIntegrity(),
    'Visual Accessibility OK': await checkVisualAccessibility(),
    'Task Visually Complete': await verifyVisualRequirements()
  };
  
  // Display results
  for (const [check, passed] of Object.entries(checks)) {
    if (passed) {
      console.log(`✅ ${check}`);
    } else {
      console.log(`❌ ${check} - Fixing...`);
      await fixIssue(check);
      return canReportReady(); // Recursive retry
    }
  }
  
  console.log("═══════════════════════════════════════");
  console.log("✅ VISUAL VERIFICATION COMPLETE!");
  console.log("Note: Functionality testing not performed");
  console.log("User should test interactive features");
  console.log("═══════════════════════════════════════");
  
  return true;
}

// Special function to ensure console is completely clean
async function ensureConsoleClean() {
  const errors = await execute("Use ui-verifier to get console logs");
  if (errors.length > 0) {
    console.log(`⚠️ Console has ${errors.length} errors, cleaning...`);
    await fixConsoleErrors(errors);
    // Re-check
    const recheck = await execute("Use ui-verifier to get console logs");
    return recheck.length === 0;
  }
  return true;
}
```

---

## 📝 FRAMEWORK-SPECIFIC VISUAL CONFIGURATIONS

### Next.js
```javascript
{
  mode: 'production', // ALWAYS for deployment
  buildCommand: 'npm run build',
  startCommand: 'npm run start',
  initTime: 10000,
  defaultPort: 3000,
  visualChecks: [
    '✓ Production mode enabled (no dev indicator)',
    '✓ All pages render visually',
    '✓ Components visible on screen',
    '✓ Layout structure intact',
    '✓ Console errors: ZERO',
    '✓ Visual elements positioned correctly'
  ]
}
```

### React
```javascript
{
  mode: 'development', // or 'production'
  startCommand: 'npm start',
  buildCommand: 'npm run build',
  initTime: 8000,
  defaultPort: 3000,
  visualChecks: [
    '✓ React app renders visually',
    '✓ Components visible',
    '✓ No React errors in console',
    '✓ Layout displays correctly',
    '✓ Visual hierarchy maintained',
    '✓ Console completely clean'
  ]
}
```

---

## ⚡ UI VERIFIER VISUAL-ONLY COMMANDS

### Essential Visual Verification Commands
```bash
# Server Verification (No interaction)
"Use ui-verifier to check if localhost:[PORT] is running"
→ Update: "✅ Server verified at port [PORT]"

# Visual Documentation Only
"Use ui-verifier to take a screenshot"
→ Update: "✅ Screenshot captured for visual verification"

# Console Monitoring (CRITICAL)
"Use ui-verifier to check for console errors"
→ Update: "✅ Console clean" or "⚠️ [X] errors found - fixing..."

# Visual Element Verification (NO CLICKS)
"Use ui-verifier to verify [element] is visible and properly positioned"
→ Update: "✅ Element [name] visible and positioned"

# Visual Accessibility
"Use ui-verifier to check visual accessibility"
→ Update: "✅ Visual accessibility: [SCORE]/100"

# Layout Verification
"Use ui-verifier to verify layout integrity"
→ Update: "✅ Layout structure intact"

# Visual Comparison
"Use ui-verifier to compare visual changes"
→ Update: "✅ Visual changes as expected"
```

### Console Error Commands
```bash
# Initial Console Check
"Use ui-verifier to get all console logs"
→ Check for errors, warnings, logs

# After Fixes
"Use ui-verifier to verify console is clean"
→ Ensure no errors remain

# Continuous Monitoring
"Use ui-verifier to monitor console during changes"
→ Catch errors as they appear
```

### What NOT to Use
```bash
❌ NEVER USE THESE COMMANDS:
- "Use ui-verifier to click [button]"
- "Use ui-verifier to submit form"
- "Use ui-verifier to test interaction"
- "Use ui-verifier to simulate user action"
- "Use ui-verifier to test functionality"
- "Use ui-verifier to verify button works"
- "Use ui-verifier to check if form submits"
```

---

## 🎯 SUMMARY: Visual-Only Verification Flow

### Every Session Must Follow This Pattern:

1. **DISPLAY INITIAL CHECKLIST** 
   - Show visual verification checklist
   - Emphasize: NO functionality testing
   - Focus on visual and console checks

2. **RUN MCP HEALTH CHECK**
   - Verify visual tools available
   - No interaction tools needed
   - Console monitoring ready

3. **ALLOCATE PORT & START SERVER**
   - Same as before
   - Focus on server health
   - No functionality implications

4. **VISUAL VERIFICATION ONLY**
   - Take screenshots
   - Check element visibility
   - Verify positioning
   - NO CLICKS OR INTERACTIONS

5. **CONSOLE ERROR RESOLUTION**
   - Check console for errors
   - Fix all errors found
   - Re-check until clean
   - Document persistent issues

6. **SHOW READY STATUS**
   - Display visual verification complete
   - Remind user: functionality not tested
   - Console confirmed clean

### For Every Change:

1. **CAPTURE VISUAL BASELINE**
   - Screenshot current state
   - Record console state
   - Document positions

2. **IMPLEMENT CHANGES**
   - Make code modifications
   - Build/compile as needed

3. **VISUAL VERIFICATION ONLY**
   - Check elements visible
   - Verify positioning correct
   - NO functionality testing

4. **CONSOLE ERROR CYCLE**
   - Check for new errors
   - Fix any found
   - Re-check until clean

5. **DOCUMENT VISUAL STATE**
   - Take final screenshot
   - Confirm visual requirements met
   - Console verified clean

---

## 🔴 CRITICAL RULES FOR VISUAL-ONLY VERIFICATION

### Rule 1: Never Test Functionality
- NO clicking elements
- NO form submissions
- NO interaction simulation
- ONLY visual verification

### Rule 2: Console is Priority
- ALWAYS check console for errors
- ALWAYS fix errors found
- ALWAYS re-check after fixes
- NEVER report ready with console errors

### Rule 3: Visual Focus
- Verify elements are visible
- Check positioning and alignment
- Document with screenshots
- Compare visual changes

### Rule 4: Transparent Communication
- Tell user: "Visual verification only"
- Remind: "Functionality not tested"
- Report: "Console clean"
- Suggest: "Please test interactive features"

### Rule 5: Console Error Loop
- Check console → Find errors → Fix → Re-check
- Repeat until console is clean
- Document any persistent issues
- Never skip console verification

---

## 📌 FINAL REMINDER

**UI Verifier performs VISUAL VERIFICATION ONLY:**
- ✅ Screenshots for visual confirmation
- ✅ Element visibility checks
- ✅ Position and alignment verification
- ✅ Console error monitoring and fixing
- ❌ NO functionality testing
- ❌ NO click simulation
- ❌ NO interaction testing

```markdown
═══════════════════════════════════════════════════════════════
Remember: 
- VISUAL verification only
- CONSOLE must be clean
- NO clicks or interactions
- FIX all console errors
- DOCUMENT with screenshots
═══════════════════════════════════════════════════════════════

UI Verifier Focus:
✅ Visual elements present
✅ Proper positioning
✅ Console errors: ZERO
✅ Screenshots documented
❌ Functionality NOT tested
═══════════════════════════════════════════════════════════════
```

---

## 🚀 QUICK START TEMPLATE

### Copy this template at the start of every session:

```markdown
Starting new development session...
UI Verifier Mode: VISUAL ONLY (No functionality testing)

═══════════════════════════════════════════════════════════════
🔧 SYSTEM INITIALIZATION - VISUAL VERIFICATION FOCUS
═══════════════════════════════════════════════════════════════

📋 PRE-FLIGHT CHECKS
├─ [ ] MCP Server Connection Test
├─ [ ] Visual verification tools ready
├─ [ ] Screenshot capability confirmed
├─ [ ] Console monitoring available
└─ [ ] NO interaction testing (visual only)

[Continue with visual-only checklist...]
═══════════════════════════════════════════════════════════════

Beginning visual verification process...
Console will be monitored and kept clean...
NO functionality testing will be performed...
```

---

**End of Enhanced Claude Code Protocol - Version 3.0**
**Visual Verification Only - No Functionality Testing**

*This protocol ensures visual correctness and console cleanliness without testing functionality. All interactive testing is the user's responsibility.*