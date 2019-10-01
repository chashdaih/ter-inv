<template>
    <div class="referrals">
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/">Inicio</router-link></li>
                <li><router-link to="/terapeutas">Terapeutas</router-link></li>
                <li><router-link :to="'/terapeutas/' + therapistId">{{therapistName}}</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">Usuarios referidos </a></li>
            </ul>
        </nav>
        <h1 class="title">Usuarios referidos al terapeuta {{therapistName}}</h1>
        <table class="table is-fullwidth is-hoverable is-striped">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Ap. Paterno</th>
                    <th>Ap. Materno</th>
                    <th>Datos del paciente</th>
                    <th>Referenciación</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(patient, idx) in patients" :key="idx">
                    <td>{{ patient.data.name }}</td>
                    <td>{{ patient.data.lastName }}</td>
                    <td>{{ patient.data.mothersName }}</td>
                    <td>
                        <router-link :to="'/usuarios/' + patient.id" class="button">Ver/Editar</router-link>
                    </td>
                    <td>
                        <a  class="button" @click="showModal(patient.id)" >Referenciar a otro terapeuta</a>
                    </td>
                </tr>
            </tbody>
        </table>
        <refer-modal 
            :class="{ 'is-active': isModalVisible }" 
            :patient="selectedPatient" 
            @close-refer-modal="isModalVisible=false"
            @reload-patients="getPatients"    
        ></refer-modal>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js');

import ReferModal from '@/components/ReferModal.vue';

export default {
    components: { ReferModal, },
    data() {
        return {
            isModalVisible: false,
            gettingPatients: false,
            patients:[],
            selectedPatient: null,
            therapistId: null,
            therapistName: null,
        }
    },
    methods: {
        getTherapist() { // todo sacar esta info de vuex; setear en otro lugar
           fb.usersCollection.doc(this.therapistId).get()
            .then(res=>{
                const therapist = res.data();
                this.therapistName = therapist.name + " " + therapist.lastName + " " + therapist.mothersName;
            })
            .catch(err=>console.log(err))

        },
        getPatients() {
            this.gettingPatients = true;
            fb.patientsCollection.where('assignations.therapist', '==', this.therapistId).get()
            .then(querySnapshot=>{
                querySnapshot.forEach(doc=> {
                    this.patients.push({ id: doc.id,  data: doc.data() });
                });
            })
            .catch(err=>console.log(err))
            .finally(this.gettingPatients = false);
        },
        showModal(patientId) {
            this.selectedPatient = patientId;
            this.isModalVisible = true;
        }
    },
    mounted() {
        this.therapistId = this.$route.params.id;
        this.getTherapist();
        this.getPatients();
    }
}
</script>