<template>
    <div class="show-supervisor">
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/usuarios">Inicio</router-link>
                <li><router-link to="/supervisores">Supervisores y estudiantes</router-link>
                <li class="is-active"><a href="#" aria-current="page">Datos del {{supType}}</a></li>
            </ul>
        </nav>
        <h1 class="title">Datos del {{supType}}</h1>
        <table v-if="supervisor != null" class="table is-fullwidth is-hoverable is-striped">
            <tbody>
                <tr>
                    <th>Nombre</th>
                    <td>{{fullName}}</td>
                </tr>
                <tr><th>Número de cuenta o número de trabajador o curp</th><td>{{supervisor.accountNum}}</td></tr>
                <tr><th>Tipo de usuario</th><td>{{userType}}</td></tr>
            </tbody>
        </table>
        <template v-if="userProfile.userType == 2">
            <router-link class="button is-info" :to="'/supervisores/' + supervisorId + '/editar'">Editar</router-link>
        </template>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js');

export default {
    data() {
        return {
            supervisorId: null,
            supervisor: null,
        }
    },
    methods: {
        getSupervisor() { // todo get from vuex
            fb.usersCollection.doc(this.supervisorId).get()
            .then(res=>{
                this.supervisor = res.data();
            })
            .catch(err=>console.log(err))
        },
    },
    computed: {
        supType() {
            if (this.supervisor == null) return null;
            if (this.supervisor.userType == 2) {
                return 'supervisor';
            } else {
                return 'estudiante';
            }
        },
        fullName: function () {
            return this.supervisor.name + " " + this.supervisor.lastName + " " + this.supervisor.mothersName
        },
        userProfile() {
            return this.$store.state.userProfile;
        },
        userType() { return this.supervisor.userType == 2 ? 'Supervisor' : 'Estudiante'; }
    },
    mounted() {
        this.supervisorId = this.$route.params.id;
        if (this.supervisorId) {
            this.getSupervisor();
        }
    }
}
</script>