import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';

const AdminCreateMember = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'member'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await authService.createUser(formData.email, formData.password, {
                username: formData.username.trim(),
                name: formData.name.trim(),
                role: formData.role
            });

            setSuccess(t('members.memberCreated') || 'User created successfully!');
            setFormData({
                name: '',
                email: '',
                username: '',
                password: '',
                role: 'member'
            });

            // Optional: redirect after some time
            setTimeout(() => navigate('/admin'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container create-member-page">
            <div className="card form-card">
                <h1>{t('members.registerNew') || 'Create New User'}</h1>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label>{t('member.name')}</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('login.email')}</label>
                        <input
                            type="email"
                            className="input-field"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('member.username')}</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('login.password')}</label>
                        <input
                            type="password"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('member.role') || 'Role'}</label>
                        <select
                            className="input-field"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="member">{t('role.member') || 'Member'}</option>
                            <option value="admin">{t('role.admin') || 'Admin'}</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/admin')}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? t('common.saving') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .create-member-page {
                    display: flex;
                    justify-content: center;
                    padding: 2rem;
                }
                .form-card {
                    width: 100%;
                    max-width: 600px;
                    padding: 2.5rem;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 2rem;
                    color: var(--primary);
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .form-actions {
                    grid-column: span 2;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                .error-message {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-size: 0.9rem;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .success-message {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-size: 0.9rem;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }
            `}</style>
        </div>
    );
};

export default AdminCreateMember;
