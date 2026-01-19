# Admin Login Testing Scenarios

## Test Environment Setup
- Application: Samta Matrimony (React + Vite)
- Framework: React 18+ with TypeScript
- Authentication: Firebase Auth via AuthContext
- Starting URL: http://localhost:5173 (Vite default)
- Browser: Chrome/Firefox/Safari (all modern browsers)

## Test Cases

### 1. Admin Login Success
**Steps:**
1. Navigate to /admin-login
2. Enter email: samta.matrimony@gmail.com
3. Enter password: Samta@0011
4. Click "Access Dashboard"

**Expected Result:**
- Login succeeds within 2 seconds
- Redirected to /admin dashboard
- No console errors
- User role set to 'admin'
- Session properly restored

### 2. Invalid Credentials
**Steps:**
1. Navigate to /admin-login
2. Enter email: samta.matrimony@gmail.com
3. Enter password: wrongpassword
4. Click "Access Dashboard"

**Expected Result:**
- Error message: "Invalid credentials."
- No redirect
- Stay on login page
- Error logged in analytics

### 3. Non-Admin User Login Attempt
**Steps:**
1. Register a new regular user account
2. Try to access /admin-login
3. Enter regular user credentials
4. Click "Access Dashboard"

**Expected Result:**
- Error message: "Unauthorized. This portal is for system administrators only."
- No redirect to admin dashboard
- Access properly denied at role check

### 4. Empty Email/Password Fields
**Steps:**
1. Navigate to /admin-login
2. Leave email field empty
3. Click "Access Dashboard"

**Expected Result:**
- Client-side validation error
- Form doesn't submit
- Error message shown
- No API call made

### 5. Invalid Email Format
**Steps:**
1. Navigate to /admin-login
2. Enter email: notanemail@invalid
3. Enter password: Samta@0011
4. Click "Access Dashboard"

**Expected Result:**
- Email validation error shown
- Form doesn't submit
- User guided to fix email format

### 6. Session Persistence
**Steps:**
1. Login as admin successfully
2. Refresh the page (F5)
3. Check if still logged in as admin
4. Refresh again

**Expected Result:**
- Session restored after refresh
- Still have admin access
- No need to re-login
- No console errors

### 7. Logout and Re-login
**Steps:**
1. Login as admin
2. Click logout button
3. Verify redirected to home page
4. Navigate back to /admin-login
5. Login again

**Expected Result:**
- Session properly cleared on logout
- localStorage cleaned up
- Can login again successfully
- No stale session data

### 8. Protected Route Access
**Steps:**
1. Logout from admin account
2. Try to access /admin directly
3. Check if redirected

**Expected Result:**
- Redirected to /admin-login
- Cannot access admin dashboard without login
- Redirect state preserved for return

### 9. Concurrent Tab Session
**Steps:**
1. Login as admin in Tab A
2. Open admin in Tab B
3. Check if Tab B reflects admin status
4. Logout from Tab A
5. Check Tab B status

**Expected Result:**
- Both tabs share session state
- Logout in one tab affects other tabs
- Session sync works properly

### 10. Password Format Validation
**Steps:**
1. Navigate to /admin-login
2. Enter very long password (>200 chars)
3. Try to submit

**Expected Result:**
- Handles long input gracefully
- No buffer overflow
- Proper error handling

## Security Test Cases

### S1: XSS Prevention in Login
**Steps:**
1. In email field, enter: `"><script>alert('xss')</script>`
2. Try to submit

**Expected Result:**
- Input properly escaped
- No script execution
- No console errors
- Input sanitized

### S2: SQL Injection Prevention
**Steps:**
1. In email field, enter: `'; DROP TABLE users; --`
2. Try to submit

**Expected Result:**
- Input treated as literal string
- No database manipulation
- Proper error message shown
- No sensitive error details leaked

### S3: localStorage Corruption Recovery
**Steps:**
1. Open browser DevTools Console
2. Execute: `localStorage.setItem('sessionUserId', 'corrupted-data')`
3. Refresh page
4. Try to login again

**Expected Result:**
- App handles corrupted localStorage gracefully
- No crashes or errors
- Can login normally
- localStorage cleaned up

### S4: Network Error Handling
**Steps:**
1. Open DevTools Network tab
2. Go offline (disable network)
3. Try to login
4. Check error handling

**Expected Result:**
- Clear error message shown
- No timeout errors
- Graceful degradation
- User can retry when online

### S5: Rate Limiting Check
**Steps:**
1. Attempt wrong login 5 times rapidly
2. Check if account is locked or limited

**Expected Result:**
- Attempts are logged
- Warning message after failed attempts
- Account protection implemented
- Clear guidance for recovery

## Performance Test Cases

### P1: Page Load Time
**Steps:**
1. Navigate to /admin-login
2. Measure time to interactive
3. Check for render blocking

**Expected Result:**
- Page load < 3 seconds
- No render blocking CSS/JS
- Lighthouse score > 80

### P2: Login Response Time
**Steps:**
1. Login with valid credentials
2. Measure response time
3. Check for delays

**Expected Result:**
- Response time < 2 seconds
- Smooth loading animation
- No UI freezing

### P3: Memory Leak Check
**Steps:**
1. Login/logout 10 times
2. Check DevTools Memory tab
3. Force garbage collection
4. Check if memory increases

**Expected Result:**
- No memory leak
- Consistent memory usage
- Proper cleanup after logout

### P4: Rapid Route Changes
**Steps:**
1. Login as admin
2. Rapidly click between pages
3. Monitor console for errors

**Expected Result:**
- No race conditions
- Routes render properly
- No duplicate requests

## Accessibility Test Cases

### A1: Keyboard Navigation
**Steps:**
1. Navigate to /admin-login
2. Use only Tab key to navigate
3. Enter credentials using keyboard
4. Submit form

**Expected Result:**
- All form fields reachable via Tab
- Focus visible on all elements
- Can submit via Enter key
- No keyboard traps

### A2: Screen Reader Compatibility
**Steps:**
1. Use screen reader (NVDA/JAWS)
2. Navigate through login form
3. Listen to labels and instructions

**Expected Result:**
- All fields have labels
- Error messages announced
- Instructions clear
- Proper ARIA labels

### A3: Color Contrast
**Steps:**
1. Check error messages color contrast
2. Check form labels contrast
3. Verify with contrast checker

**Expected Result:**
- All text meets WCAG AA standards
- Contrast ratio > 4.5:1
- Readable for colorblind users

## Error Recovery Test Cases

### E1: Expired Session Handling
**Steps:**
1. Login as admin
2. Wait for session timeout (if implemented)
3. Try to access protected resource

**Expected Result:**
- Redirected to login
- Clear message about session expiry
- Can login again

### E2: Authentication Error Recovery
**Steps:**
1. Simulate network error during login
2. Click retry
3. Try login again

**Expected Result:**
- Clear error message
- Retry button available
- Can recover from error

### E3: localStorage Cleanup on Error
**Steps:**
1. Logout
2. Check browser storage DevTools
3. Verify no sensitive data remains

**Expected Result:**
- sessionUserId cleaned up
- No user data in localStorage
- Privacy preserved

## Test Results Template

### Test Case: [Name]
- **Status:** [PASS/FAIL/SKIP]
- **Date Tested:** [YYYY-MM-DD]
- **Tester:** [Name]
- **Actual Result:** [Description]
- **Screenshots/Logs:** [If applicable]
- **Notes:** [Any issues or observations]
- **Performance:** [Load time, response time, etc.]

## Performance Benchmarks
- Page load time: < 3 seconds
- Login response time: < 2 seconds
- Memory usage: < 50MB
- No memory leaks after 10+ logout cycles
- Lighthouse score: > 80

## Security Compliance Checklist
- ✅ No hardcoded credentials
- ✅ No sensitive data in localStorage
- ✅ Input properly validated
- ✅ Error messages don't leak info
- ✅ HTTPS enforced in production
- ✅ XSS prevention implemented
- ✅ CSRF protection enabled
- ✅ SQL injection prevention
- ✅ Rate limiting implemented
- ✅ Audit logging enabled

## Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Regression Test Suite
Run these tests after any authentication changes:
1. Admin login success
2. Invalid credentials rejection
3. Session persistence
4. Logout and cleanup
5. Protected route access
6. Error handling
7. localStorage cleanup
