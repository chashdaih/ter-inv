<template>
    <div class="create-supervisor">
        <!-- <b-notification :active.sync="errorsExist" type="is-danger" aria-close-label="Close notification" >
            {{  }}
        </b-notification> -->
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/usuarios">Inicio</router-link>
                <li><router-link to="/supervisores">Supervisores y estudiantes</router-link>
                <li v-if="!supervisorId" class="is-active"><a href="#" aria-current="page">Registrar nuevo supervisor o estudiante</a></li>
                <li v-else class="is-active"><a href="#" aria-current="page">Editar {{ supervisor.userType == 2 ? 'Supervisor':'Estudiante' }}</a></li>
            </ul>
        </nav>
        <h1 v-if="!supervisorId" class="title">Registrar nuevo supervisor o estudiante</h1>
        <h1 v-else class="title">Editar {{ supervisor.userType == 2 ? 'Supervisor':'Estudiante' }}</h1>
        <form class="form">
            <div v-if="!supervisorId">
            <div class="field">
                <label class="label">Correo electrónico</label>
                <div class="control">
                    <input v-model="userData.email" class="input" type="email" placeholder="Correo electrónico">
                </div>
            </div>
            <div class="field">
                <label class="label">Contraseña</label>
                <div class="control">
                    <input v-model="userData.password" class="input" type="password" placeholder="Contraseña">
                </div>
            </div>
            <div class="field">
                <label class="label">Confirmar contraseña</label>
                <div class="control">
                    <input v-model="userData.confirmation" class="input" type="password" placeholder="Confirmar contraseña">
                </div>
            </div>
            </div>
            <div class="field">
                <label class="label">Nombre</label>
                <div class="control">
                    <input v-model="supervisor.name" class="input" type="text" placeholder="Nombre">
                </div>
            </div>
            <div class="field">
                <label class="label">Apellido paterno</label>
                <div class="control">
                    <input v-model="supervisor.lastName" class="input" type="text" placeholder="Apellido paterno">
                </div>
            </div>
            <div class="field">
                <label class="label">Apellido materno</label>
                <div class="control">
                    <input v-model="supervisor.mothersName" class="input" type="text" placeholder="Apellido materno">
                </div>
            </div>
            <div class="field">
                <label class="label">Número de cuenta o número de trabajador o curp</label>
                <div class="control">
                    <input v-model="supervisor.accountNum" class="input" type="text" placeholder="Número de cuenta o número de trabajador o curp">
                </div>
            </div>
            <div class="field">
                <label class="label">Tipo de usuario</label>
                <div class="control">
                    <div class="select">
                    <select v-model="supervisor.userType">
                        <option v-for="option in userTypes" :key="option.value" :value="option.value">{{option.text}}</option>
                    </select>
                    </div>
                </div>
            </div>
            <button v-if="!supervisorId" class="button is-info"  @click.prevent="createSupervisor" :loading="performingRequest">Registrar</button>
            <div v-else class="field is-grouped">
                <div class="control">
                    <button class="button is-info"  @click.prevent="update" :loading="performingRequest">Actualizar</button>
                </div>
                <div class="control">
                    <toggle-status :uid="supervisorId" :disabled="supervisor.disabled" v-on:status-changed="onStatusChange"></toggle-status>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js')
import Swal from 'sweetalert2';

import ToggleStatus from '@/components/ToggleStatus.vue';

import { supervisor } from '@/models.js';

export default {
    components: { ToggleStatus, },
    props: {
        userTypes: { type: Array, default: () => ([{ text: 'Supervisor', value: 2 }, { text: 'Estudiante', value: 1 }])},
    },
    data() {
        return {
            supervisorId: null,
            existingSup: null,
            authData: null,
            userData:{
                email: '',
                password: '',
                confirmation: '',
            },
            // supervisor: {
            //     name: '',
            //     lastName: '',
            //     mothersName: '',
            //     userType: 2,
            //     accountNum: ''
            // },
            supervisor,
            performingRequest: false,
            fbErrors: {},
            errorsExist: false
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
        createSupervisor() {
            this.performingRequest = true;
            const createUser = fb.firebase.functions().httpsCallable('createNewUser');
            createUser({email:this.userData.email, password: this.userData.password})
            .then(res => {
                return fb.usersCollection.doc(res.data.uid).set(this.supervisor)
            })
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El supervisor se registró exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => this.$router.push('/supervisores')
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
            .finally(()=>this.performingRequest=false)
        },
        update() {
            this.performingRequest = true;
            fb.usersCollection.doc(this.supervisorId).update(this.supervisor)
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El supervisor se actualizó exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => this.$router.push('/supervisores')
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
            .finally(()=>this.performingRequest=false)
        },
        onStatusChange(data) {
            this.supervisor.disabled = data;
        }
    },
    mounted() {
        this.supervisorId = this.$route.params.id;
        if (this.supervisorId) {
            this.getSupervisor();
        }
    }
}
</script>