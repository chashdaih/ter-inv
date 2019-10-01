<template>
    <div class="refer">
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/">Inicio</router-link></li>
                <li><router-link to="/usuarios">Usuarios</router-link></li>
                <li><router-link :to="'/usuarios/' + patientId">{{fullName}}</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">Referencias del usuario</a></li>
            </ul>
        </nav>
        <h1 class="title">Referencias del usuario</h1>
        <p class="subtitle">El usuario ha sido referenciado a los siguientes terapeutas invitados</p>
        <a class="button is-success" @click.prevent="">Hacer nueva referenciación</a>
        <table class="table">
            <thead>
                <tr>
                    <th>Nombre del terapeuta</th>
                    <th>Fecha de referenciación</th>
                    <th>Referenciado por</th>
                    <th>Ver información del terapeuta</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="patient">
                    <td>{{patient.assignations.therapist}}</td>
                    <td>{{patient.assignations.timestamps}}</td>
                    <td>{{patient.assignations.referrer}}</td>
                    <td><router-link :to="'/terapeutas/' + patient.assignations.therapist" class="button">Ir</router-link></td>
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
            patientId: null,
            patient: null,
        }
    },
    methods: {
        getPatient() {
            fb.patientsCollection.doc(this.patientId).get()
            .then(res=>{
                this.patient = res.data();
            })
            .catch(err=>console.log(err))
        },
    },
    computed: {
        fullName: function () {
            if (!this.patient) return null;
            return this.patient.name + " " + this.patient.lastName + " " + this.patient.mothersName
        }
    },
    mounted() {
        this.patientId = this.$route.params.id;
        this.getPatient();
    }
}
</script>