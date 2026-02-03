import { useState, useEffect } from 'react';
import { mockService } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const AdminMemberContributions = () => {
    const { isAdmin } = useAuth();
    const { t } = useLanguage();
    const [members, setMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [contributions, setContributions] = useState([]);

    // New Contribution State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContribution, setNewContribution] = useState({ date: '', amount: 50 });

    useEffect(() => {
        setMembers(mockService.getMembers());
    }, []);

    useEffect(() => {
        if (selectedMemberId) {
            setContributions(mockService.getMemberContributions(selectedMemberId));
        } else {
            setContributions([]);
        }
    }, [selectedMemberId]);

    const handleCreateContribution = (e) => {
        e.preventDefault();
        if (!selectedMemberId) return;

        const added = mockService.addContribution({
            memberId: selectedMemberId,
            ...newContribution
        });

        setContributions([...contributions, added]);
        setShowAddForm(false);
        setNewContribution({ date: '', amount: 50 });
    };

    const selectedMember = members.find(m => m.id === selectedMemberId);

    if (!isAdmin) return <div className="container">{t('admin.accessDenied')}</div>;

    return (
        <div className="container admin-contributions-page">
            <header className="page-header">
                <h1 className="page-title">{t('contributions.title')}</h1>
                <div className="header-actions">
                    {/* Navigation back to dashboard or other admin pages */}
                    <Link to="/admin/summary" className="btn btn-outline">{t('monthly.title')}</Link>
                </div>
            </header>

            <div className="card selection-card">
                <label className="label-block">{t('contributions.selectMember')}</label>
                <select
                    className="input-field"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                    <option value="">{t('contributions.choose')}</option>
                    {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                    ))}
                </select>
            </div>

            {selectedMember && (
                <div className="animate-fade-in">
                    <div className="section-header">
                        <h2>{t('contributions.paymentHistory')} - {selectedMember.name}</h2>
                        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? t('contributions.cancel') : t('contributions.recordPayment')}
                        </button>
                    </div>

                    {showAddForm && (
                        <div className="card add-form">
                            <h3>{t('contributions.newPayment')}</h3>
                            <form onSubmit={handleCreateContribution} className="form-inline">
                                <div className="form-group">
                                    <label>{t('contributions.date')}</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={newContribution.date}
                                        onChange={e => setNewContribution({ ...newContribution, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('contributions.amount')}</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={newContribution.amount}
                                        onChange={e => setNewContribution({ ...newContribution, amount: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-success" style={{ alignSelf: 'flex-end' }}>{t('contributions.save')}</button>
                            </form>
                        </div>
                    )}

                    <div className="card history-list">
                        {contributions.length === 0 ? (
                            <p className="text-secondary text-center">{t('contributions.noHistory')}</p>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>{t('contributions.date')}</th>
                                        <th>{t('contributions.amount')}</th>
                                        <th>{t('monthly.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contributions.map(c => (
                                        <tr key={c.id}>
                                            <td>{new Date(c.date).toLocaleDateString()}</td>
                                            <td>${c.amount}</td>
                                            <td><span className="badge-paid">{t('monthly.paid')}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            <style>{`
        .label-block {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        .selection-card {
            margin-bottom: 2rem;
            max-width: 500px;
        }
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .form-inline {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .btn-success {
            background-color: var(--success);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        .data-table th, .data-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--glass-border);
        }
        .badge-paid {
            background: rgba(34, 197, 94, 0.2);
            color: var(--success);
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .add-form {
            margin-bottom: 2rem;
            border-color: var(--primary);
        }
      `}</style>
        </div>
    );
};

export default AdminMemberContributions;
