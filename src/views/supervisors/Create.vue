<template>
    <div class="signup">
        <!-- <b-notification :active.sync="errorsExist" type="is-danger" aria-close-label="Close notification" >
            {{  }}
        </b-notification> -->
        <nav class="breadcrumb">
            <ul>
                <li><a href="#">Inicio</a></li>
                <li><a href="#">Supervisores y estudiantes</a></li>
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
                        <option value=2>Supervisor</option>
                        <option value=1>Estudiante</option>
                    </select>
                    </div>
                </div>
            </div>
            <button v-if="!supervisorId" class="button is-info"  @click.prevent="signup" :loading="performingRequest">Registrar</button>
            <button v-else class="button is-info"  @click.prevent="update" :loading="performingRequest">Actualizar</button>
        </form>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js')
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            supervisorId: null,
            existingSup: null,
            userData:{
                email: '',
                password: '',
                confirmation: '',
            },
            supervisor: {
                name: '',
                lastName: '',
                mothersName: '',
                userType: 2,
                accountNum: ''
            },
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
        signup() {
            this.performingRequest = true;
            fb.auth.createUserWithEmailAndPassword(this.userData.email, this.userData.password).then(res => {
                return fb.usersCollection.doc(res.user.uid).set(this.supervisor)
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