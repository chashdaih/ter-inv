import { refersCollection, patientsCollection } from '@/firebaseConfig.js';

export default {
    namespaced: true,
    state: {
        therapistId: null,
        active: [],
        ended: [],
        // filter: 'Activo',
        loadingAct: false,
        loadingEnd: false,
        unsubAct: null,
        unsubEnd: null,
        error: null,
    },
    mutations: {
        SET_THER (state, val) {
            state.therapistId = val;
        },
        SET_ACTIVE (state, val) {
            state.active = val;
        },
        SET_ENDED (state, val) {
            state.ended = val;
        },
        SET_LOAD_ACT (state, val) {
            state.loadingAct = val;
        },
        SET_LOAD_END (state, val) {
            state.loadingEnd = val
        },
        SET_UNSUB_ACT (state, val) {
            state.unsubAct = val
        },
        SET_UNSUB_END (state, val) {
            state.unsubEnd = val
        },
        SET_ERROR (state, val) {
            state.error = val;
        },
    },
    actions: {
        async getRefersOption({ commit, state }, refOption) {
            let asString = 'SET_ACTIVE';
            let loadString = 'SET_LOAD_ACT';
            let unsubString = 'SET_UNSUB_ACT';
            if (refOption != 'Activo') {
                asString = 'SET_ENDED';
                loadString = 'SET_LOAD_END';
                unsubString = 'SET_UNSUB_END';
            }
            commit(loadString, true);
            commit(asString, [])
            try {
                // TODO onSnapshot
                let therRefers = await refersCollection.where('therapistId', '==', state.therapistId).where('status', '==', refOption).get();
                let temp = [];
                for (let doc of therRefers.docs) {
                    if (!doc.data().patientStatus) {
                        let updatedStatus = 'En tratamiento'
                        if (refOption != 'Activo') {
                            let patient = await patientsCollection.doc(doc.data().patientId).get();
                            updatedStatus = patient.data().status;
                        }
                        await refersCollection.doc(doc.id).update({ patientStatus: updatedStatus });
                        doc.data().patientStatus = updatedStatus;
                    } 
                    temp.push({ id: doc.id,  data: doc.data() })
                }
                commit(asString, temp);
                commit(unsubString, 'paraOnSnap');
                
            } catch (err) {
                commit('SET_ERROR', err)
            } finally {
                commit(loadString, false)
            }
        }
    }
}