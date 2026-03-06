import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { mockService } from '../services/mockData';
import { FaEdit, FaSave, FaSpinner, FaBold, FaItalic, FaListUl, FaListOl, FaLink, FaImage, FaUpload } from 'react-icons/fa';

const CustomPage = () => {
    const { path } = useParams();
    const { isAdmin, user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [pageData, setPageData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isLoading && pageData && editorRef.current && !isEditing) {
            editorRef.current.innerHTML = pageData.content || '';
        }
    }, [isLoading, pageData, isEditing]);

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const pageId = path.replace(/\//g, '_').toLowerCase();
                const data = await mockService.getPageContent(pageId);
                if (data) {
                    setPageData(data);
                } else {
                    // Page not found
                    console.error('Page not found:', path);
                    navigate('/');
                }
            } catch (err) {
                console.error('Error fetching custom page content:', err);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
        setIsEditing(false); // Reset editing state when path changes
    }, [path, navigate]);

    const handleSave = async () => {
        const newContent = editorRef.current.innerHTML;
        const imageUrls = Array.from(editorRef.current.querySelectorAll('img')).map(img => img.src);
        setIsSaving(true);
        try {
            await mockService.updatePageContent(pageData.id, newContent, imageUrls);
            setPageData({ ...pageData, content: newContent, images: imageUrls });
            setIsEditing(false);

            // Create log
            await mockService.createLog({
                userId: user.id || user.uid,
                userName: user.name || user.displayName || user.email,
                description: `Updated custom page content: ${pageData.title}`
            });
        } catch (err) {
            console.error('Error saving page content:', err);
            alert(t('common.error') || 'Error saving content');
        } finally {
            setIsSaving(false);
        }
    };

    const execCommand = (command, value = null) => {
        if (editorRef.current) editorRef.current.focus();
        document.execCommand(command, false, value);
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
            const fileName = `custom_page_${pageData.id}_${Date.now()}_${file.name}`;
            const storagePath = `pages/${pageData.id}/${fileName}`;
            const downloadUrl = await mockService.uploadImage(storagePath, file);

            // Ensure editor has focus
            if (editorRef.current) {
                editorRef.current.focus();
                // If it's the first image/content, it might need an extra push
                document.execCommand('insertImage', false, downloadUrl);

                // Fallback for some browsers if execCommand fails
                const img = editorRef.current.querySelector(`img[src="${downloadUrl}"]`);
                if (!img) {
                    // Manually append if selection was lost
                    const newImg = document.createElement('img');
                    newImg.src = downloadUrl;
                    newImg.style.maxWidth = '100%';
                    editorRef.current.appendChild(newImg);
                    editorRef.current.appendChild(document.createElement('br'));
                }
            }

            // Optional: reset file input
            e.target.value = '';
        } catch (err) {
            console.error('Error uploading image:', err);
            alert(t('pageEditor.errorUpload'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditorClick = async (e) => {
        if (!isEditing) return;

        if (e.target.tagName === 'IMG') {
            const img = e.target;
            if (window.confirm(t('pageEditor.confirmDeleteImage'))) {
                const src = img.src;
                if (src.includes('firebasestorage.googleapis.com')) {
                    try {
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

    if (!pageData) return null;

    return (
        <div className="container custom-page">
            <header className="page-header">
                <h1 className="page-title">{pageData.title}</h1>
                {isAdmin && (
                    <div className="admin-actions">
                        {!isEditing ? (
                            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                                <FaEdit /> {t('pageEditor.edit')}
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <FaSpinner className="icon-spin" /> : <FaSave />} {t('pageEditor.save')}
                            </button>
                        )}
                    </div>
                )}
            </header>

            {isAdmin && <p className="admin-hint text-secondary">{t('pageEditor.hint')}</p>}

            <div className={`card custom-page-content-card ${isEditing ? 'editing' : ''}`}>
                {isEditing && (
                    <div className="editor-toolbar">
                        <button onClick={() => execCommand('bold')} title="Bold"><FaBold /></button>
                        <button onClick={() => execCommand('italic')} title="Italic"><FaItalic /></button>
                        <button onClick={() => execCommand('insertUnorderedList')} title="Unordered List"><FaListUl /></button>
                        <button onClick={() => execCommand('insertOrderedList')} title="Ordered List"><FaListOl /></button>
                        <button onClick={addLink} title="Add Link"><FaLink /></button>
                        <button onClick={addImage} title="Add Image URL"><FaImage /></button>
                        <button onClick={() => fileInputRef.current?.click()} title={t('pageEditor.uploadImage')} disabled={isUploading}>
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
                    className="custom-page-content"
                    contentEditable={isEditing}
                    onClick={handleEditorClick}
                    onInput={() => {/* Triggered on every change, but we read on save */ }}
                    style={{
                        outline: 'none',
                        minHeight: '200px',
                        padding: isEditing ? '1rem' : '0'
                    }}
                />
            </div>

            <style>{`
                .custom-page {
                    padding-top: 2rem;
                    max-width: 900px;
                }
                .admin-hint {
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    font-style: italic;
                }
                .custom-page-content-card {
                    padding: 2.5rem;
                    line-height: 1.8;
                }
                .custom-page-content-card.editing {
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
                .custom-page-content {
                    font-size: 1.1rem;
                }
                .custom-page-content h1, .custom-page-content h2, .custom-page-content h3 {
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                }
                .custom-page-content p {
                    margin-bottom: 1.5rem;
                }
                .custom-page-content ul, .custom-page-content ol {
                    margin-bottom: 1.5rem;
                    padding-left: 2rem;
                }
                .custom-page-content img {
                    max-width: 100%;
                    border-radius: 0.5rem;
                    margin: 1.5rem 0;
                }
                .custom-page-content-card.editing .custom-page-content img {
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .custom-page-content-card.editing .custom-page-content img:hover {
                    outline: 3px solid #ef4444;
                    opacity: 0.8;
                }
                .custom-page-content a {
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

export default CustomPage;
