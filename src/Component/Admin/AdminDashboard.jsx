import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    where,
    onSnapshot
} from "firebase/firestore";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("photos");
    const [categories, setCategories] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: null });

    // Subscribe to real-time updates from Firestore
    useEffect(() => {
        // Listen to categories
        const unsubCategories = onSnapshot(
            collection(db, "categories"),
            (snapshot) => {
                const cats = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(cats);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching categories:", error);
                setLoading(false);
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

        return () => {
            unsubCategories();
            unsubPhotos();
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("isAdminAuthenticated");
        localStorage.removeItem("adminLoginTime");
        navigate("/admin");
    };

    // Add Category
    const addCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

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
                createdAt: new Date().toISOString()
            });
            setNewCategory("");
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
                    <button className="nav-btn logout-btn" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-header">
                    <h1>{activeTab === "photos" ? "Manage Photos" : "Manage Categories"}</h1>
                    <p>
                        {activeTab === "photos"
                            ? "Upload and manage your gallery photos"
                            : "Create and organize photo categories"}
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
                </div>

                {/* Categories Tab */}
                {activeTab === "categories" && (
                    <div className="section-card">
                        <h3 className="section-title">Categories</h3>

                        <form className="add-category-form" onSubmit={addCategory}>
                            <input
                                type="text"
                                placeholder="Enter category name (e.g., Wedding, Birthday)"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <button type="submit" className="add-btn">
                                + Add Category
                            </button>
                        </form>

                        {categories.length > 0 ? (
                            <div className="categories-list">
                                {categories.map((category) => (
                                    <div key={category.id} className="category-tag">
                                        <span>{category.name}</span>
                                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                                            ({photos.filter(p => p.categoryId === category.name).length} photos)
                                        </span>
                                        <button
                                            className="delete-cat-btn"
                                            onClick={(e) => handleDeleteClick(e, category.id, category.name)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
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
        </div>
    );
}
