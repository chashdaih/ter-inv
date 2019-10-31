<template>
    <div class="patients">
        <h1 class="title">Usuarios</h1>
        <router-link :to="{ name:'registerPatient' }" class="button is-success">Registrar nuevo usuario</router-link>
        <br>
        <br>
        <div class="field">
            <label class="label">Buscar usuario por nombres</label>
            <div class="control">
                <input type="text" class="input" placeholder="Por favor, introduce al menos 3 letras" v-model="search" @keyup="debounceGetPatients" />
            </div>
        </div>
        <b-table :data="patients" :loading="isSearching" style="min-height:200px">
            <template slot-scope="props">
                <b-table-column field="name" sortable label="Nombre" >{{props.row.data.name}}</b-table-column>
                <b-table-column field="lastName" sortable label="Apellido paterno" >{{props.row.data.lastName}}</b-table-column>
                <b-table-column field="mothersName" sortable label="Apellido materno" >{{props.row.data.mothersName}}</b-table-column>
                <b-table-column label="Detalles del usuario">
                    <router-link class="button is-success" :to="'/usuarios/' + props.row.id">Ver</router-link>
                </b-table-column>
                <b-table-column label="Estatus"><span class="tag" :class="{'is-warning':props.row.data.status=='Por referir', }">{{props.row.data.status}}</span></b-table-column>
                <b-table-column label="Listado de referencias">
                    <router-link v-if="props.row.data.status != 'Por referir'" class="button is-success" :to="'/usuarios/' + props.row.id + '/referencias'">Ir</router-link>
                    <p v-else>-</p>
                </b-table-column>
                <b-table-column label="Referenciar">
                    <a  class="button is-info" @click.prevent="selectPatient(props.row)" >Referenciar</a>
                </b-table-column>
            </template>
        </b-table>
        <!-- <refer-modal 
            :class="{ 'is-active': isModalVisible }" 
            :patient="selectedPatient" 
            @close-refer-modal="clearModal" 
        ></refer-modal> -->
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
// import ReferModal from '@/components/ReferModal.vue';

export default {
    // components: { ReferModal, },
    data() {
        return {
            // isModalVisible: false,
            // selectedPatient: null,
            isSearching: false,
        }
    },
    computed: {
        ...mapState(['patients']),
        search: {
            set(val) {
                this.$store.commit('SET_PAT_SEARCH', val);
            },
            get() {
                return this.$store.state.patSearch;
            }
        }
    },
    methods: {
        // showModal(patient) {
        //     this.selectedPatient = patient;
        //     this.isModalVisible = true;
        // },
        // clearModal() {
        //     this.isModalVisible=false;
        //     this.selectedPatient = null;
        // },
        ...mapActions(['debounceGetPatients']),
        selectPatient(patient) {
            this.$store.commit('SET_SEL_PATIENT', {patient});
            this.$router.push(`/usuarios/${patient.id}/referenciar`);
        },
        // throttledMethod() {
        //     const debounced = debounce(()=>this.getPatients(), 500);
        // }
    },
    // mounted() {
    //     if (this.patients.length === 0) {
    //         this.getPatients('');
    //     }
    // }
}
</script>