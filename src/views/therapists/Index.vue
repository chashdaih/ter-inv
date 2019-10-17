<template>
    <div class="therapists">
        <h1 class="title">Terapeutas Invitados</h1>
        <router-link to="/terapeutas/registrar-terapeuta" class="button is-success">Registrar nuevo terapeuta invitado</router-link>
        <br>
        <br>
        <div class="field">
            <label class="label">Filtrar por nombres</label>
            <div class="control">
                <input type="text" class="input" placeholder="Buscar" v-model="search" @keyup="getTherapists(search)" />
            </div>
        </div>
        <!-- TODO filters -->
        <b-table :data="therapists" :loading="gettingTherapists" >
            <template slot-scope="props">
                <b-table-column field="data.name" label="Nombre" sortable>{{ props.row.data.name }}</b-table-column>
                <b-table-column field="data.lastName" label="Apellido paterno" sortable>{{ props.row.data.lastName }}</b-table-column>
                <b-table-column field="data.mothersName" label="Apellido materno" sortable>{{ props.row.data.mothersName }}</b-table-column>
                <b-table-column field="id" label="Datos del terapeuta" >
                    <router-link :to="'/terapeutas/' +  props.row.id" class="button">Ver</router-link>
                </b-table-column>
                <b-table-column field="id" label="Usuarios referidos" >
                    <router-link :to="'/terapeutas/' +  props.row.id + '/usuarios-referidos'" class="button">Ir</router-link>
                </b-table-column>
            </template>
        </b-table>
        <p v-if="!gettingTherapists && therapists.length == 0">No hay terapeutas registrados</p>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js');

export default {
    data() {
        return {
            gettingTherapists: true,
            therapists: [],
            search: '',
        }
    },
    methods: {
        getTherapists() {
            this.gettingTherapists = true;
            fb.usersCollection.where('userType', '==', 3).where('keywords', 'array-contains', this.search.toLowerCase()).limit(10).get()
            .then(docs=>{
                this.therapists = [];
                docs.forEach(doc=> {
                    this.therapists.push({ id: doc.id,  data: doc.data() });
                });
            })
            .catch(err=>console.log(err)) // todo poner un banner de error
            .finally(this.gettingTherapists = false);
        },
    },
    mounted() {
        this.getTherapists();
    },
}
</script>