import { auth, db, firebaseConfig } from '../firebase/config';
import { initializeApp, deleteApp } from 'firebase/app';
import {
    getAuth,
    signOut,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword
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

    createUser: async (email, password) => {
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


    sendEmailLink: async (email) => {
        const actionCodeSettings = {
            url: window.location.origin + '/login',
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            return true;
        } catch (error) {
            console.error('Error sending email link:', error);
            throw error;
        }
    },

    isSignInWithEmailLink: (url) => {
        return isSignInWithEmailLink(auth, url);
    },

    signInWithEmailLink: async (email, url) => {
        try {
            const result = await signInWithEmailLink(auth, email, url);
            const user = result.user;
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

            notifyAuthChange('SIGNED_IN', session);
            return session;
        } catch (error) {
            console.error('Error signing in with email link:', error);
            throw error;
        }
    },

    loginWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
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

            notifyAuthChange('SIGNED_IN', session);
            return session;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    }
};
