<template>
    <div class="my-data">
        <h1 class="title">Editar mis datos</h1>
        <div class="notification is-danger" v-if="errors != null">
            <button class="delete" @click="errors = null"></button>
            <ul>
                <li v-for="(error, idx) in errors" :key="idx">{{error}}</li>
            </ul>
        </div>
        <div class="box">
            <h2 class="subtitle">Cambiar correo electrónico</h2>
            <div class="field">
                <label class="label">Nuevo correo (para iniciar sesión y recibir notificaciones)</label>
                <div class="control">
                    <input v-model="newEmail" type="email" class="input" placeholder="Nuevo correo">
                </div>
            </div>
            <a @click="updateEmail" class="button is-info" :class="{'is-loading':changingMail}">Cambiar</a>
        </div>
        <div class="box">
            <h2 class="subtitle">Cambiar contraseña</h2>
            <div class="field">
                <label class="label">Nueva contraseña</label>
                <div class="control">
                    <input v-model="newPass" type="password" class="input" placeholder="Nueva contraseña">
                </div>
            </div>
            <div class="field">
                <label class="label">Confirmar nueva contraseña</label>
                <div class="control">
                    <input v-model="passConfirmation" type="password" class="input" placeholder="Nueva contraseña">
                </div>
            </div>
            <a @click="updatePassword" class="button is-info" :class="{'is-loading':changingPass}">Cambiar</a>
        </div>
        <div class="box">
            <h2 class="subtitle">Datos personales</h2>
            <div class="field">
                <label class="label">Nombre</label>
                <div class="control">
                    <input v-model.trim="profile.name" class="input" type="text" placeholder="Nombre">
                </div>
            </div>
            <div class="field">
                <label class="label">Apellido paterno</label>
                <div class="control">
                    <input v-model.trim="profile.lastName" class="input" type="text" placeholder="Apellido paterno">
                </div>
            </div>
            <div class="field">
                <label class="label">Apellido materno</label>
                <div class="control">
                    <input v-model.trim="profile.mothersName" class="input" type="text" placeholder="Apellido materno">
                </div>
            </div>
            <template v-if="profile.userType < 3">
            <div class="field">
                <label class="label">Número de cuenta o número de trabajador o curp</label>
                <div class="control">
                    <input v-model.trim="profile.accountNum" class="input" type="text" placeholder="Número de cuenta o número de trabajador o curp">
                </div>
            </div>
            <div class="field">
                <label class="label">Tipo de usuario</label>
                <div class="control">
                    <div class="select">
                    <select v-model="profile.userType">
                        <option v-for="option in userTypes" :key="option.value" :value="option.value">{{option.text}}</option>
                    </select>
                    </div>
                </div>
            </div>
            </template>

            <template v-else>
            <div class="field">
                <label class="label">Teléfono 1</label>
                <div class="control">
                    <input v-model.trim="profile.phone1" class="input" type="text" placeholder="Teléfono 1">
                </div>
            </div>
            <div class="field">
                <label class="label">Teléfono 2</label>
                <div class="control">
                    <input v-model.trim="profile.phone2" class="input" type="text" placeholder="Teléfono 2">
                </div>
            </div>
            <div class="field">
                <label class="label">Dirección del consultorio</label>
                <div class="control">
                    <input v-model.trim="profile.officeAddress" class="input" type="text" placeholder="Dirección del consultorio">
                </div>
            </div>
            <div class="field">
                <label class="label">Estado donde se encuentra el consultorio</label>
                <div class="control">
                    <div class="select">
                        <select v-model="profile.estado" @change="changeAlMun">
                            <option value="CDMX">CDMX</option>
                            <option value="edoMex">Estado de México</option>
                        </select>
                    </div>
                </div>
            </div>
            <div v-if="profile.estado=='CDMX'" class="field">
                <label class="label">Alcaldía del consultorio</label>
                <div class="control">
                    <div class="select">
                        <select v-model="profile.officeAlcaldia">
                            <option v-for="(al, idx) in alcaldias" :key="idx" :value="al">{{al}}</option>
                        </select>
                    </div>
                </div>
            </div>
            <div v-else class="field">
                <label class="label">Municipio del consultorio</label>
                <div class="control">
                    <div class="select">
                        <select v-model="profile.officeMunicipio">
                            <option v-for="(mun, idx) in municipios" :key="idx" :value="mun">{{mun}}</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="field">
                <label class="label">Horarios de atención</label>
                <div class="control">
                    <input v-model.trim="profile.officeHours" class="input" type="text" placeholder="Horarios de atención">
                </div>
            </div>
            <div class="field">
                <label class="label">Cupo máximo</label>
                <div class="control">
                    <input type="number" class="input" placeholder="Cupo máximo (número)" v-model.number="profile.maxCap" required min="1">
                </div>
            </div>
            <div class="field">
                <label class="label">Especificaciones</label>
                <div class="control">
                    <input v-model.trim="profile.specs" class="input" type="text" placeholder="Especificaciones">
                </div>
            </div>
            <div v-if="profile.target" class="field">
                <label class="label">Población que atiende</label>
                <div v-for="(type, idx) in patientTypes" :key="idx" class="control">
                    <label class="checkbox">
                        <input v-model="profile.target[type]" type="checkbox" > {{type}}
                    </label>
                </div>
            </div>
            <div class="field">
                <label class="label">Tipo de atención</label>
                <div v-for="(type, idx) in askedAttentions" :key="idx" class="control">
                    <label class="checkbox" v-if="profile.attentionType">
                        <input v-model="profile.attentionType[type]" type="checkbox" > {{type}}
                    </label>
                </div>
            </div>
            <div v-if="profile.orientation" class="field">
                <label class="label">Orientación</label>
                <div v-for="(or, idx) in askedTypes" :key="idx" class="control">
                    <label class="checkbox">
                        <input v-model="profile.orientation[or]" type="checkbox" > {{or}}
                    </label>
                </div>
            </div>
            <br>
            <div v-if="profile.symptoms" class="field">
                <label class="label">Problemáticas que se atienden</label>
                <div class="control" v-for="(cat,idx) in symptomsList" :key="idx">
                    <label class="checkbox"><input type="checkbox" v-model="profile.symptoms[cat]"> {{cat}}</label>
                </div>
            </div>
            </template>
            <a @click="updatePersonalData" class="button is-info" :class="{'is-loading': changingData}">Actualizar</a>
        </div>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js');
import {generateKeywords} from '@/utils.js';
import { problems, alcaldias, municipios, patientTypes, askedAttentions, askedTypes } from '@/constants.js';
import Swal from 'sweetalert2';

export default {
    props: {
        userTypes: { type: Array, default: () => ([{ text: 'Supervisor', value: 2 }, { text: 'Estudiante', value: 1 }])},
        alcaldias: { type: Array,  default: () => (alcaldias), },
        municipios: { type: Array,  default: () => (municipios), },
        symptomsList: { type: Array, default: () => (problems), },
        patientTypes: { type: Array, default: () =>(patientTypes) },
        askedAttentions: { type: Array, default: () =>(askedAttentions) },
        askedTypes: { type: Array, default: () =>(askedTypes) },
    },
    data() {
        return {
            newPass: '',
            passConfirmation: '',
            errors: null,
            changingPass: false,
            newEmail: '',
            changingMail: false,
            changingData: false,
        }
    },
    computed: {
        user() {
            return this.$store.state.currentUser;
        },
        profile() {
            return this.$store.state.userProfile;
        }
    },
    methods: {
        updatePassword() {
            if (this.newPass != this.passConfirmation) {
                this.errors = ['Las contraseñas no coinciden.'];
                return;
            }
            if (this.newPass.length < 6) {
                this.errors = ['La contraseña debe tener al menos 6 caracteres.'];
                return;
            }
            this.changingPass = true;
            this.user.updatePassword(this.newPass)
            .then(()=>{
                this.newPass = '';
                this.passConfirmation = '';
                Swal.fire({
                    title: 'Éxito',
                    text: 'La contraseña se cambió exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
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
        },
        updateEmail() {
            this.changingMail = true;
            this.user.updateEmail(this.newEmail)
            .then(()=>{
                this.newEmail = '';
                Swal.fire({
                    title: 'Éxito',
                    text: 'El correo se cambió exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
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
            .finally(()=>this.changingMail=false)
        },
        updatePersonalData() {
            this.changingData = true;
            this.profile.keywords = generateKeywords([this.profile.name, this.profile.lastName, this.profile.mothersName]);
            fb.usersCollection.doc(this.user.uid).update(this.profile)
            .then(()=>{
                this.$store.commit('setUserProfile', this.profile);
                Swal.fire({
                    title: 'Éxito',
                    text: 'La información se actualizó exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
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
            .finally(()=>this.changingData=false)
        },
        changeAlMun() {
            if (this.profile.estado == "CDMX") {
                this.profile.officeMunicipio = null;
                this.profile.officeAlcaldia = alcaldias[0];
            } else {
                this.profile.officeMunicipio = municipios[0];
                this.profile.officeAlcaldia = null;
            }
        },
    },
}
</script>