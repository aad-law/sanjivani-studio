import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase"; // Import auth
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import auth methods
import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    onSnapshot
} from "firebase/firestore";
import "./AdminDashboard.css";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { writeBatch } from "firebase/firestore";

// Sortable Item Component
const SortableCategoryItem = ({ id, index, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: "flex",
        alignItems: "center",
        gap: "10px"
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className="drag-handle-box"
                title="Drag to reorder"
            >
                {index + 1}
            </div>
            {children}
        </div>
    );
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("photos");
    const [categories, setCategories] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [newTagline, setNewTagline] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // Add user state
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: null });
    const [editModal, setEditModal] = useState({
        show: false,
        id: null,
        name: "",
        tagline: "",
        description: ""
    });

    // Check Authentication Status
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // If not logged in, redirect to login page
                navigate("/admin");
            }
            setLoading(false);
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    // Subscribe to real-time updates from Firestore (only if user is logged in)
    useEffect(() => {
        if (!user) return; // Don't subscribe properly if not logged in

        // Listen to categories
        const unsubCategories = onSnapshot(
            collection(db, "categories"),
            (snapshot) => {
                const cats = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Sort by order, fallback to createdAt or 0
                cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                setCategories(cats);
            },
            (error) => {
                console.error("Error fetching categories:", error);
            }
        );

        // Listen to photos
        const unsubPhotos = onSnapshot(
            collection(db, "photos"),
            (snapshot) => {
                const pics = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPhotos(pics);
            },
            (error) => {
                console.error("Error fetching photos:", error);
            }
        );

        // Listen to reviews
        const unsubReviews = onSnapshot(
            collection(db, "reviews"),
            (snapshot) => {
                const revs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Sort by createdAt descending (newest first)
                revs.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                    return dateB - dateA;
                });
                setReviews(revs);
            },
            (error) => {
                console.error("Error fetching reviews:", error);
            }
        );

        return () => {
            unsubCategories();
            unsubPhotos();
            unsubReviews();
        };
    }, [user]); // Depend on user state

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setCategories((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update Firebase
                const batch = writeBatch(db);
                newItems.forEach((cat, index) => {
                    const docRef = doc(db, "categories", cat.id);
                    batch.update(docRef, { order: index });
                });
                batch.commit().catch(console.error);

                return newItems;
            });
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/admin");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    // Add Category
    const addCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            alert("Please enter a category name!");
            return;
        }
        if (!newTagline.trim()) {
            alert("Please enter a tagline!");
            return;
        }
        if (!newDescription.trim()) {
            alert("Please enter a description!");
            return;
        }

        const categoryExists = categories.some(
            cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase()
        );

        if (categoryExists) {
            alert("Category already exists!");
            return;
        }

        try {
            await addDoc(collection(db, "categories"), {
                name: newCategory.trim(),
                tagline: newTagline.trim(),
                description: newDescription.trim(),
                createdAt: new Date().toISOString(),
                order: categories.length // Append to end
            });
            setNewCategory("");
            setNewTagline("");
            setNewDescription("");
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Failed to add category. Please try again.");
        }
    };

    // Open Delete Modal
    const handleDeleteClick = (e, categoryId, categoryName) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ show: true, id: categoryId, name: categoryName });
    };

    // Open Edit Modal
    const handleEditClick = (e, category) => {
        e.preventDefault();
        e.stopPropagation();
        setEditModal({
            show: true,
            id: category.id,
            name: category.name,
            tagline: category.tagline || "",
            description: category.description || ""
        });
    };

    // Update Category
    const updateCategory = async () => {
        const { id, name, tagline, description } = editModal;
        if (!id || !name.trim() || !tagline.trim() || !description.trim()) {
            alert("Please fill in all fields!");
            return;
        }

        try {
            const oldCategory = categories.find(c => c.id === id);
            const oldName = oldCategory.name;

            // Update category document
            await updateDoc(doc(db, "categories", id), {
                name: name.trim(),
                tagline: tagline.trim(),
                description: description.trim()
            });

            // If name changed, update all photos with this categoryId
            if (oldName !== name.trim()) {
                const photosQuery = query(
                    collection(db, "photos"),
                    where("categoryId", "==", oldName)
                );
                const photosSnapshot = await getDocs(photosQuery);

                const batch = writeBatch(db);
                photosSnapshot.docs.forEach(photoDoc => {
                    batch.update(doc(db, "photos", photoDoc.id), {
                        categoryId: name.trim()
                    });
                });
                await batch.commit();
            }

            setEditModal({ show: false, id: null, name: "", tagline: "", description: "" });
        } catch (error) {
            console.error("Error updating category:", error);
            alert("Failed to update category. Please try again.");
        }
    };

    // Execute Deletion
    const confirmDeleteCategory = async () => {
        const { id, name } = deleteModal;
        if (!id) return;

        console.log(`Deleting category: ${name} (${id})`);

        try {
            // Delete category
            await deleteDoc(doc(db, "categories", id));
            console.log("Category doc deleted");

            // Delete all photos in this category
            const photosQuery = query(
                collection(db, "photos"),
                where("categoryId", "==", name)
            );
            const photosSnapshot = await getDocs(photosQuery);

            const deletePromises = photosSnapshot.docs.map(photoDoc =>
                deleteDoc(doc(db, "photos", photoDoc.id))
            );
            await Promise.all(deletePromises);
            console.log("Category photos deleted");

            // Close modal after success
            setDeleteModal({ show: false, id: null, name: null });
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Failed to delete category. See console for details.");
        }
    };

    // Photo Upload with Cloudinary Widget
    const openCloudinaryWidget = () => {
        if (!selectedCategory) {
            alert("Please select a category first!");
            return;
        }

        if (!window.cloudinary) {
            alert("Cloudinary widget is loading. Please try again in a moment.");
            return;
        }

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                sources: ["local", "camera"],
                multiple: true,
                maxFiles: 20,
                folder: "sanjivani_studios",
                resourceType: "image",
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                maxImageFileSize: 10000000,
                cropping: false,
                showAdvancedOptions: false,
                styles: {
                    palette: {
                        window: "#1a1a2e",
                        sourceBg: "#16213e",
                        windowBorder: "#fbbf24",
                        tabIcon: "#fbbf24",
                        inactiveTabIcon: "#ffffff",
                        menuIcons: "#fbbf24",
                        link: "#fbbf24",
                        action: "#fbbf24",
                        inProgress: "#fbbf24",
                        complete: "#22c55e",
                        error: "#ef4444",
                        textDark: "#000000",
                        textLight: "#ffffff"
                    }
                }
            },
            async (error, result) => {
                if (error) {
                    console.error("Upload error:", error);
                    return;
                }

                if (result.event === "success") {
                    try {
                        await addDoc(collection(db, "photos"), {
                            categoryId: selectedCategory,
                            url: result.info.secure_url,
                            publicId: result.info.public_id,
                            width: result.info.width,
                            height: result.info.height,
                            createdAt: new Date().toISOString()
                        });
                    } catch (err) {
                        console.error("Error saving photo:", err);
                    }
                }
            }
        );

        widget.open();
    };

    // Delete Photo
    const deletePhoto = async (photoId) => {
        if (!window.confirm("Delete this photo?")) return;

        try {
            await deleteDoc(doc(db, "photos", photoId));
        } catch (error) {
            console.error("Error deleting photo:", error);
            alert("Failed to delete photo. Please try again.");
        }
    };

    // Delete Review
    const deleteReview = async (reviewId) => {
        if (!window.confirm("Delete this review?")) return;

        try {
            await deleteDoc(doc(db, "reviews", reviewId));
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("Failed to delete review. Please try again.");
        }
    };

    // Format date for display
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown date';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-screen">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Sanjivani Studios</h2>
                    <p>Admin Dashboard</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-btn ${activeTab === "photos" ? "active" : ""}`}
                        onClick={() => setActiveTab("photos")}
                    >
                        📸 Photos
                    </button>
                    <button
                        className={`nav-btn ${activeTab === "categories" ? "active" : ""}`}
                        onClick={() => setActiveTab("categories")}
                    >
                        📁 Categories
                    </button>
                    <button
                        className={`nav-btn ${activeTab === "reviews" ? "active" : ""}`}
                        onClick={() => setActiveTab("reviews")}
                    >
                        ⭐ Reviews
                    </button>
                    <button className="nav-btn logout-btn" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-header">
                    <h1>
                        {activeTab === "photos" ? "Manage Photos" :
                            activeTab === "categories" ? "Manage Categories" :
                                "Manage Reviews"}
                    </h1>
                    <p>
                        {activeTab === "photos"
                            ? "Upload and manage your gallery photos"
                            : activeTab === "categories"
                                ? "Create and organize photo categories"
                                : "View and moderate customer reviews"}
                    </p>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-value">{categories.length}</div>
                        <div className="stat-label">Categories</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{photos.length}</div>
                        <div className="stat-label">Total Photos</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{reviews.length}</div>
                        <div className="stat-label">Reviews</div>
                    </div>
                </div>

                {/* Categories Tab */}
                {activeTab === "categories" && (
                    <div className="section-card">
                        <h3 className="section-title">Categories</h3>

                        <form className="add-category-form" onSubmit={addCategory}>
                            <input
                                type="text"
                                placeholder="Category name (e.g., Wedding, Birthday)"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Tagline (e.g., Capture your special day)"
                                value={newTagline}
                                onChange={(e) => setNewTagline(e.target.value)}
                            />
                            <textarea
                                placeholder="Description (2-3 sentences about this category)"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    marginBottom: '12px'
                                }}
                            />
                            <button type="submit" className="add-btn">
                                + Add Category
                            </button>
                        </form>

                        {categories.length > 0 ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={categories.map((c) => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="categories-list">
                                        {categories.map((category, index) => (
                                            <SortableCategoryItem key={category.id} id={category.id} index={index}>
                                                <div className="category-tag">
                                                    <span>{category.name}</span>
                                                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                                                        ({photos.filter((p) => p.categoryId === category.name).length} photos)
                                                    </span>
                                                    <div
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        style={{
                                                            display: "flex",
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            gap: "8px"
                                                        }}
                                                    >
                                                        <button
                                                            className="edit-cat-btn"
                                                            onClick={(e) => handleEditClick(e, category)}
                                                            title="Edit category"
                                                            style={{
                                                                background: 'rgba(59, 130, 246, 0.2)',
                                                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                color: '#60a5fa',
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = 'rgba(59, 130, 246, 0.3)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                                                            }}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="delete-cat-btn"
                                                            onClick={(e) => handleDeleteClick(e, category.id, category.name)}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            </SortableCategoryItem>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="empty-state">
                                <p>No categories yet. Add your first category above!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Photos Tab */}
                {activeTab === "photos" && (
                    <>
                        <div className="section-card">
                            <h3 className="section-title">Upload Photos</h3>

                            <div className="upload-section">
                                <div className="upload-controls">
                                    <select
                                        className="category-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">-- Select Category --</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        className="upload-btn"
                                        onClick={openCloudinaryWidget}
                                        disabled={!selectedCategory || categories.length === 0}
                                    >
                                        📤 Upload Photos
                                    </button>
                                </div>

                                {categories.length === 0 && (
                                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                                        ⚠️ Please create at least one category first
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="section-card">
                            <h3 className="section-title">
                                All Photos
                                {selectedCategory && ` in "${selectedCategory}"`}
                            </h3>

                            {photos.length > 0 ? (
                                <div className="photos-grid">
                                    {photos
                                        .filter(photo => !selectedCategory || photo.categoryId === selectedCategory)
                                        .map((photo) => (
                                            <div key={photo.id} className="photo-card">
                                                <img src={photo.url} alt="" loading="lazy" />
                                                <div className="photo-overlay">
                                                    <span className="photo-category">
                                                        {photo.categoryId}
                                                    </span>
                                                </div>
                                                <button
                                                    className="delete-photo-btn"
                                                    onClick={() => deletePhoto(photo.id)}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No photos uploaded yet. Select a category and upload your first photo!</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                    <div className="section-card">
                        <h3 className="section-title">All Reviews ({reviews.length})</h3>

                        {reviews.length > 0 ? (
                            <div className="reviews-list">
                                {reviews.map((review) => (
                                    <div key={review.id} className="review-item">
                                        <div className="review-item-header">
                                            <div>
                                                <strong>{review.name}</strong>
                                                <span className="review-rating-stars">
                                                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                                </span>
                                            </div>
                                            <button
                                                className="delete-review-btn"
                                                onClick={() => deleteReview(review.id)}
                                                title="Delete review"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                        <p className="review-item-text">{review.text}</p>
                                        <small className="review-item-date">
                                            {formatDate(review.createdAt)}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No reviews yet. Reviews will appear here once customers submit them.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Confirmation Modal */}
            {deleteModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Delete Category?</h3>
                        <p>
                            Are you sure you want to delete <strong>"{deleteModal.name}"</strong>?
                            <br />
                            This will permanently delete all photos in this category.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setDeleteModal({ show: false, id: null, name: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-delete-btn"
                                onClick={confirmDeleteCategory}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {editModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <h3>Edit Category</h3>
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={editModal.name}
                                onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    marginBottom: '16px'
                                }}
                            />

                            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                Tagline
                            </label>
                            <input
                                type="text"
                                value={editModal.tagline}
                                onChange={(e) => setEditModal({ ...editModal, tagline: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    marginBottom: '16px'
                                }}
                            />

                            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                Description
                            </label>
                            <textarea
                                value={editModal.description}
                                onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    marginBottom: '20px'
                                }}
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setEditModal({ show: false, id: null, name: "", tagline: "", description: "" })}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-delete-btn"
                                onClick={updateCategory}
                                style={{ background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)' }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
