import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockService } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Members = () => {
    const { t } = useLanguage();
    const [members, setMembers] = useState([]);
    const { isAdmin } = useAuth();
    // Simple form state for adding member
    const [showAddForm, setShowAddForm] = useState(false);

    // Edit Mode moved to MemberProfile.jsx
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberAvatarUrl, setNewMemberAvatarUrl] = useState('');
    const [newMemberStatus, setNewMemberStatus] = useState('active');
    const [newMemberGender, setNewMemberGender] = useState('male');
    const [error, setError] = useState('');

    useEffect(() => {
        setMembers(mockService.getMembers());
    }, []);

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!newMemberName || !newMemberUsername || !newMemberEmail) return;
        setError('');

        const avatar = newMemberAvatarUrl.trim() || `https://ui-avatars.com/api/?name=${newMemberName}&background=random`;

        try {
            const newMember = mockService.createMember({
                username: newMemberUsername.toLowerCase().trim(),
                name: newMemberName,
                email: newMemberEmail,
                status: newMemberStatus,
                avatar: avatar,
                gender: newMemberGender,
            });

            setMembers([...members, newMember]);
            resetForm();
        } catch (err) {
            if (err.message === 'Username already exists') {
                setError(t('error.usernameExists'));
            } else {
                setError(err.message);
            }
        }
    };

    const resetForm = () => {
        setShowAddForm(false);
        setNewMemberName('');
        setNewMemberUsername('');
        setNewMemberEmail('');
        setNewMemberAvatarUrl('');
        setNewMemberGender('male');
        setNewMemberStatus('active');
        setError('');
    };

    return (
        <div className="container members-page">
            <header className="page-header">
                <h1 className="page-title">{t('members.title')}</h1>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}>
                        {showAddForm ? t('members.cancel') : t('members.addNew')}
                    </button>
                )}
            </header>

            {showAddForm && (
                <div className="card add-member-form">
                    <div className="form-header">
                        <h2>{t('members.registerNew')}</h2>
                        <button className="btn-text" onClick={resetForm}>{t('members.cancel')}</button>
                    </div>

                    {error && <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleAddMember} className="form-grid">
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('member.name')}</label>
                                <input
                                    type="text"
                                    placeholder={t('member.name')}
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('members.email')}</label>
                                <input
                                    type="email"
                                    placeholder={t('members.email')}
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('member.username')}</label>
                                <input
                                    type="text"
                                    placeholder="johndoe123"
                                    value={newMemberUsername}
                                    onChange={(e) => setNewMemberUsername(e.target.value)}
                                    className={`input-field ${error ? 'error' : ''}`}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('members.iconUrl')}</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={newMemberAvatarUrl}
                                    onChange={(e) => setNewMemberAvatarUrl(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('gender.label')}</label>
                                <select
                                    className="input-field"
                                    value={newMemberGender}
                                    onChange={(e) => setNewMemberGender(e.target.value)}
                                >
                                    <option value="male">{t('gender.male')}</option>
                                    <option value="female">{t('gender.female')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('members.status')}</label>
                                <select
                                    className="input-field"
                                    value={newMemberStatus}
                                    onChange={(e) => setNewMemberStatus(e.target.value)}
                                >
                                    <option value="active">{t('members.active')}</option>
                                    <option value="inactive">{t('members.inactive')}</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            {t('members.createMember')}
                        </button>
                    </form>
                </div>
            )}

            <div className="members-grid">
                {members.map(member => {
                    return (
                        <div key={member.id} className="member-card-wrapper">
                            <Link to={`/members/${member.id}`} className={`member-card ${member.status}`}>
                                <div className="status-badge-container">
                                    <span className={`status-dot ${member.status}`}></span>
                                </div>
                                <img src={member.avatar} alt={member.name} className="member-avatar" />
                                <div className="member-info">
                                    <h3 className="member-name">{member.name}</h3>
                                    <p className="member-role">{member.role} • {t('members.joined')} {new Date(member.joinDate).getFullYear()}</p>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>

            <style>{`
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        .add-member-form {
            margin-bottom: 2rem;
            max-width: 600px;
            animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .form-grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        @media (max-width: 600px) {
            .form-row { grid-template-columns: 1fr; }
        }
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .form-group label {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
        }
        .member-card-wrapper {
            background: var(--bg-card);
            border-radius: 0.5rem;
            border: 1px solid var(--glass-border);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.2s;
        }
        .member-card-wrapper:hover {
            transform: translateY(-4px);
            border-color: var(--primary);
        }
        .member-card {
           padding: 1.5rem;
           display: flex;
           flex-direction: column;
           align-items: center;
           text-align: center;
           position: relative;
           text-decoration: none;
           color: inherit;
           flex: 1;
        }
        .member-card.active {
            background: rgba(16, 185, 129, 0.1); /* Green tint */
        }
        .member-card.inactive {
            background: rgba(239, 68, 68, 0.1); /* Red tint */
            opacity: 0.9;
        }
        .status-badge-container {
            position: absolute;
            top: 1rem;
            right: 1rem;
        }
        .status-dot {
            display: block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }
        .status-dot.active {
            background-color: var(--success);
            box-shadow: 0 0 5px var(--success);
        }
        .status-dot.inactive {
            background-color: var(--danger);
        }
        .member-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 1rem;
            border: 2px solid var(--accent);
            object-fit: cover;
        }
        .member-name {
            font-size: 1.1rem;
            margin-bottom: 0.25rem;
            color: var(--text-primary);
        }
        .member-role {
            font-size: 0.8rem;
            color: var(--text-secondary);
            text-transform: capitalize;
            margin-bottom: 0.25rem;
        }
        .member-detail-sm {
            font-size: 0.75rem;
            color: var(--text-secondary);
            opacity: 0.8;
        }
        
        .card-actions {
            display: flex;
            border-top: 1px solid var(--glass-border);
        }
        .btn-action {
            flex: 1;
            padding: 0.75rem;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 0.85rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-action.toggle:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--accent);
        }

        .btn-text {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
        }
        .btn-text:hover {
            color: var(--text-primary);
            text-decoration: underline;
        }
      `}</style>
        </div>
    );
};

export default Members;
