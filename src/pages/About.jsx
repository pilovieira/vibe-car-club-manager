import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { mockService } from '../services/mockData';
import { FaEdit, FaSave, FaSpinner, FaBold, FaItalic, FaListUl, FaListOl, FaLink, FaImage, FaUpload } from 'react-icons/fa';

const About = () => {
    const { isAdmin, user } = useAuth();
    const { t } = useLanguage();
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await mockService.getPageContent('about');
                setContent(data.content || '');
            } catch (err) {
                console.error('Error fetching about content:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleSave = async () => {
        const newContent = editorRef.current.innerHTML;
        const imageUrls = Array.from(editorRef.current.querySelectorAll('img')).map(img => img.src);
        setIsSaving(true);
        try {
            await mockService.updatePageContent('about', newContent, imageUrls);
            setContent(newContent);
            setIsEditing(false);

            // Create log
            await mockService.createLog({
                userId: user.id || user.uid,
                userName: user.name || user.displayName || user.email,
                description: `Updated About Us page content`
            });
        } catch (err) {
            console.error('Error saving about content:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        if (editorRef.current) editorRef.current.focus();
    };

    const addLink = () => {
        const url = prompt('Enter the URL (e.g., https://example.com):');
        if (url) execCommand('createLink', url);
    };

    const addImage = () => {
        const url = prompt('Enter image URL:');
        if (url) execCommand('insertImage', url);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileName = `about_page_${Date.now()}_${file.name}`;
            const path = `pages/about/${fileName}`;
            const downloadUrl = await mockService.uploadImage(path, file);

            // Insert image at cursor
            execCommand('insertImage', downloadUrl);

            // Optional: reset file input
            e.target.value = '';
        } catch (err) {
            console.error('Error uploading image:', err);
            alert(t('about.errorUpload'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditorClick = async (e) => {
        if (!isEditing) return;

        // If clicking an image, confirm deletion
        if (e.target.tagName === 'IMG') {
            const img = e.target;
            if (window.confirm(t('about.confirmDeleteImage'))) {
                const src = img.src;

                // Check if it's a storage image
                if (src.includes('firebasestorage.googleapis.com')) {
                    try {
                        // Extract path from storage URL if needed or just use the whole URL if deleteObject supports it (some SDKs do)
                        // Actually deleteImageByUrl in mockData.js uses ref(storage, url) which modular SDK supports
                        await mockService.deleteImageByUrl(src);
                    } catch (err) {
                        console.error('Error deleting from storage:', err);
                    }
                }
                img.remove();
            }
        }
    };

    if (isLoading) {
        return <div className="container" style={{ paddingTop: '2rem' }}>{t('common.loading')}</div>;
    }

    return (
        <div className="container about-page">
            <header className="page-header">
                <h1 className="page-title">{t('about.title')}</h1>
                {isAdmin && (
                    <div className="admin-actions">
                        {!isEditing ? (
                            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                                <FaEdit /> {t('about.edit')}
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <FaSpinner className="icon-spin" /> : <FaSave />} {t('about.save')}
                            </button>
                        )}
                    </div>
                )}
            </header>

            {isAdmin && <p className="admin-hint text-secondary">{t('about.hint')}</p>}

            <div className={`card about-content-card ${isEditing ? 'editing' : ''}`}>
                {isEditing && (
                    <div className="editor-toolbar">
                        <button onClick={() => execCommand('bold')} title="Bold"><FaBold /></button>
                        <button onClick={() => execCommand('italic')} title="Italic"><FaItalic /></button>
                        <button onClick={() => execCommand('insertUnorderedList')} title="Unordered List"><FaListUl /></button>
                        <button onClick={() => execCommand('insertOrderedList')} title="Ordered List"><FaListOl /></button>
                        <button onClick={addLink} title="Add Link"><FaLink /></button>
                        <button onClick={addImage} title="Add Image URL"><FaImage /></button>
                        <button onClick={() => fileInputRef.current?.click()} title={t('about.uploadImage')} disabled={isUploading}>
                            {isUploading ? <FaSpinner className="icon-spin" /> : <FaUpload />}
                        </button>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileUpload}
                />

                <div
                    ref={editorRef}
                    className="about-content"
                    contentEditable={isEditing}
                    onClick={handleEditorClick}
                    dangerouslySetInnerHTML={{ __html: content }}
                    style={{
                        outline: 'none',
                        minHeight: '200px',
                        padding: isEditing ? '1rem' : '0'
                    }}
                />
            </div>

            <style>{`
                .about-page {
                    padding-top: 2rem;
                    max-width: 900px;
                }
                .admin-hint {
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    font-style: italic;
                }
                .about-content-card {
                    padding: 2.5rem;
                    line-height: 1.8;
                }
                .about-content-card.editing {
                    padding: 0;
                }
                .editor-toolbar {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid var(--glass-border);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .editor-toolbar button {
                    background: none;
                    border: 1px solid var(--glass-border);
                    color: var(--text-primary);
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .editor-toolbar button:hover {
                    background: var(--primary);
                    color: white;
                }
                .about-content {
                    font-size: 1.1rem;
                }
                .about-content h1, .about-content h2, .about-content h3 {
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                }
                .about-content p {
                    margin-bottom: 1.5rem;
                }
                .about-content ul, .about-content ol {
                    margin-bottom: 1.5rem;
                    padding-left: 2rem;
                }
                .about-content img {
                    max-width: 100%;
                    border-radius: 0.5rem;
                    margin: 1.5rem 0;
                }
                .about-content-card.editing .about-content img {
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .about-content-card.editing .about-content img:hover {
                    outline: 3px solid #ef4444;
                    opacity: 0.8;
                }
                .about-content a {
                    color: var(--primary);
                    text-decoration: underline;
                }
                .icon-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default About;
