<template>
    <div class="register-therapist">
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/">Inicio</router-link></li>
                <li><router-link to="/terapeutas">Terapeutas</router-link></li>
                <li v-if="!therapistId" class="is-active"><a href="#" aria-current="page">Registrar nuevo terapeuta invitado</a></li>
                <li v-else class="is-active"><a href="#" aria-current="page">Actualizar terapeuta invitado</a></li>
            </ul>
        </nav>
        <h1 v-if="!therapistId" class="title">Registrar nuevo terapeuta invitado</h1>
        <h1 v-else class="title">Actualizar terapeuta invitado</h1>
        <form class="form">
            <div v-if="!therapistId">
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
                    <input v-model="therapist.name" class="input" type="text" placeholder="Nombre">
                </div>
            </div>
            <div class="field">
                <label class="label">Apellido paterno</label>
                <div class="control">
                    <input v-model="therapist.lastName" class="input" type="text" placeholder="Apellido paterno">
                </div>
            </div>
            <div class="field">
                <label class="label">Apellido materno</label>
                <div class="control">
                    <input v-model="therapist.mothersName" class="input" type="text" placeholder="Apellido materno">
                </div>
            </div>
            <div class="field">
                <label class="label">Teléfono 1</label>
                <div class="control">
                    <input v-model="therapist.phone1" class="input" type="text" placeholder="Teléfono 1">
                </div>
            </div>
            <div class="field">
                <label class="label">Teléfono 2</label>
                <div class="control">
                    <input v-model="therapist.phone2" class="input" type="text" placeholder="Teléfono 2">
                </div>
            </div>
            <div class="field">
                <label class="label">Dirección del consultorio</label>
                <div class="control">
                    <input v-model="therapist.officeAddress" class="input" type="text" placeholder="Dirección del consultorio">
                </div>
            </div>
            <div class="field">
                <label class="label">Alcaldía del consultorio</label>
                <div class="control">
                    <input v-model="therapist.officeAlcaldia" class="input" type="text" placeholder="Alcaldía del consultorio">
                </div>
            </div>
            <div class="field">
                <label class="label">Horarios de atención</label>
                <div class="control">
                    <table class="table is-fullwidth">
                        <thead>
                            <tr>
                                <th>Días</th>
                                <th v-for="(time, x) in times" :key="x">{{time}} - {{time+1}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(day,idx) in days" :key="idx">
                                <td>{{day}}</td>
                                <td v-for="(time, x) in times" :key="x">
                                    <input type="checkbox" v-model="therapist.officeHours[day+time]">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="field">
                <label class="label">Especificaciones</label>
                <div class="control">
                    <input v-model="therapist.specs" class="input" type="text" placeholder="Especificaciones">
                </div>
            </div>
            <div class="field">
                <label class="label">Población que atiende</label>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.niños" type="checkbox" > Niños
                    </label>
                </div>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.adolescentes" type="checkbox" > Adolescentes
                    </label>
                </div>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.adultos" type="checkbox" > Adultos
                    </label>
                </div>
            </div>
            <div class="field">
                <label class="label">Tipo de atención</label>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.individual" type="checkbox" > Individual
                    </label>
                </div>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.pareja" type="checkbox" > Pareja
                    </label>
                </div>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.familiar" type="checkbox" > Familiar
                    </label>
                </div>
            </div>
            <div class="field">
                <label class="label">Orientación</label>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.cognitivo" type="checkbox" > Cognitivo - conductual
                    </label>
                </div>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.psicodinamica" type="checkbox" > Psicodinámica
                    </label>
                </div>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.psicoanalista" type="checkbox" > Psicoanalista
                    </label>
                </div>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.sistematica" type="checkbox" > Sistémica
                    </label>
                </div>
                <div class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target.gestalt" type="checkbox" > Gestalt
                    </label>
                </div>
            </div>
            <br>
            <div class="field">
                <label class="label">Problemáticas que se atienden</label>
                <div class="control" v-for="(cat,idx) in problems" :key="idx">
                    <label class="checkbox"><input type="checkbox" v-model="therapist.catalog[cat.toLowerCase().split(' ').join('')]"> {{cat}}</label>
                </div>
            </div>

            <b-button v-if="!therapistId" type="is-info" @click="registerTherapist" :loading="performingRequest" >Registrar</b-button>
            <a v-else class="button is-info" :class="{'is-loading': performingRequest}" @click="update"> Actualizar</a>
        </form>
    </div>
</template>

<script>
import Swal from 'sweetalert2';

import { problems } from '@/constants.js';
const fb = require('@/firebaseConfig.js');

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}
export default {
    data() {
        const target = {
            niños: false,
            adolescentes:false, 
            adultos:false
        };

        const orientation = {
            cognitivo: false,
            psicodinamica: false,
            psicoanalista: false,
            sistematica: false,
            gestalt: false
        };

        const assistanceType = {
            individual: false,
            pareja: false,
            familiar: false
        };

        const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const times = range(13, 7);
        let officeHours = {};
        for (let day = 0; day < days.length - 1; day++) {
            times.forEach(time=>officeHours[days[day] + time] = false)
        }

        let catalog = {};
        for (let problem of problems) {
            catalog[problem.toLowerCase().split(' ').join('')] = false;
        }
        return {
            therapistId: null,
            performingRequest:false,
            days,
            times,
            problems,
            userData: {
                email: '',
                password: '',
                confirmation: '',
            },
            therapist: {
                name: '',
                lastName: '',
                mothersName: '',
                phone1: '',
                phone2: '',
                officeAddress: '',
                officeAlcaldia: '', // todo: catalogo
                officeHours,
                specs: '',
                target,
                orientation,
                patientsLimit: 0,
                catalog,
                assistanceType,
                userType: 3, // 1 - estudiante, 2 - supervisor, 3 - terapeuta invitado 
            }
        }
    },
    methods: {
        registerTherapist() {
            this.performingRequest = true;
            fb.auth.createUserWithEmailAndPassword(this.userData.email, this.userData.password)
            .then(res => {
                // this.$store.commit('setCurrentUser', res.user)
                // create user obj
                return fb.usersCollection.doc(res.user.uid).set(this.therapist)
            })
            .then(()=>{
                // this.$store.dispatch('fetchUserProfile')
                Swal.fire({
                    title: 'Éxito',
                    text: 'El terapeuta se registró exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => this.$router.push('/terapeutas')
                });
            })
            .catch(err =>{
                // this.errorsExist = true
                // this.fbErrors = err
                console.log(err)
                Swal.fire({
                   title: 'Ocurrió un error',
                   text: err,
                   type: "error",
                   confirmButtonText: 'Aceptar' 
                });
            })
            .finally(()=>this.performingRequest=false)
        },
        getTherapist() {
            fb.usersCollection.doc(this.therapistId).get()
            .then(res=>{
                this.therapist = res.data();
            })
            .catch(err=>console.log(err))
        },
        update() {
            this.performingRequest = true;
            fb.usersCollection.doc(this.therapistId).update(this.therapist)
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El terapeuta se actualizó exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => this.$router.push('/terapeutas')
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
        this.therapistId = this.$route.params.id;
        if (this.therapistId) {
            this.getTherapist();
        }
    }
}
</script>