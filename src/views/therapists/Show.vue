<template>
    <div class="show-therapist">
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/">Inicio</router-link></li>
                <li><router-link to="/terapeutas">Terapeutas</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">{{fullName}}</a></li>
            </ul>
        </nav>
        <h1 class="title">Datos del terapeuta invitado</h1>
        <table v-if="therapist != null" class="table is-fullwidth is-hoverable is-striped">
            <tbody>
                <tr><th>Nombre</th><td>{{fullName}}</td></tr>
                <tr v-if="therapist.phone1 != ''"><th>Teléfono 1</th><td>{{therapist.phone1}}</td></tr>
                <tr v-if="therapist.phone2 != ''"><th>Teléfono 2</th><td>{{therapist.phone2}}</td></tr>
                <tr><th>Dirección del consultorio</th><td>{{therapist.officeAddress}}, {{therapist.officeAlcaldia}}</td></tr>
                <tr><th>Horario de atención</th><td>{{therapist.officeHours}}</td></tr>
                <tr><th>Especificaciones</th><td>{{therapist.specs}}</td></tr>
                <tr><th>Capacidad de usuarios máxima</th><td>{{therapist.maxCap}}</td></tr>
                <tr><th>Población que atiende</th><td>{{target}}</td></tr>
                <tr><th>Orientación</th><td>{{orientation || 'Niguna especificada'}}</td></tr>
                <!-- <tr><th>Número de usuarios activos</th><td>todo</td></tr> -->
                <tr><th>Problemáticas atendidas</th><td>{{catalog}}</td></tr>
                <tr><th>Tipo de servicio</th><td>{{serviceType}}</td></tr>
            </tbody>
        </table>
        <router-link v-if="userProfile.userType < 3" class="button is-info" :to="'/terapeutas/' + therId + '/editar'">Editar</router-link>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js');

export default {
    data() {
        return {
            therId: null,
            therapist: null,
        }
    },
    methods: {
        getTherapist() {
            fb.usersCollection.doc(this.therId).get()
            .then(res=>{
                this.therapist = res.data();
            })
            .catch(err=>console.log(err))
        }
    },
    computed: {
        fullName: function () {
            if (!this.therapist) return null;
            return this.therapist.name + " " + this.therapist.lastName + " " + this.therapist.mothersName
        },
        target() { // todo: solo guardar las keys si son true para eliminar la comparación y hacer más fácil la lectura en la base de datos
            let tar = '';
            Object.keys(this.therapist.target).map((key)=>{
                if (this.therapist.target[key]) {
                    tar += `${key}, `;
                }
            })
            return tar;
        },
        orientation(){
            let or = '';
            Object.keys(this.therapist.orientation).map((key)=>{
                if (this.therapist.orientation[key]) {
                    or += `${key}, `;
                }
            })
            return or;
        },
        catalog() {
            let cat = '';
            Object.keys(this.therapist.symptoms).map((key)=>{
                if (this.therapist.symptoms[key]) {
                    cat += `${key}, `;
                }
            })
            return cat;
        },
        serviceType(){
            let ser = '';
            Object.keys(this.therapist.attentionType).map((key)=>{
                if (this.therapist.attentionType[key]) {
                    ser += `${key}, `;
                }
            })
            return ser;
        },
        userProfile() {
            return this.$store.state.userProfile;
        },
    },
    mounted() {
        this.therId = this.$route.params.id;
        this.getTherapist();
    }
    
}
</script>