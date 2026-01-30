// Migration Script: Add Tagline and Description to Categories
// Run this once in browser console or as a Node.js script

import { db } from './firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Hardcoded descriptions to migrate
const categoryDescriptions = {
    "Wedding": {
        tagline: "Capture your special day with timeless elegance",
        description: "From intimate ceremonies to grand celebrations, we preserve every precious moment. Every wedding tells a unique story of love, tradition, and celebration. We capture the stolen glances, the joyful tears, and the moments that become cherished memories for generations."
    },
    "Birthday": {
        tagline: "Make every birthday unforgettable",
        description: "From the first candle to the hundredth, birthdays are magical moments of joy. We freeze these celebrations in time, capturing the laughter, surprises, and pure happiness."
    },
    "Corporate": {
        tagline: "Professional excellence captured",
        description: "Documentation of conferences, seminars, and business gatherings. Elevate your brand with stunning corporate imagery. From conferences to team portraits, we deliver polished visuals that speak volumes about your professional identity."
    },
    "Maternity": {
        tagline: "Celebrate the beauty of motherhood",
        description: "Pregnancy is a journey of transformation and wonder. Our maternity shoots celebrate the glow of motherhood with elegant, intimate portraits you'll treasure forever."
    },
    "Pre-Wedding": {
        tagline: "Tell your love story before the big day",
        description: "Before the vows, there's a beautiful story waiting to be told. Romantic, cinematic pre-wedding sessions at breathtaking locations capturing the romance, chemistry, and anticipation of your journey together."
    },
    "Portrait": {
        tagline: "Express yourself through stunning portraits",
        description: "Every face has a story. Professional headshots, lifestyle shots, or creative concepts that reveal character, emotion, and personality through carefully crafted images."
    },
    "Event": {
        tagline: "Moments Worth Remembering",
        description: "From festivals to private parties, we capture the energy, emotion, and excitement of your special events. We document events with an eye for candid moments and the energy that makes each occasion special."
    },
    "Baby": {
        tagline: "Tiny Moments, Big Memories",
        description: "Document the sacred moments of welcoming your little one with grace. Those precious early days pass so quickly. We capture the tender moments, tiny details, and pure innocence of your little one's first chapter."
    },
    "Family": {
        tagline: "Creating lasting memories",
        description: "Create beautiful family portraits that capture the love and connection you share. We freeze these precious moments in time for you to cherish forever."
    },
    "Fashion": {
        tagline: "Style and Personality",
        description: "Build your modeling portfolio with high-fashion editorial shoots that showcase your unique style and personality."
    },
    "Product": {
        tagline: "Showcase your brand",
        description: "Showcase your products with stunning commercial photography that drives sales and elevates your brand aesthetic."
    },
    "Engagement": {
        tagline: "The beginning of forever",
        description: "Celebrate your commitment with romantic engagement photography that marks the beginning of your journey together."
    },
    // Add new categories with default descriptions
    "Portraits": {
        tagline: "Express yourself through stunning portraits",
        description: "Every face has a story. Professional headshots, lifestyle shots, or creative concepts that reveal character, emotion, and personality through carefully crafted images."
    },
    "Artistic Edits": {
        tagline: "Transform moments into art",
        description: "Creative post-processing and artistic edits that turn your photographs into stunning visual masterpieces. From subtle enhancements to bold artistic statements."
    },
    "Makeover Potraits": {
        tagline: "Reveal your best self",
        description: "Professional makeover portraits that capture your transformation. Celebrate your beauty with expertly styled and photographed portraits that showcase your confidence and elegance."
    }
};

async function migrateCategories() {
    try {
        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);

        console.log(`Found ${snapshot.size} categories to migrate...`);

        let updated = 0;
        let skipped = 0;

        for (const docSnapshot of snapshot.docs) {
            const categoryData = docSnapshot.data();
            const categoryName = categoryData.name;

            // Check if already has tagline and description
            if (categoryData.tagline && categoryData.description) {
                console.log(`✓ Skipping "${categoryName}" - already has tagline and description`);
                skipped++;
                continue;
            }

            // Get description from hardcoded object
            const description = categoryDescriptions[categoryName];

            if (description) {
                await updateDoc(doc(db, 'categories', docSnapshot.id), {
                    tagline: description.tagline,
                    description: description.description
                });
                console.log(`✓ Updated "${categoryName}" with tagline and description`);
                updated++;
            } else {
                console.warn(`⚠ No description found for "${categoryName}" - using default`);
                await updateDoc(doc(db, 'categories', docSnapshot.id), {
                    tagline: "Captured with Passion",
                    description: "Every moment has its own magic. We bring our artistic vision and technical expertise to create stunning photographs that tell your unique story."
                });
                updated++;
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Updated: ${updated} categories`);
        console.log(`   Skipped: ${skipped} categories`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Run the migration
migrateCategories();
