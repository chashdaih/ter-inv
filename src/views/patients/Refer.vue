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
        <!-- <p class="subtitle">El usuario ha sido referenciado a los siguientes terapeutas invitados</p> -->
        <!-- <a class="button is-success" @click.prevent="">Hacer nueva referenciación</a> -->
        <b-table :loading="loading" :data="referals">
            <template slot-scope="props">
                <b-table-column sortable field="data.timestamp" label="Fecha de referenciación">{{props.row.data.timestamp.toDate().toISOString().split("T")[0]}}</b-table-column>
                <b-table-column sortable field="data.therapistName" label="Nombre del terapeuta"><router-link class="button is-link" :to="'/terapeutas/' + props.row.data.therapistId">{{props.row.data.therapistName||props.row.data.therapistsName}}</router-link></b-table-column>
                <b-table-column sortable field="data.referrerName" label="Referido por"><router-link class="button is-success" :to="'/supervisores/' + props.row.data.referrerId">{{props.row.data.referrerName}}</router-link></b-table-column>
                <b-table-column sortable field="data.status" label="Estatus de la referencia"><span class="tag">{{props.row.data.status}}</span></b-table-column>
                <b-table-column label="Número de sesiones esperadas">{{props.row.data.expectedAppts}}</b-table-column>
                <b-table-column label="Número de sesiones transcurridas">{{props.row.data.sessions ? Object.keys(props.row.data.sessions).length : 0}}</b-table-column>
                <b-table-column label="Detalle de sesiones"><router-link :to="'/usuarios/' + patientId + '/referencias/' + props.row.id" class="button is-info">Ir</router-link></b-table-column>

            </template>
            <template slot="empty">
                <section class="section">
                    <div class="content has-text-grey has-text-centered">
                        <p class="is-italic">No se encontraron referenciaciones para el usuario.</p>
                    </div>
                </section>
            </template>
        </b-table>
    </div>    
</template>

<script>
const fb = require('@/firebaseConfig.js');
import { mapState } from 'vuex';

export default {
    data() {
        return {
            patientId: this.$route.params.id,
            patient: null,
            loading: true,
            referals: [],
        }
    },
    methods: {
        getPatient() { // todo sacar esta info de vuex; setear en otro lugar
           fb.patientsCollection.doc(this.patientId).get()
            .then(doc=>this.patient = doc.data())
            .catch(err=>console.log(err))
        },
        getRefers() {
            this.loading = true;
            fb.refersCollection.where('patientId', '==', this.patientId).get()
            .then(querySnapshot=>{
                querySnapshot.forEach(doc=> {
                    this.referals.push({ id: doc.id,  data: doc.data() });
                });
            })
            .catch(err=>console.log(err))
            .finally(this.loading = false);
        }
    },
    computed: {
        fullName: function () {
            if (!this.patient) return null;
            return this.patient.name + " " + this.patient.lastName + " " + this.patient.mothersName
        },
        ...mapState(['currentUser']),
    },
    mounted() {
        this.getPatient();
        this.getRefers();
    }
}
</script>