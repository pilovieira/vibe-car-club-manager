import { storageService } from './storageService';

export const mockService = {
    // Members
    getMembers: async () => {
        const data = storageService.getMembers();
        return data.map(member => ({
            ...member,
            joinDate: member.join_date,
            dateBirth: member.date_birth,
            avatar: member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`
        }));
    },

    getMemberById: async (id) => {
        const members = storageService.getMembers();
        const data = members.find(m => m.id === id);
        if (!data) return null;

        return {
            ...data,
            joinDate: data.join_date,
            dateBirth: data.date_birth,
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`
        };
    },

    createMember: async (member) => {
        const memberToInsert = {
            ...member,
            join_date: member.joinDate || new Date().toISOString(),
            date_birth: member.dateBirth,
            role: member.role || 'member',
            status: member.status || 'active',
            avatar: member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username || Date.now()}`
        };
        delete memberToInsert.joinDate;
        delete memberToInsert.dateBirth;

        const created = storageService.addItem('vibe_members', memberToInsert);
        return {
            ...created,
            joinDate: created.join_date,
            dateBirth: created.date_birth
        };
    },

    updateMember: async (id, updatedMember) => {
        const memberToUpdate = { ...updatedMember };
        if (updatedMember.joinDate) {
            memberToUpdate.join_date = updatedMember.joinDate;
            delete memberToUpdate.joinDate;
        }
        if (updatedMember.dateBirth) {
            memberToUpdate.date_birth = updatedMember.dateBirth;
            delete memberToUpdate.dateBirth;
        }

        const updated = storageService.updateItem('vibe_members', id, memberToUpdate);
        return {
            ...updated,
            joinDate: updated.join_date,
            dateBirth: updated.date_birth
        };
    },

    updateMemberStatus: async (memberId, status) => {
        const members = storageService.getMembers();
        const member = members.find(m => m.id === memberId);
        if (member && member.role === 'admin' && status === 'inactive') {
            throw new Error('error.adminInactivation');
        }

        return storageService.updateItem('vibe_members', memberId, { status });
    },


    // Events
    getEvents: async () => {
        const events = storageService.getEvents();
        const attendees = storageService.getAttendees();

        return events.map(event => ({
            ...event,
            eventType: event.event_type,
            attendees: attendees.filter(a => a.event_id === event.id).map(a => a.member_id)
        }));
    },

    createEvent: async (event) => {
        const eventToInsert = { ...event };
        if (eventToInsert.eventType) {
            eventToInsert.event_type = eventToInsert.eventType;
            delete eventToInsert.eventType;
        }

        const created = storageService.addItem('vibe_events', eventToInsert);
        return { ...created, attendees: [] };
    },

    updateEvent: async (eventId, event) => {
        const eventToUpdate = { ...event };
        if (eventToUpdate.eventType) {
            eventToUpdate.event_type = eventToUpdate.eventType;
            delete eventToUpdate.eventType;
        }

        return storageService.updateItem('vibe_events', eventId, eventToUpdate);
    },

    joinEvent: async (eventId, memberId) => {
        const attendees = storageService.getAttendees();
        if (!attendees.find(a => a.event_id === eventId && a.member_id === memberId)) {
            storageService.addItem('vibe_event_attendees', { event_id: eventId, member_id: memberId });
        }
        return this.getEvents().then(events => events.find(e => e.id === eventId));
    },

    leaveEvent: async (eventId, memberId) => {
        const attendees = storageService.getAttendees();
        const filtered = attendees.filter(a => !(a.event_id === eventId && a.member_id === memberId));
        storageService.saveAttendees(filtered);
        return this.getEvents().then(events => events.find(e => e.id === eventId));
    },

    getAllContributions: async () => {
        return storageService.getItems('vibe_contributions');
    },

    getMemberContributions: async (memberId) => {
        const all = storageService.getItems('vibe_contributions');
        return all.filter(c => (c.member_id === memberId || c.memberId === memberId));
    },

    addContribution: async (contribution) => {
        const item = {
            ...contribution,
            member_id: contribution.member_id || contribution.memberId
        };
        delete item.memberId;
        return storageService.addItem('vibe_contributions', item);
    },

    getExpenses: async () => {
        return storageService.getItems('vibe_expenses');
    },

    addExpense: async (expense) => {
        return storageService.addItem('vibe_expenses', expense);
    }

};


