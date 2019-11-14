<template>
    <div class="patientShow">
        <nav class="breadcrumb">
            <ul v-if="userProfile.userType < 3">
                <li><router-link to="/usuarios">Usuarios</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">Datos del usuario</a></li>
            </ul>
            <ul v-else>
                <li><router-link to="/mis-usuarios">Usuarios referenciados</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">Datos del usuario</a></li>
            </ul>
        </nav>
        <h1 class="title">Datos del usuario</h1>
        <table v-if="patient != null" class="table is-fullwidth is-hoverable is-striped">
            <tbody>
                <tr>
                    <th>Nombre</th>
                    <td>{{fullName}}</td>
                </tr>
                <tr>
                    <th>Estatus</th>
                    <td>{{patient.status}}</td>
                </tr>
                <tr>
                    <th>Edad</th>
                    <td>{{age}}</td>
                </tr>
                <tr v-if="patient.phoneHome">
                    <th>Teléfono de casa</th>
                    <td>{{patient.phoneHome}}</td>
                </tr>
                <tr v-if="patient.phoneCell">
                    <th>Teléfono celular</th>
                    <td>{{patient.phoneCell}}</td>
                </tr>
                <tr v-if="patient.phoneWork">
                    <th>Teléfono de trabajo</th>
                    <td>{{patient.phoneWork}}</td>
                </tr>
                <tr v-if="patient.email">
                    <th>Correo electrónico</th>
                    <td>{{patient.email}}</td>
                </tr>
                <tr>
                    <th>Tipo de usuario</th>
                    <td>{{patient.isUnam?'Colaborativo':'Referenciado'}}</td>
                </tr>
                <template v-if="userProfile.userType < 3">
                <tr>
                    <th>Número de cuenta/CURP/trabajador UNAM</th>
                    <td>{{patient.curp||'Sin especificar'}}</td>
                </tr>
                <tr>
                    <th>Municipio y estado</th>
                    <td>{{patient.municipio||patient.alcaldia}}, {{patient.estado}}</td>
                </tr>
                <tr>
                    <th>Estado civil</th>
                    <td>{{patient.maritalStatus}}</td>
                </tr>
                <tr>
                    <th>Ocupación</th>
                    <td>{{patient.occupation||'Sin especificar'}}</td>
                </tr>
                </template>
                <tr>
                    <th>Modalidad de supervisión</th>
                    <td>{{patient.attentionType}}</td>
                </tr>
                <tr>
                    <th>Tipo de servicio</th>
                    <td>{{patient.askedAttention}}</td>
                </tr>
                <tr>
                    <th>Orientación solicitada</th>
                    <td>{{patient.askedType}}</td>
                </tr>
                <tr>
                    <th>Motivo de la persona para solicitar atención</th>
                    <td>{{patient.reason}}</td>
                </tr>
                <tr>
                    <th>Sintomatología detectada por el paciente</th>
                    <td>{{catalog}}</td>
                </tr>
            </tbody>
        </table>
        <template v-if="userProfile.userType < 3">
            <router-link class="button is-info" :to="'/usuarios/' + patientId +'/editar'">Editar usuario</router-link>
        </template>
    </div>
</template>

<script>
// const fb = require('@/firebaseConfig.js');
import { maritalStatuses, attentionTypes, askedAttentions, askedTypes } from '@/constants.js';
import { mapActions } from 'vuex';

export default {
    props: {
        // patientId: { type: Number, default: this.$route.params.id, },
    },
    data() {
        return {
            patientId: this.$route.params.id,
            // patient: null,
        }
    },
    methods: {
        // getPatient() {
        //     fb.patientsCollection.doc(this.patientId).get()
        //     .then(res=>{
        //         this.patient = res.data();
        //     })
        //     .catch(err=>console.log(err))
        // },
        ...mapActions(['getSelectedPatient']),
    },
    computed: {
        patient() {
            if (!this.$store.state.selectedPatient) return null;
            return this.$store.state.selectedPatient.data 
        },
        fullName: function () {
            // if (!this.patient) return null;
            return this.patient.name + " " + this.patient.lastName + " " + this.patient.mothersName
        },
        age() {
            const bd = new Date(this.patient.birthdate)
            const diff = Date.now() - bd.getTime();
            const ageDiff = new Date(diff);
            return Math.abs(ageDiff.getUTCFullYear()-1970);
        },
        userProfile() {
            return this.$store.state.userProfile;
        },
        catalog() {
            let cat = '';
            // this.patient.symptoms.forEach((val, key, arr) => {
            //     if (key === arr.length -1) {
            //         cat += val;
            //     } else {
            //         cat += `${val}, `;
            //     }
            // })
            for (const prop in this.patient.symptoms) {
                cat += `${prop}, `;
            }
            if (cat != '') { // borra la última coma y espacio todo: buscar una mejor manera
                cat = cat.substring(0, cat.length - 2);
            }
            return cat;
        },
        askedAttention() {
            return askedAttentions[this.patient.askedAttention]
        },
        attentionType: function () { return attentionTypes[this.patient.attentionType] },
        askedType() { return askedTypes[this.patient.askedType]; },
    },
    mounted() {
        // this.patientId = this.$route.params.id;
        // this.getPatient();
        this.getSelectedPatient(this.patientId);
    }
}
</script>