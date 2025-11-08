# Frontend Troubleshooting Guide

## Issue: Frontend Not Loading

### Quick Checks

1. **Verify Dev Server is Running**
   ```bash
   # Check if port 8080 is in use
   netstat -ano | findstr :8080
   
   # If not running, start it
   npm run dev
   ```

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify Route is Correct**
   - Navigate to: `http://localhost:8080/pathway-chatbot`
   - Make sure you're logged in (redirects to `/auth` if not)

### Common Issues

#### 1. Component Not Rendering
- **Check**: Browser console for React errors
- **Fix**: Clear browser cache and reload
- **Fix**: Restart dev server

#### 2. Import Errors
- **Check**: All components are imported correctly
- **Fix**: Verify all UI components exist in `src/components/ui/`

#### 3. Route Not Found
- **Check**: Route is defined in `src/App.tsx`
- **Fix**: Verify route path matches: `/pathway-chatbot`

#### 4. Authentication Issues
- **Check**: User is logged in
- **Fix**: Navigate to `/auth` first, then to `/pathway-chatbot`

### Steps to Fix

1. **Stop all servers**
   ```bash
   # Kill any running Node processes
   taskkill /F /IM node.exe
   ```

2. **Clear node_modules and reinstall**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Restart dev server**
   ```bash
   npm run dev
   ```

4. **Clear browser cache**
   - Press Ctrl+Shift+Delete
   - Clear cache and cookies
   - Reload page

5. **Check browser console**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

### Verification Steps

1. **Check if dev server is running**
   - Open `http://localhost:8080`
   - Should see the app homepage

2. **Check if route works**
   - Navigate to `http://localhost:8080/pathway-chatbot`
   - Should see the Pathway Chatbot page

3. **Check if component renders**
   - Should see:
     - Header with "Pathway Chatbot" title
     - Sidebar with "Context Files" section
     - Chat area with input field

### If Still Not Working

1. **Check for TypeScript errors**
   ```bash
   npm run lint
   ```

2. **Check for build errors**
   ```bash
   npm run build
   ```

3. **Check browser console**
   - Look for specific error messages
   - Check Network tab for 404 errors
   - Check if API calls are failing

4. **Verify all dependencies are installed**
   ```bash
   npm install
   ```

### Expected Behavior

When the frontend loads correctly, you should see:
- ✅ Header with "Pathway Chatbot" title
- ✅ Back button to dashboard
- ✅ Upload CSV button
- ✅ Sidebar with "Context Files" section
- ✅ Chat area with empty state message
- ✅ Input field at the bottom

If any of these are missing, check the browser console for errors.

