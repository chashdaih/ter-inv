<template>
    <div class="patients">
        <h1 class="title">Usuarios</h1>
        <router-link :to="{ name:'registerPatient' }" class="button is-success">Registrar nuevo usuario</router-link>
        <br>
        <br>
        <!-- <div class="field">
            <label class="label">Filtrar por nombres</label>
            <div class="control">
                <input type="text" class="input" placeholder="Buscar" v-model="search" @keyup="searchByName" />
            </div>
        </div> -->
        <b-table :data="patients" :loading="isSearching">
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
                    <a  class="button is-info" @click="showModal(props.row)" >Referenciar</a>
                </b-table-column>
            </template>
        </b-table>
        <!-- <a @click.prevent="searchByName" class="button">Cargar más</a> -->
        <!-- <refer-modal 
            :class="{ 'is-active': isModalVisible }" 
            :patient="selectedPatient" 
            @close-refer-modal="clearModal"
            @reload-patients="searchByName"    
        ></refer-modal> -->
    </div>
</template>

<script>
// const fb = require('@/firebaseConfig.js');

import { mapState, mapActions } from 'vuex';

import ReferModal from '@/components/ReferModal.vue';

const limit = 2;
let lastDoc = null;

export default {
    components: { ReferModal, },
    data() {
        return {
            isModalVisible: false,
            // patients: [],
            selectedPatient: null,
            search: '',
            isUnam: false,
            isSearching: false,
        }
    },
    computed: {
        ...mapState(['patients']),
    },
    methods: {
        // getPatients() {
        //     fb.patientsCollection.get()
        //     .then(querySnapshot=>{
        //         querySnapshot.forEach(doc=> {
        //             this.patients.push({ id: doc.id,  data: doc.data() });
        //         });
        //     })
        //     .catch(err=>console.log(err))
        // },
        showModal(patient) {
            this.selectedPatient = patient;
            this.isModalVisible = true;
        },
        clearModal() {
            this.isModalVisible=false;
            this.selectedPatient = null;
        },
        // searchByName() {
        //     this.isSearching = true;
        //     // console.log(lastDoc);
        //     fb.patientsCollection.where('keywords', 'array-contains', this.search.toLowerCase()).orderBy('name').startAfter(lastDoc).limit(limit).get()
        //     .then(snapshot => {
        //         let newPats = []
        //         // lastDoc = snapshot.docs[snapshot.docs.length -1];
        //         snapshot.forEach(patient => {
        //             newPats.push({
        //             // this.patients.push({
        //                 id: patient.id,
        //                 data: patient.data(),
        //             });
        //         });
        //         this.patients = newPats;
        //     })
        //     .catch(err => console.log(err))
        //     .finally(this.isSearching = false);
        // }
        ...mapActions(['getPatients']),
    },
    mounted() {
        // this.searchByName();
        if (this.patients.length === 0) {
            console.log("se llamará servicio")
            this.getPatients();
        } else {
            console.log('ya existe valor');
        }
    }
}
</script>