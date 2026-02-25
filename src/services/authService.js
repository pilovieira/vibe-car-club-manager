import { storageService } from './storageService';

const authEvents = new Set();

const notifyAuthChange = (event, session) => {
    authEvents.forEach(callback => callback(event, session));
};

export const authService = {
    login: async (identifier, password) => {
        console.log('authService: Attempting login for', identifier);

        // Mock login: find member with this email or username
        const members = storageService.getMembers();
        const member = members.find(m =>
            m.email === identifier || m.username === identifier.toLowerCase()
        );


        if (!member) {
            throw new Error('Invalid email or password');
        }

        if (member.status === 'inactive') {
            throw new Error('login.errorInactive');
        }



        // In a real mock we might check password, but for this demo any password works
        const session = {
            user: {
                id: member.id,
                email: member.email,
                user_metadata: {
                    username: member.username,
                    full_name: member.name
                }
            },
            access_token: 'mock-token-' + Date.now()
        };

        storageService.setAuthUser(session);
        notifyAuthChange('SIGNED_IN', session);
        return session;
    },

    signUp: async (email, password, metadata) => {
        console.log('authService: Attempting signup for', email);

        const members = storageService.getMembers();
        if (members.find(m => m.email === email)) {
            throw new Error('User already exists');
        }

        const newMember = {
            id: crypto.randomUUID(),
            email: email,
            username: metadata.username.toLowerCase(),
            name: metadata.name,
            role: 'member',
            status: 'active',
            join_date: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${metadata.username}`
        };

        storageService.addItem('vibe_members', newMember);

        const session = {
            user: {
                id: newMember.id,
                email: newMember.email,
                user_metadata: {
                    username: newMember.username,
                    full_name: newMember.name
                }
            },
            access_token: 'mock-token-' + Date.now()
        };

        storageService.setAuthUser(session);
        notifyAuthChange('SIGNED_UP', session);
        return session;
    },

    logout: async () => {
        console.log('authService: Logging out...');
        storageService.clearAuthUser();
        notifyAuthChange('SIGNED_OUT', null);
    },

    getSession: async () => {
        return storageService.getAuthUser();
    },

    onAuthStateChange: (callback) => {
        authEvents.add(callback);

        // Return unsubscribe function
        const session = storageService.getAuthUser();
        // Emit initial session
        setTimeout(() => callback('INITIAL_SESSION', session), 0);

        return {
            data: {
                subscription: {
                    unsubscribe: () => authEvents.delete(callback)
                }
            }
        };
    },

    createUser: async (email, password, metadata) => {
        console.log('authService: Admin creating user for', email);

        const members = storageService.getMembers();
        if (members.find(m => m.email === email)) {
            throw new Error('User already exists');
        }

        const newMember = {
            id: crypto.randomUUID(),
            email: email,
            username: metadata.username.toLowerCase(),
            name: metadata.name,
            role: metadata.role || 'member',
            status: 'active',
            join_date: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${metadata.username}`
        };

        storageService.addItem('vibe_members', newMember);
        return newMember;
    },

    getProfile: async (userId) => {
        const members = storageService.getMembers();
        return members.find(m => m.id === userId) || null;
    }
};

