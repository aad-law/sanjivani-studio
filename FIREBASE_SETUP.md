# Firebase Setup Guide

## Deploying Firestore Security Rules

### Prerequisites
1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

### Initialize Firebase (if not already done)
```bash
firebase init firestore
```
- Select your Firebase project
- Accept the default `firestore.rules` file location
- Accept the default `firestore.indexes.json` file location

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

**Expected Output:**
```
✔  Deploy complete!
```

## Verifying Rules Are Working

### Method 1: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Verify the rules match your `firestore.rules` file
5. Check the "Last deployed" timestamp

### Method 2: Test in Browser Console
Open your website and try these tests in the browser console:

```javascript
// This should FAIL (only admins can delete reviews)
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
await deleteDoc(doc(db, 'reviews', 'SOME_REVIEW_ID'));
// Expected: Permission denied error

// This should SUCCEED (anyone can create reviews)
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
await addDoc(collection(db, 'reviews'), {
  name: 'Test User',
  rating: 5,
  text: 'Test review',
  createdAt: serverTimestamp()
});
// Expected: Success with new document ID
```

## Troubleshooting

### Issue: "Permission denied" when clients try to submit reviews

**Solution:**
1. Verify rules are deployed: `firebase deploy --only firestore:rules`
2. Check Firebase Console → Firestore → Rules tab
3. Ensure the rules allow `create` for reviews without authentication

### Issue: Reviews still getting deleted

**Possible Causes:**
1. Rules not deployed yet
2. Someone has admin access and is deleting manually
3. Code somewhere is calling `deleteDoc()` on reviews

**Solution:**
1. Deploy rules if not done
2. Check admin dashboard code for unintended delete operations
3. Search codebase for `deleteDoc` calls on reviews collection

### Issue: Photos not displaying

**Possible Causes:**
1. Cloudinary URLs are invalid or expired
2. Network issues
3. CORS issues

**Solution:**
1. Check browser console for errors
2. Verify Cloudinary account is active
3. Test URLs directly in browser
4. Check Cloudinary dashboard for usage limits

## Data Backup

### Export All Data
```bash
# Install firestore-export-import
npm install -g firestore-export-import

# Export all collections
firestore-export --accountCredentials ./serviceAccountKey.json --backupFile ./backup.json
```

### Manual Backup via Firebase Console
1. Go to Firebase Console → Firestore Database
2. Click on each collection
3. Export to JSON (use browser extensions or manual copy)

## Security Best Practices

1. **Never commit `.env` file** - Contains sensitive API keys
2. **Regularly review Firestore usage** - Monitor for unusual activity
3. **Keep Firebase CLI updated** - `npm update -g firebase-tools`
4. **Use environment variables** - Never hardcode credentials
5. **Monitor Firebase Console** - Check for unauthorized access attempts

## Common Commands

```bash
# Check Firebase CLI version
firebase --version

# List all Firebase projects
firebase projects:list

# Check which project you're using
firebase use

# Switch to a different project
firebase use <project-id>

# Deploy everything
firebase deploy

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only hosting
firebase deploy --only hosting
```

## Getting Service Account Key (for backups)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click gear icon → Project Settings
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save as `serviceAccountKey.json` (DO NOT commit to git!)
7. Add to `.gitignore`
