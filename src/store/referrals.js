import { refersCollection, patientsCollection } from '@/firebaseConfig.js';

export default {
    state: {
        referrals: [],
        referred: null,
        unsubscribe: null,
        statusFilter: 'Activo'
    },
    mutations : {
        SET_FILTER(state, filterValue) {
            state.statusFilter = filterValue;
        },
        CLEAR_REFERRALS(state) {
            state.referrals = [];
        },
        SET_REFERRALS(state, referred) {
            state.referrals = [...state.referrals, referred];
        },
        SET_REFERRED(state, referred) {
            state.referred = referred;
        },
        SET_UNSUB(state, unsub) {
            state.unsubscribe = unsub;
        }
    },
    actions: {
        getReferrals({ commit, state }, therapistId) {
            let unsub = refersCollection.where('therapistId', '==', therapistId).where('status', '==', state.statusFilter).onSnapshot(snapshot => {
            commit('CLEAR_REFERRALS');
            snapshot.forEach(referred => commit('SET_REFERRALS', referred))
            });
            commit('SET_UNSUB', unsub);
        },
        async getReferred({ commit, state }, patientId) {
            let referred = state.referrals.filter(obj => obj.id == patientId)[0];
            if (!referred) {
                let res = await patientsCollection.doc(patientId).get();
                referred = { id: res.id, data: res.data() };
            }
            commit('SET_REFERRED', referred);
        }
    }
}