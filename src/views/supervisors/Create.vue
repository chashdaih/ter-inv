<template>
    <div class="create-supervisor">
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
        <form>
            <ValidationObserver ref="observer" v-slot="{ passes }">
                <template v-if="!supervisorId">
                    <BInputVal rules="required|email" type="email" label="Correo electrónico" v-model="userData.email" placeholder="Correo" />
                    <BInputVal rules="required|min:6" type="password" vid="contraseña" label="Contraseña" v-model="userData.password" placeholder="Contraseña" />
                    <BInputVal rules="required|confirmed:contraseña" type="password" label="Confirmar contraseña" v-model="userData.confirmation" placeholder="Confirmar contraseña" />
                </template>
                <BInputVal rules="required" type="text" label="Nombre" v-model="supervisor.name" placeholder="Nombre" />
                <BInputVal rules="required" type="text" label="Apellido paterno" v-model="supervisor.lastName" placeholder="Apellido paterno" />
                <BInputVal rules="required" type="text" label="Apellido materno" v-model="supervisor.mothersName" placeholder="Apellido materno" />
                <BInputVal rules="required" type="text" label="Número de cuenta o número de trabajador o curp" v-model="supervisor.accountNum" placeholder="Número de cuenta o número de trabajador o curp" />
                <BSelectVal rules="required" label="Tipo de usuario" v-model="supervisor.userType">
                    <option v-for="option in userTypes" :key="option.value" :value="option.value">{{option.text}}</option>
                </BSelectVal>
                <br>
                <button v-if="!supervisorId" class="button is-info" type="submit" @click.prevent="passes(createSupervisor)" :class="{'is-loading': performingRequest}">Registrar</button>
                <div v-else class="field is-grouped">
                    <div class="control">
                        <button class="button is-info"  @click.prevent="passes(update)" :class="{'is-loading': performingRequest}">Actualizar</button>
                    </div>
                    <div class="control">
                        <toggle-status :uid="supervisorId" :disabled="supervisor.disabled" v-on:status-changed="onStatusChange"></toggle-status>
                    </div>
                </div>
            </ValidationObserver>
        </form>
        <br>
        <br>
        <div v-if="currentUser.uid=='s8R9yKP5uJQRNwp1MT8f1PfzPKr1' && supervisorId" class="control">
            <b-collapse class="card" aria-id="contentIdForA11y3" :open="false">
                <div
                    slot="trigger" 
                    slot-scope="props"
                    class="card-header"
                    role="button"
                    aria-controls="contentIdForA11y3">
                    <p class="card-header-title">Acciones administrativas</p>
                    <a class="card-header-icon">
                        <b-icon
                            :icon="props.open ? 'angle-up' : 'angle-down'">
                        </b-icon>
                    </a>
                </div>
                <div class="card-content">
                    <form>
                        <ValidationObserver v-slot="{ passes }">
                            <BInputVal rules="required|min:6" type="password" vid="newPass" label="Contraseña" v-model="newPass" placeholder="Contraseña" />
                            <BInputVal rules="required|confirmed:newPass" type="password" label="Confirmar contraseña" v-model="newPassConf" placeholder="Confirmar contraseña" />
                            <button @click.prevent="passes(updatePass)" class="button is-info" :class="{'is-loading': changingPass}">Cambiar contraseña</button>
                        </ValidationObserver>
                    </form>
                    <!-- <br>
                    <button class="button is-danger" type="button" @click.prevent="showDel">Borrar supervisor</button> -->
                </div>
            </b-collapse>

        </div>
    </div>
</template>

<script>
import { firebase, usersCollection } from '@/firebaseConfig.js';
import Swal from 'sweetalert2';
import { mapState } from 'vuex';

import { ValidationObserver } from 'vee-validate';
import BInputVal from '@/components/inputs/BInputVal.vue';
import BSelectVal from '@/components/inputs/BSelectVal.vue';
import ToggleStatus from '@/components/ToggleStatus.vue';

import { supervisor } from '@/models.js';
import { generateKeywords } from '@/utils.js';

export default {
    components: { ToggleStatus, ValidationObserver, BSelectVal, BInputVal },
    props: {
        userTypes: { type: Array, default: () => ([{ text: 'Supervisor', value: 2 }, { text: 'Estudiante', value: 1 }])},
    },
    data() {
        return {
            supervisorId: this.$route.params.id,
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
            errorsExist: false,
            //
            isDel: false,
            newPass: '',
            newPassConf: '',
            changingPass: false,
        }
    },
    computed: {
        ...mapState(['currentUser']),
    },
    methods: {
        getSupervisor() { // todo get from vuex
            usersCollection.doc(this.supervisorId).get()
            .then(res=>{
                this.supervisor = res.data();
            })
            .catch(err=>console.log(err))
        },
        createSupervisor() {
            this.performingRequest = true;
            const createUser = firebase.functions().httpsCallable('createNewUser');
            createUser({email:this.userData.email, password: this.userData.password})
            .then(res => {
                let newSupervisor = this.supervisor;
                newSupervisor.registeredBy = this.$store.state.currentUser.uid;
                newSupervisor.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                newSupervisor.keywords = generateKeywords([this.supervisor.name, this.supervisor.lastName, this.supervisor.mothersName]);
                return usersCollection.doc(res.data.uid).set(newSupervisor)
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
            this.supervisor.keywords = generateKeywords([this.supervisor.name, this.supervisor.lastName, this.supervisor.mothersName]);
            usersCollection.doc(this.supervisorId).update(this.supervisor)
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
        },
        showDel() {
            this.isDel = true;
        },
        updatePass(){
            this.changingPass = true;
            const changePassword = firebase.functions().httpsCallable('changePassword');
            changePassword({
                uid: this.supervisorId,
                password: this.newPass,
            })
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'La contraseña se actualizó exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    // onClose: () => this.$router.push('/usuarios')
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
            .finally(()=>this.changingPass=false)
        }
    },
    mounted() {
        // this.supervisorId = this.$route.params.id;
        if (this.supervisorId) {
            this.getSupervisor();
        }
    }
}
</script>