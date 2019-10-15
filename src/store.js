import Vue from 'vue'
import Vuex from 'vuex'
// const fb = require('./firebaseConfig.js')
import { auth, usersCollection, db } from '@/firebaseConfig.js';

Vue.use(Vuex)

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
    patients: [],
    // patientsIds: [],
  },
  mutations: {
    setCurrentUser(state, val) {
      state.currentUser = val
    },
    setUserProfile(state, val) {
        state.userProfile = val
    },
    SET_PATIENTS (state, { patient }) {
      const data = patient.data();
      state.patients = [
        ...state.patients,
        {id: patient.id, data}
      ]
      // state.patientsIds.push(patient.id);
    }
  },
  actions: {
    clearData({ commit }) {
      commit('setCurrentUser', null),
      commit('setUserProfile', {})
    },
    fetchUserProfile({ commit, state }) {
      usersCollection.doc(state.currentUser.uid).get()
      .then(res=>{
        commit('setUserProfile', res.data())
      })
      .catch(err=>{console.log(err)})
    },
    async getPatients({ commit, state }) {
      let patientsRef = state.db.collection('patients');
      let patients = await patientsRef.get();
      patients.forEach(patient => commit('SET_PATIENTS', { patient }))
    }
  }
})
