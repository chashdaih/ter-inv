<template>
    <div class="patients">
        <h1 class="title">Usuarios</h1>
        <router-link :to="{ name:'registerPatient' }" class="button is-success">Registrar nuevo usuario</router-link>
        <br>
        <br>
        <b-field>
            <b-radio-button @input="debounceGetPatients" native-value="Por referir" v-model="statusFilter" type="is-link">Por referir</b-radio-button>
            <b-radio-button @input="debounceGetPatients" native-value="Por nombre" v-model="statusFilter" type="is-link">Buscar por nombre</b-radio-button>
        </b-field>
        <div v-if="statusFilter != 'Por referir'" class="field">
            <label class="label">Buscar usuario por nombres</label>
            <div class="control">
                <input type="text" class="input" placeholder="Por favor, introduce al menos 3 letras" v-model="search" @keyup="debounceGetPatients" />
            </div>
        </div>
        <b-table :data="patients" :loading="isSearching" style="min-height:200px">
            <template slot-scope="props">
                <b-table-column field="data.name" sortable label="Nombre" >{{props.row.data.name}}</b-table-column>
                <b-table-column field="data.lastName" sortable label="Apellido paterno" >{{props.row.data.lastName}}</b-table-column>
                <b-table-column field="data.mothersName" sortable label="Apellido materno" >{{props.row.data.mothersName}}</b-table-column>
                <b-table-column label="Detalles del usuario">
                    <router-link class="button is-success" :to="'/usuarios/' + props.row.id">Ver</router-link>
                </b-table-column>
                <b-table-column field="data.status" sortable label="Estatus"><span class="tag" :class="{'is-warning':props.row.data.status=='Por referir', }">{{props.row.data.status}}</span></b-table-column>
                <b-table-column label="Listado de referencias">
                    <router-link v-if="props.row.data.status != 'Por referir'" class="button is-success" :to="'/usuarios/' + props.row.id + '/referencias'">Ir</router-link>
                    <p v-else>-</p>
                </b-table-column>
                <b-table-column label="Referenciar">
                    <a  class="button is-info" @click.prevent="selectPatient(props.row)" >Referenciar</a>
                </b-table-column>
                <b-table-column label="Desactivar" v-if="currentUser.uid == 's8R9yKP5uJQRNwp1MT8f1PfzPKr1'">
                    <a @click.prevent="showDModal(props.row.id)" class="button is-warning">Desactivar</a>
                </b-table-column>
            </template>
        </b-table>
        <div class="modal" :class="{'is-active': dModalVis}">
            <div class="modal-background"  @click="dModalVis=false"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                <p class="modal-card-title">Desactivar usuario</p>
                <button class="delete" aria-label="close" @click="dModalVis=false"></button>
                </header>
                <section class="modal-card-body">
                <p>Desactivar un usuario hará que no aparezca más en la lista.</p>
                </section>
                <footer class="modal-card-foot">
                <button class="button is-warning" @click.prevent="deactivatePatient" :class="{'is-loading': deactivating}">Desactivar</button>
                <button class="button"  @click="dModalVis=false">Cancelar</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { patientsCollection } from '@/firebaseConfig.js';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            isSearching: false,
            dModalVis: false,
            patToDeaId: null,
            deactivating: false
        }
    },
    computed: {
        ...mapState(['patients', 'currentUser']),
        search: {
            set(val) {
                this.$store.commit('SET_PAT_SEARCH', val);
            },
            get() {
                return this.$store.state.patSearch;
            }
        },
        statusFilter: {
            set(val) { this.$store.commit('SET_REF_STATUS', val); },
            get() { return this.$store.state.refStatus; }
        }
    },
    methods: {
        ...mapActions(['debounceGetPatients']),
        selectPatient(patient) {
            this.$store.commit('SET_SEL_PATIENT', {patient});
            this.$router.push(`/usuarios/${patient.id}/referenciar`);
        },
        showDModal(patientId) {
            this.dModalVis = true;
            this.patToDeaId = patientId;
        },
        deactivatePatient() {
            this.deactivating = true;
            patientsCollection.doc(this.patToDeaId).update({
                status: 'Desactivado'
            })
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El paciente se desactivo exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => this.dModalVis = false,
                });
            })
            .catch(err =>{
                Swal.fire({
                   title: 'Ocurrió un error',
                   text: err,
                   type: "error",
                   confirmButtonText: 'Aceptar' 
                });
            })
            .finally(()=>this.deactivating = false);
        }
    },
    mounted() {
        if (this.statusFilter == 'Por referir') {
            this.debounceGetPatients();
        }
    }
}
</script>