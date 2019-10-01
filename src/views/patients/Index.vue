<template>
    <div class="patients">
        <h1 class="title">Usuarios</h1>
        <router-link :to="{ name:'registerPatient' }" class="button is-success">Registrar nuevo usuario</router-link>
        <br>
        <br>
        <div class="field">
            <label class="label">Filtrar por nombres</label>
            <div class="control">
                <input type="text" class="input" placeholder="Buscar" />
            </div>
        </div>
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
                        <router-link v-if="patient.data.assignations != null"  :to="'/usuarios/' + patient.id + '/referenciados'" class="button is-success">Ver referencias</router-link>
                        <a v-else class="button is-warning" @click="showModal(patient.id)" >Referenciar</a>
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
const fb = require('@/firebaseConfig.js')

import ReferModal from '@/components/ReferModal.vue';

export default {
    components: { ReferModal, },
    data() {
        return {
            isModalVisible: false,
            patients: [],
            selectedPatient: null,
        }
    },
    methods: {
        getPatients() {
            fb.patientsCollection.get()
            .then(querySnapshot=>{
                querySnapshot.forEach(doc=> {
                    this.patients.push({ id: doc.id,  data: doc.data() });
                });
            })
            .catch(err=>console.log(err))
        },
        showModal(patientId) {
            this.selectedPatient = patientId;
            this.isModalVisible = true;
        }
    },
    mounted() {
        this.getPatients();
    }
}
</script>