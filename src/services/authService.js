import { auth, db, firebaseConfig } from '../firebase/config';
import { initializeApp, deleteApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
const authEvents = new Set();

const notifyAuthChange = (event, session) => {
    authEvents.forEach(callback => callback(event, session));
};

const ensureMemberProfile = async (user) => {
    const memberDocRef = doc(db, 'members', user.uid);
    const memberDoc = await getDoc(memberDocRef);

    if (!memberDoc.exists()) {
        console.log('authService: Member data not found, creating default profile');
        const memberData = {
            id: user.uid,
            email: user.email,
            username: user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
            name: user.displayName || user.email.split('@')[0],
            role: 'member',
            status: 'active',
            join_date: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
        };
        await setDoc(memberDocRef, memberData);
        return memberData;
    }

    return memberDoc.data();
};

export const authService = {
    login: async (identifier, password) => {
        console.log('authService: Attempting login for', identifier);

        let email = identifier;

        if (!identifier.includes('@')) {
            const membersRef = collection(db, 'members');
            const q = query(membersRef, where('username', '==', identifier.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('Invalid username or password');
            }

            email = querySnapshot.docs[0].data().email;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const memberData = await ensureMemberProfile(user);

            if (memberData.status === 'inactive') {
                await signOut(auth);
                throw new Error('login.errorInactive');
            }

            const session = {
                user: {
                    id: user.uid,
                    email: user.email,
                    user_metadata: {
                        username: memberData.username,
                        full_name: memberData.name
                    }
                },
                access_token: await user.getIdToken()
            };

            notifyAuthChange('SIGNED_IN', session);
            return session;
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                throw new Error('Invalid email or password');
            }
            throw error;
        }
    },

    signUp: async (email, password, metadata) => {
        console.log('authService: Attempting signup for', email);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const newMember = {
                id: user.uid,
                email: email,
                username: metadata.username.toLowerCase(),
                name: metadata.name,
                role: 'member',
                status: 'active',
                join_date: new Date().toISOString(),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${metadata.username}`
            };

            await setDoc(doc(db, 'members', user.uid), newMember);

            const session = {
                user: {
                    id: user.uid,
                    email: user.email,
                    user_metadata: {
                        username: newMember.username,
                        full_name: newMember.name
                    }
                },
                access_token: await user.getIdToken()
            };

            notifyAuthChange('SIGNED_UP', session);
            return session;
        } catch (error) {
            console.error('Signup error:', error);
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('User already exists');
            }
            throw error;
        }
    },

    logout: async () => {
        console.log('authService: Logging out...');
        await signOut(auth);
        notifyAuthChange('SIGNED_OUT', null);
    },

    getSession: async () => {
        const user = auth.currentUser;
        if (!user) return null;

        const memberData = await ensureMemberProfile(user);

        return {
            user: {
                id: user.uid,
                email: user.email,
                user_metadata: {
                    username: memberData.username,
                    full_name: memberData.name
                }
            },
            access_token: await user.getIdToken()
        };
    },

    onAuthStateChange: (callback) => {
        authEvents.add(callback);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const memberData = await ensureMemberProfile(user);
                const session = {
                    user: {
                        id: user.uid,
                        email: user.email,
                        user_metadata: {
                            username: memberData.username,
                            full_name: memberData.name
                        }
                    },
                    access_token: await user.getIdToken()
                };
                callback('SIGNED_IN', session);
            } else {
                callback('SIGNED_OUT', null);
            }
        });

        return {
            data: {
                subscription: {
                    unsubscribe: () => {
                        unsubscribe();
                        authEvents.delete(callback);
                    }
                }
            }
        };
    },

    createUser: async (email, password, metadata) => {
        console.log('authService: Admin creating user for', email);

        const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
        const secondaryAuth = getAuth(secondaryApp);

        try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const user = userCredential.user;

            await signOut(secondaryAuth);
            await deleteApp(secondaryApp);
            return user;
        } catch (error) {

            if (secondaryApp) await deleteApp(secondaryApp);
            console.error('Admin user creation error:', error);
            throw error;
        }
    },

    getProfile: async (userId) => {
        const memberDoc = await getDoc(doc(db, 'members', userId));
        return memberDoc.exists() ? memberDoc.data() : null;
    },

    reauthenticate: async (currentPassword) => {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        return await reauthenticateWithCredential(user, credential);
    },

    changePassword: async (currentPassword, newPassword) => {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            // Firebase usually requires re-authentication for sensitive operations
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            return true;
        } catch (error) {
            console.error('Change password error:', error);
            if (error.code === 'auth/wrong-password') {
                throw new Error('Invalid current password');
            }
            if (error.code === 'auth/weak-password') {
                throw new Error('Password should be at least 6 characters');
            }
            if (error.code === 'auth/requires-recent-login') {
                throw new Error('Please log in again to change password');
            }
            throw error;
        }
    }
};
