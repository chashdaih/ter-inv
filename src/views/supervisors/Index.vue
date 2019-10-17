<template>
    <div class="supervisors">
        <h1 class="title">Supervisores</h1>
        <router-link :to="{ name: 'signup' }" class="button is-success">Registrar supervisor</router-link>
        <br>
        <br>
        <div class="field">
            <label class="label">Filtrar por nombres</label>
            <div class="control">
                <input type="text" class="input" placeholder="Buscar" v-model="search" @keyup="getSupervisors(search)" />
            </div>
        </div>
        <b-table :data="supervisors" :loading="gettingSupervisors" >
            <template slot-scope="props">
                <b-table-column field="data.name" label="Nombre" sortable>{{ props.row.data.name }}</b-table-column>
                <b-table-column field="data.lastName" label="Apellido paterno" sortable>{{ props.row.data.lastName }}</b-table-column>
                <b-table-column field="data.mothersName" label="Apellido materno" sortable>{{ props.row.data.mothersName }}</b-table-column>
                <b-table-column field="data.userType" label="Tipo de usuario" sortable>{{ props.row.data.userType == 2 ? 'Supervisor' : 'Estudiante' }}</b-table-column>
                <b-table-column label="Cantidad de usuarios referidos" sortable>{{ props.row.data.refsTimes || '0' }}</b-table-column>
                <b-table-column field="data.disabled" label="Estatus" sortable>{{ props.row.data.disabled ? 'Deshabilitado': 'Habilitado' }}</b-table-column>
                <b-table-column field="id" label="Datos del supervisor o estudiante" >
                    <router-link :to="'/supervisores/' +  props.row.id" class="button">Ver</router-link>
                </b-table-column>
            </template>
        </b-table>
        <p v-if="!gettingSupervisors && supervisors.length == 0">No hay supervisores ni estudiantes registrados</p>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js');

export default {
    data() {
        return {
            gettingSupervisors: true,
            supervisors: [],
            search: '',
        }
    },
    methods: {
        getSupervisors() {
            this.gettingSupervisors = true;
            fb.usersCollection.where('userType', '<', 3).where('keywords', 'array-contains', this.search.toLowerCase()).limit(10).get()
            .then(docs=>{
                this.supervisors = [];
                docs.forEach(doc=> {
                    this.supervisors.push({ id: doc.id,  data: doc.data() });
                });
            })
            .catch(err=>console.log(err)) // todo poner un banner de error
            .finally(this.gettingSupervisors = false);
        },
    },
    mounted() {
        this.getSupervisors();
    },
}
</script>