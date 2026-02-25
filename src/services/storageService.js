
const STORAGE_KEYS = {
    MEMBERS: 'vibe_members',
    EVENTS: 'vibe_events',
    EVENT_ATTENDEES: 'vibe_event_attendees',
    CONTRIBUTIONS: 'vibe_contributions',
    EXPENSES: 'vibe_expenses',
    AUTH_USER: 'vibe_auth_user'
};

const getFromStorage = (key, defaultValue = []) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
};

const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initial data if storage is empty
const initializeStorage = () => {
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
        saveToStorage(STORAGE_KEYS.MEMBERS, [
            {
                id: '1',
                email: 'admin@vibe.com',
                username: 'admin',
                name: 'Administrator',
                role: 'admin',
                status: 'active',
                join_date: new Date().toISOString(),
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
            },
            {
                id: '2',
                email: 'member@vibe.com',
                username: 'member1',
                name: 'John Doe',
                role: 'member',
                status: 'active',
                join_date: new Date().toISOString(),
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=member1'
            }
        ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
        saveToStorage(STORAGE_KEYS.EVENTS, [
            {
                id: '1',
                title: 'Summer Car Meet',
                description: 'Annual car meet at the beach',
                date: new Date(Date.now() + 86400000 * 7).toISOString(),
                location: 'Beach Parking',
                event_type: 'meetup'
            }
        ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENT_ATTENDEES)) {
        saveToStorage(STORAGE_KEYS.EVENT_ATTENDEES, []);
    }
};

initializeStorage();

export const storageService = {
    // Auth
    getAuthUser: () => getFromStorage(STORAGE_KEYS.AUTH_USER, null),
    setAuthUser: (user) => saveToStorage(STORAGE_KEYS.AUTH_USER, user),
    clearAuthUser: () => localStorage.removeItem(STORAGE_KEYS.AUTH_USER),

    // Members
    getMembers: () => getFromStorage(STORAGE_KEYS.MEMBERS),
    saveMembers: (members) => saveToStorage(STORAGE_KEYS.MEMBERS, members),

    // Events
    getEvents: () => getFromStorage(STORAGE_KEYS.EVENTS),
    saveEvents: (events) => saveToStorage(STORAGE_KEYS.EVENTS, events),

    // Attendees
    getAttendees: () => getFromStorage(STORAGE_KEYS.EVENT_ATTENDEES),
    saveAttendees: (attendees) => saveToStorage(STORAGE_KEYS.EVENT_ATTENDEES, attendees),

    getItems: (key) => getFromStorage(key),

    // Generic CRUD helpers
    addItem: (key, item) => {
        const items = getFromStorage(key);
        const newItem = { ...item, id: item.id || crypto.randomUUID() };
        items.push(newItem);
        saveToStorage(key, items);
        return newItem;
    },
    updateItem: (key, id, updates) => {
        const items = getFromStorage(key);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            saveToStorage(key, items);
            return items[index];
        }
        return null;
    },
    deleteItem: (key, id) => {
        const items = getFromStorage(key);
        const filtered = items.filter(i => i.id !== id);
        saveToStorage(key, filtered);
    }
};
