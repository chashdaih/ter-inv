import Vue from 'vue'
import Vuex from 'vuex'
// const fb = require('./firebaseConfig.js')
import { auth, usersCollection, db } from '@/firebaseConfig.js';

// import Referrals from '@/store/referrals.js';

Vue.use(Vuex);

auth.onAuthStateChanged(user => {
  if (user) {
    store.commit('setCurrentUser', user)
    store.dispatch('fetchUserProfile')
  }
})

export const store =  new Vuex.Store({
  state: {
    currentUser: null,
    userProfile: {},
    db,
    // patients
    patSearch: '',
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
    getPatients({ commit, state }) {
      if (state.patSearch.length > 2) {
        let patientsRef = state.db.collection('patients');
        let unsub = patientsRef.where('keywords', 'array-contains', state.patSearch.toLowerCase()).orderBy('createdAt', 'desc').limit(10).onSnapshot(snapshot => {
          commit('CLEAR_PATIENTS');
          snapshot.forEach(patient => commit('SET_PATIENTS', { patient }))
        });
        commit('SET_UNSUB_PATS', unsub);
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
