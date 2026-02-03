
const STORAGE_KEY = 'car_club_data';

const initialData = {
    members: [
        {
            id: '1',
            username: 'admin',
            name: 'Club Admin',
            email: 'admin@offroadmga.com',
            role: 'admin',
            status: 'active',
            gender: 'male',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        },
        {
            id: '2',
            username: 'jdoe',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'member',
            status: 'active',
            gender: 'male',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
        }
    ],
    cars: [
        {
            id: 'c1',
            memberId: '2',
            make: 'Ford',
            model: 'Mustang',
            year: '1969',
            description: 'Classic muscle car, fully restored.',
            photoUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&q=80&w=800'
        }
    ],
    events: [
        {
            id: 'e1',
            title: 'Summer Meetup',
            date: '2024-07-20',
            description: 'Annual summer gathering at the beach.',
            location: 'Santa Monica Pier',
            attendees: ['2'],
            eventType: 'members meetup'
        }
    ],
    contributions: [
        {
            id: 'ct1',
            memberId: '2',
            date: '2024-07-15',
            amount: 50
        },
        {
            id: 'ct2',
            memberId: '2',
            date: '2024-06-10',
            amount: 50
        }
    ],
    expenses: [
        {
            id: 'ex1',
            date: '2024-07-22',
            description: 'Event Snacks',
            amount: 120
        }
    ]
};

// Initialize data if not exists
const loadData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(data);
};

const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const mockService = {
    getMembers: () => loadData().members,
    getMemberById: (id) => loadData().members.find(m => m.id === id),

    createMember: (member) => {
        const data = loadData();
        if (data.members.some(m => m.username === member.username)) {
            throw new Error('Username already exists');
        }
        const newMember = {
            ...member,
            id: Date.now().toString(),
            status: member.status || 'active',
            role: member.role || 'member'
        };
        data.members.push(newMember);
        saveData(data);
        return newMember;
    },

    updateMember: (id, updatedMember) => {
        const data = loadData();
        const index = data.members.findIndex(m => m.id === id);
        if (index !== -1) {
            if (updatedMember.username && data.members.some(m => m.username === updatedMember.username && m.id !== id)) {
                throw new Error('Username already exists');
            }
            data.members[index] = { ...data.members[index], ...updatedMember };
            saveData(data);
            return data.members[index];
        }
        return null;
    },

    updateMemberStatus: (memberId, status) => {
        const data = loadData();
        const member = data.members.find(m => m.id === memberId);
        if (member) {
            member.status = status;
            saveData(data);
        }
        return member;
    },

    getCars: (memberId) => {
        const data = loadData();
        return memberId ? data.cars.filter(c => c.memberId === memberId) : data.cars;
    },

    addCar: (car) => {
        const data = loadData();
        const newCar = { ...car, id: Date.now().toString() };
        data.cars.push(newCar);
        saveData(data);
        return newCar;
    },

    updateCar: (updatedCar) => {
        const data = loadData();
        const index = data.cars.findIndex(c => c.id === updatedCar.id);
        if (index !== -1) {
            data.cars[index] = { ...data.cars[index], ...updatedCar };
            saveData(data);
            return data.cars[index];
        }
        return null;
    },

    deleteCar: (carId) => {
        const data = loadData();
        data.cars = data.cars.filter(c => c.id !== carId);
        saveData(data);
    },

    getEvents: () => loadData().events,

    createEvent: (event) => {
        const data = loadData();
        const newEvent = { ...event, id: Date.now().toString(), attendees: [] };
        data.events.push(newEvent);
        saveData(data);
        return newEvent;
    },

    updateEvent: (eventId, updatedEvent) => {
        const data = loadData();
        const index = data.events.findIndex(e => e.id === eventId);
        if (index !== -1) {
            data.events[index] = { ...data.events[index], ...updatedEvent };
            saveData(data);
            return data.events[index];
        }
        return null;
    },

    joinEvent: (eventId, memberId) => {
        const data = loadData();
        const member = data.members.find(m => m.id === memberId);
        if (!member || member.status === 'inactive') return null;

        const event = data.events.find(e => e.id === eventId);
        if (event && !event.attendees.includes(memberId)) {
            event.attendees.push(memberId);
            saveData(data);
        }
        return event;
    },

    leaveEvent: (eventId, memberId) => {
        const data = loadData();
        const event = data.events.find(e => e.id === eventId);
        if (event && event.attendees.includes(memberId)) {
            event.attendees = event.attendees.filter(id => id !== memberId);
            saveData(data);
        }
        return event;
    },

    getAllContributions: () => loadData().contributions,

    getMemberContributions: (memberId) => {
        const data = loadData();
        return data.contributions.filter(c => c.memberId === memberId);
    },

    addContribution: (contribution) => {
        const data = loadData();
        const newContribution = { ...contribution, id: Date.now().toString() };
        data.contributions.push(newContribution);
        saveData(data);
        return newContribution;
    },

    removeContribution: (contributionId) => {
        const data = loadData();
        data.contributions = data.contributions.filter(c => c.id !== contributionId);
        saveData(data);
    },

    getExpenses: () => loadData().expenses || [],

    addExpense: (expense) => {
        const data = loadData();
        if (!data.expenses) data.expenses = [];
        const newExpense = { ...expense, id: Date.now().toString() };
        data.expenses.push(newExpense);
        saveData(data);
        return newExpense;
    },

    resetData: () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
    }
};
