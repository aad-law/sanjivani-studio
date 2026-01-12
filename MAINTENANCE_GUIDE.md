# Maintenance Guide - Preventing Future Issues

## Overview

This guide ensures your Sanjivani Studios website remains stable and bug-free. Follow these practices to prevent the issues you just experienced.

---

## Critical: Firestore Security Rules

### Why This Matters
Without proper security rules, your database will:
- ❌ Stop working after 30 days (test mode expiration)
- ❌ Allow unauthorized deletions
- ❌ Block legitimate user actions

### Prevention Checklist

✅ **Rules are deployed** - You've already done this via Firebase Console  
✅ **Rules file exists** - `firestore.rules` is in your project  
✅ **Rules are version controlled** - File is committed to git

### Monthly Check (1st of every month)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database** → **Rules**
3. Verify rules are active (check "Last deployed" date)
4. Ensure rules match your local `firestore.rules` file

### If You Ever Need to Update Rules

**Via Firebase Console (Easiest):**
1. Go to Firebase Console → Firestore Database → Rules
2. Edit the rules directly
3. Click **Publish**

**Via CLI (If PowerShell is fixed):**
```bash
firebase deploy --only firestore:rules
```

---

## Backup Strategy

### Weekly Backups (Every Sunday)

#### 1. Export Firestore Data

**Via Firebase Console:**
1. Go to Firebase Console → Firestore Database
2. Click **Import/Export** at the top
3. Click **Export**
4. Select all collections
5. Choose a Cloud Storage bucket
6. Click **Export**

#### 2. Backup Environment Variables

Copy your `.env` file to a secure location (NOT in git):
```bash
# Create a backup folder
mkdir C:\Users\HP\Documents\SanjivaniBackups

# Copy .env file
copy .env C:\Users\HP\Documents\SanjivaniBackups\.env.backup
```

#### 3. Backup Cloudinary Settings

Document your Cloudinary configuration:
- Cloud name
- Upload preset
- Folder name

---

## Monitoring Checklist

### Daily Checks (Quick - 2 minutes)

- [ ] Website loads correctly
- [ ] Photos display on Movements page
- [ ] Review form is accessible

### Weekly Checks (5 minutes)

- [ ] Test submitting a review (use incognito mode)
- [ ] Verify review appears in ReviewMarquee
- [ ] Check admin dashboard loads
- [ ] Verify photo upload works

### Monthly Checks (10 minutes)

- [ ] Review Firestore security rules are active
- [ ] Check Firebase usage/quota
- [ ] Verify Cloudinary storage usage
- [ ] Test all major features end-to-end
- [ ] Check browser console for errors

---

## Error Prevention

### 1. Photo Display Issues

**Prevention:**
- ✅ Error handling is already implemented
- ✅ Fallback placeholders show if images fail
- ✅ Console logs errors for debugging

**If photos stop loading:**
1. Check browser console for errors
2. Verify Cloudinary account is active
3. Check Cloudinary usage limits
4. Verify URLs are accessible

### 2. Review Deletion Issues

**Prevention:**
- ✅ Firestore rules prevent unauthorized deletions
- ✅ Only admins can delete via dashboard
- ✅ Timestamps are preserved

**If reviews disappear:**
1. Check Firestore Console → Reviews collection
2. Verify security rules are deployed
3. Check admin dashboard for accidental deletions
4. Review Firebase Console activity logs

### 3. Client Submission Issues

**Prevention:**
- ✅ Public write access for reviews is enabled
- ✅ Validation rules ensure data integrity
- ✅ Error messages guide users

**If clients can't submit:**
1. Check browser console for permission errors
2. Verify Firestore rules allow public writes
3. Test in incognito mode
4. Check network connectivity

---

## Common Issues & Quick Fixes

### Issue: "Permission Denied" Errors

**Cause:** Firestore rules not deployed or incorrect

**Fix:**
1. Go to Firebase Console → Firestore → Rules
2. Verify rules match `firestore.rules` file
3. Click **Publish** if needed

### Issue: Photos Not Displaying

**Cause:** Cloudinary URL issues or image loading errors

**Fix:**
1. Check browser console for specific errors
2. Verify Cloudinary account is active
3. Test image URLs directly in browser
4. Check for ad blockers blocking images

### Issue: Reviews Not Appearing

**Cause:** Firestore connection issues or rules blocking reads

**Fix:**
1. Check browser console for errors
2. Verify internet connection
3. Check Firestore rules allow public reads
4. Clear browser cache and reload

---

## Best Practices

### Code Changes

✅ **Always test locally first** before deploying  
✅ **Keep `.env` file secure** - never commit to git  
✅ **Document any changes** to Firestore rules  
✅ **Test in incognito mode** to verify public access

### Database Management

✅ **Never delete collections** without backup  
✅ **Review admin actions** before confirming  
✅ **Monitor Firebase usage** to avoid quota limits  
✅ **Keep security rules up to date**

### Deployment

✅ **Deploy during low-traffic hours**  
✅ **Test after every deployment**  
✅ **Keep Netlify and Firebase in sync**  
✅ **Monitor for errors after deployment**

---

## Emergency Contacts & Resources

### Firebase Console
- URL: https://console.firebase.google.com/
- Your project: (check Firebase console)

### Cloudinary Dashboard
- URL: https://cloudinary.com/console
- Your cloud name: Check `.env` file

### Documentation
- Firebase Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Firestore Best Practices: https://firebase.google.com/docs/firestore/best-practices

### Quick Reference Files
- `firestore.rules` - Security rules configuration
- `FIREBASE_SETUP.md` - Deployment instructions
- `.env` - Environment variables (keep secure!)

---

## Quarterly Review (Every 3 months)

- [ ] Review all Firestore security rules
- [ ] Check Firebase billing and usage
- [ ] Verify Cloudinary storage limits
- [ ] Update dependencies if needed
- [ ] Review error logs for patterns
- [ ] Test all features comprehensively
- [ ] Update documentation if needed

---

## Version Control

### What to Commit to Git

✅ `firestore.rules` - Security rules  
✅ All source code files  
✅ `package.json` and `package-lock.json`  
✅ Documentation files  

### What NOT to Commit

❌ `.env` - Contains sensitive keys  
❌ `node_modules/` - Dependencies  
❌ Build files  
❌ Backup files  

---

## Support

If you encounter issues not covered here:

1. **Check browser console** for error messages
2. **Review Firebase Console** for activity logs
3. **Check Firestore rules** are deployed
4. **Verify environment variables** are correct
5. **Test in incognito mode** to rule out cache issues

Remember: The fixes implemented include comprehensive error handling and logging, so most issues will show clear error messages in the browser console to help you debug quickly!
