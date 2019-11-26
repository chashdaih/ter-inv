import Vue from 'vue'
import Vuex from 'vuex'
import { auth, usersCollection, db } from '@/firebaseConfig.js';
import { debounce } from 'lodash-es';

import refers from '@/store/refers.js';

Vue.use(Vuex);

auth.onAuthStateChanged(user => {
  if (user) {
    store.commit('setCurrentUser', user)
    store.dispatch('fetchUserProfile')
  }
})

export const store =  new Vuex.Store({
  modules: { refers },
  state: {
    currentUser: null,
    userProfile: {},
    db,
    // patients
    patSearch: '',
    refStatus: 'Por referir',
    moreStatus: null,
    loadingPatients: true,
    patients: [],
    selectedPatient: null,
    unsubscribeFromPats: null, // todo ¿donde debe ir esto?
  },
  mutations: {
    setCurrentUser(state, val) {
      state.currentUser = val
    },
    setUserProfile(state, val) {
      if (val.userType == 3) {
        if (!val.attentionType) {
          val.attentionType = {};
        }
      }
        state.userProfile = val;
    },
    // patients
    SET_PAT_SEARCH(state, searchValue ) {
      state.patSearch = searchValue;
    },
    SET_REF_STATUS(state, val ) {
      state.refStatus = val;
    },
    SET_MORE_STATUS(state, val ) {
      state.moreStatus = val;
    },
    SET_LOADING_PATIENTS(state, val) {
      state.loadingPatients = val;
    },
    SET_PATIENTS (state, { patient }) {
      const data = patient.data();
      state.patients = [
        ...state.patients,
        {id: patient.id, data}
      ]
    },
    CLEAR_PATIENTS (state) {
      state.patients = [];
    },
    SET_SEL_PATIENT (state, { patient }) {
      state.selectedPatient = patient;
    },
    SET_UNSUB_PATS (state, unsub) {
      state.unsubscribeFromPats = unsub;
    }
  },
  actions: {
    clearData({ commit }) {
      commit('setCurrentUser', null);
      commit('setUserProfile', {});
      commit('CLEAR_PATIENTS');
      commit('SET_UNSUB_PATS', null);
    },
    fetchUserProfile({ commit, state }) {
      usersCollection.doc(state.currentUser.uid).get()
      .then(res=>{
        commit('setUserProfile', res.data())
      })
      // .catch(err=>{console.log(err)})
    },
    debounceGetPatients: debounce( ({dispatch}) => {
      dispatch('getPatients');
    }, 500),
    getPatients({ commit, state }) {
      if (state.refStatus == 'Por referir' || state.patSearch.length > 2) {
        commit('SET_LOADING_PATIENTS', true);
        if (state.unsubscribeFromPats) {
          state.unsubscribeFromPats();
        }
        let query = state.db.collection('patients');
        return new Promise((resolve) => {
          let resolveOnce = (snap) => {
            resolveOnce = () => null;
            resolve(snap);
          };
          if (state.refStatus == 'Por referir') {
            query = query.where('status', '==', state.refStatus).limit(20);
          } else {
              if (state.moreStatus) {
                query = query.where('status', '==', state.moreStatus);
              }
              query = query.where('keywords', 'array-contains', state.patSearch.toLowerCase()).orderBy('createdAt', 'desc').limit(10);
          }
          let unsub = query.onSnapshot(snapshot => {
            commit('CLEAR_PATIENTS');
            snapshot.forEach(patient => commit('SET_PATIENTS', { patient }))
            commit('SET_UNSUB_PATS', unsub);
            resolveOnce(commit('SET_LOADING_PATIENTS', false));
          });
        });
      }
    }, 
    async getSelectedPatient({ commit, state }, patientId) {
      let patient = state.patients.filter(obj => obj.id == patientId)[0];
      if (!patient) {
        // console.log('se irá al serv');
        let patientsRef = state.db.collection('patients');
        let res = await patientsRef.doc(patientId).get();
        patient = { id: res.id, data: res.data() };
      } else {
        // console.log('ya se tenía');
      }
      commit('SET_SEL_PATIENT', { patient });
    }
  },
  // modules: { Referrals, }
})
