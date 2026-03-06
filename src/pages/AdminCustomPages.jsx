import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { mockService } from '../services/mockData';
import { FaPlus, FaTrash, FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminCustomPages = () => {
    const { isAdmin, user } = useAuth();
    const { t } = useLanguage();
    const { customPages, refreshSettings } = useSettings();
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', path: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.path) return;

        setIsSaving(true);
        try {
            // Normalize path: remove leading / and lowercase
            const normalizedPath = formData.path.replace(/^\//, '').toLowerCase().trim();
            const pageId = normalizedPath.replace(/\//g, '_');

            await mockService.updatePageContent(pageId, '', [], formData.title, normalizedPath);

            await mockService.createLog({
                userId: user.id || user.uid,
                userName: user.name || user.displayName || user.email,
                description: `Created custom page: ${formData.title} (/pages/${normalizedPath})`
            });

            setFormData({ title: '', path: '' });
            setIsCreating(false);
            await refreshSettings();
        } catch (err) {
            console.error('Error creating page:', err);
            alert(t('common.error') || 'Error creating page');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (pageId, title) => {
        if (!window.confirm(t('common.confirmDelete') || `Are you sure you want to delete "${title}"?`)) return;

        try {
            await mockService.deleteCustomPage(pageId);

            await mockService.createLog({
                userId: user.id || user.uid,
                userName: user.name || user.displayName || user.email,
                description: `Deleted custom page: ${title}`
            });

            await refreshSettings();
        } catch (err) {
            console.error('Error deleting page:', err);
            alert(t('common.error') || 'Error deleting page');
        }
    };

    if (!isAdmin) return <div className="container">{t('common.unauthorized')}</div>;

    return (
        <div className="container admin-custom-pages">
            <header className="page-header">
                <h1 className="page-title">{t('admin.customPages')}</h1>
                <button className="btn btn-primary" onClick={() => setIsCreating(!isCreating)}>
                    <FaPlus /> {t('admin.createPage')}
                </button>
            </header>

            {isCreating && (
                <div className="card create-form animate-fade-in">
                    <h2>{t('admin.newPage')}</h2>
                    <form onSubmit={handleCreate} className="form-vertical">
                        <div className="form-group">
                            <label>{t('admin.pageTitle')}</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Terms of Service"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('admin.pagePath')}</label>
                            <div className="path-input-wrapper">
                                <span className="path-prefix">/pages/</span>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.path}
                                    onChange={e => setFormData({ ...formData, path: e.target.value })}
                                    placeholder="e.g. terms"
                                    required
                                />
                            </div>
                            <small className="form-hint">{t('admin.pathHint')}</small>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-outline" onClick={() => setIsCreating(false)}>
                                {t('common.cancel')}
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? t('common.saving') : t('common.save')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="pages-list">
                {customPages.length === 0 ? (
                    <div className="card empty-state">
                        <p>{t('admin.noCustomPages')}</p>
                    </div>
                ) : (
                    <div className="pages-grid">
                        {customPages.map(page => (
                            <div key={page.id} className="card page-card">
                                <div className="page-info">
                                    <h3>{page.title}</h3>
                                    <p className="page-path">/pages/{page.path}</p>
                                </div>
                                <div className="page-actions">
                                    <Link to={`/pages/${page.path}`} className="btn-icon" title={t('common.view')}>
                                        <FaExternalLinkAlt />
                                    </Link>
                                    <button className="btn-icon delete" onClick={() => handleDelete(page.id, page.title)} title={t('common.delete')}>
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .admin-custom-pages {
                    padding-top: 2rem;
                }
                .create-form {
                    margin-bottom: 2rem;
                    max-width: 600px;
                }
                .form-vertical {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .path-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .path-prefix {
                    color: var(--text-secondary);
                    font-weight: 600;
                }
                .form-hint {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    margin-top: 0.25rem;
                }
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                .pages-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .page-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                }
                .page-info h3 {
                    margin: 0 0 0.5rem 0;
                    color: var(--primary);
                }
                .page-path {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-family: monospace;
                }
                .page-actions {
                    display: flex;
                    gap: 0.75rem;
                }
                .btn-icon {
                    background: none;
                    border: 1px solid var(--glass-border);
                    color: var(--text-secondary);
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                }
                .btn-icon:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: rgba(255, 255, 255, 0.05);
                }
                .btn-icon.delete:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }
                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-secondary);
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminCustomPages;
