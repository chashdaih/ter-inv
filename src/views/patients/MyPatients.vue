<template>
    <div>
        <h1 class="title">Usuarios referenciados</h1>
        <table class="table is-fullwidth">
            <thead>
                <tr>
                    <th>Nombre del paciente</th>
                    <th>Ir a detalles</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(patient, idx) in patients" :key="idx">
                    <td>{{patient.data.name + " " + patient.data.lastName + " " + patient.data.mothersName}}</td>
                    <td><router-link :to="'/mis-usuarios/' + patient.id" class="button is-success">Ir</router-link></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js')
export default {
    data() {
        return {
            loading: false,
            patients: [],
        }
    },
    methods: {
        getPatients() {
            fb.patientsCollection.where('assignations.therapist', '==', this.$store.state.currentUser.uid).get()
            .then(querySnapshot=>{
                querySnapshot.forEach(doc=> {
                    this.patients.push({ id: doc.id,  data: doc.data() });
                });
            })
            .catch(err=>console.log(err))
        },
    },
    mounted() {
        this.getPatients();
    }
}
</script>