<template>
    <div class="register-therapist">
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/">Inicio</router-link></li>
                <li><router-link to="/terapeutas">Terapeutas</router-link></li>
                <li v-if="!therapistId" class="is-active"><a href="#" aria-current="page">Registrar nuevo terapeuta invitado</a></li>
                <template v-else>
                <li><router-link :to="'/terapeutas/' + therapistId">{{fullName}}</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">Actualizar información</a></li>
                </template>
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
                <label class="label">Estado donde se encuentra el consultorio</label>
                <div class="control">
                    <div class="select">
                        <select v-model="therapist.estado" @change="changeAlMun">
                            <option value="CDMX">CDMX</option>
                            <option value="edoMex">Estado de México</option>
                        </select>
                    </div>
                </div>
            </div>
            <div v-if="therapist.estado=='CDMX'" class="field">
                <label class="label">Alcaldía del consultorio</label>
                <div class="control">
                    <div class="select">
                        <select v-model="therapist.officeAlcaldia">
                            <option v-for="(al, idx) in alcaldias" :key="idx" :value="al">{{al}}</option>
                        </select>
                    </div>
                </div>
            </div>
            <div v-else class="field">
                <label class="label">Municipio del consultorio</label>
                <div class="control">
                    <div class="select">
                        <select v-model="therapist.officeMunicipio">
                            <option v-for="(mun, idx) in municipios" :key="idx" :value="mun">{{mun}}</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="field">
                <label class="label">Horarios de atención</label>
                <div class="control">
                    <input v-model="therapist.officeHours" class="input" type="text" placeholder="Horarios de atención">
                </div>
            </div>
            <div class="field">
                <label class="label">Cupo máximo</label>
                <div class="control">
                    <input type="number" class="input" placeholder="Cupo máximo (número)" v-model="therapist.maxCap" required min="1">
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
                <div v-for="(type, idx) in patientTypes" :key="idx" class="control">
                    <label class="checkbox">
                        <input v-model="therapist.target[type]" type="checkbox" > {{type}}
                    </label>
                </div>
            </div>
            <div class="field">
                <label class="label">Tipo de atención</label>
                <div v-for="(type, idx) in askedAttentions" :key="idx" class="control">
                    <label class="checkbox">
                        <input v-model="therapist.attentionType[type]" type="checkbox" > {{type}}
                    </label>
                </div>
            </div>
            <div class="field">
                <label class="label">Orientación</label>
                <div v-for="(or, idx) in askedTypes" :key="idx" class="control">
                    <label class="checkbox">
                        <input v-model="therapist.orientation[or]" type="checkbox" > {{or}}
                    </label>
                </div>
            </div>
            <br>
            <div class="field">
                <label class="label">Problemáticas que se atienden</label>
                <div class="control" v-for="(cat,idx) in symptomsList" :key="idx">
                    <label class="checkbox"><input type="checkbox" v-model="therapist.symptoms[cat]"> {{cat}}</label>
                </div>
            </div>

            <b-button v-if="!therapistId" type="is-info" @click="registerTherapist" :loading="performingRequest" >Registrar</b-button>
            <div v-else class="field is-grouped">
                <div class="control">
                    <button class="button is-info" :class="{'is-loading': performingRequest}" @click="update"> Actualizar</button>
                </div>
                <div class="control">
                    <toggle-status :uid="therapistId" :disabled="therapist.disabled" v-on:status-changed="onStatusChange"></toggle-status>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import { problems, alcaldias, municipios, patientTypes, askedAttentions, askedTypes } from '@/constants.js';
import ToggleStatus from '@/components/ToggleStatus.vue';
const fb = require('@/firebaseConfig.js');
import {generateKeywords} from '@/utils.js';
import { therapist } from '@/models.js';

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

export default {
    components: { ToggleStatus, },
    props: {
        alcaldias: { type: Array,  default: () => (alcaldias), },
        municipios: { type: Array,  default: () => (municipios), },
        symptomsList: { type: Array, default: () => (problems), },
        patientTypes: { type: Array, default: () =>(patientTypes) },
        askedAttentions: { type: Array, default: () =>(askedAttentions) },
        askedTypes: { type: Array, default: () =>(askedTypes) },
    },
    data() {
        return {
            therapistId: null,
            performingRequest:false,
            userData: {
                email: '',
                password: '',
                confirmation: '',
            },
            // therapist: {
            //     name: '',
            //     lastName: '',
            //     mothersName: '',
            //     phone1: '',
            //     phone2: '',
            //     officeAddress: '',
            //     estado: 'CDMX',
            //     officeAlcaldia: alcaldias[0],
            //     officeMunicipio: null,
            //     officeHours: '',
            //     maxCap: null,
            //     specs: '',
            //     target: {},
            //     attentionType: {},
            //     orientation: {},
            //     patientsLimit: null,
            //     symptoms: {},
            // },
            therapist,
        }
    },
    methods: {
        registerTherapist() {
            this.performingRequest = true;
            let newTherapist = this.therapist;
            newTherapist.userType = 3;
            newTherapist.registeredBy = this.currentUser.uid;
            newTherapist.createdAt = fb.firebase.firestore.FieldValue.serverTimestamp();
            newTherapist.keywords = generateKeywords([this.therapist.name, this.therapist.lastName, this.therapist.mothersName]);
            const createUser = fb.firebase.functions().httpsCallable('createNewUser');
            createUser({email:this.userData.email, password: this.userData.password})
            .then(res => {
                return fb.usersCollection.doc(res.data.uid).set(this.therapist)
            })
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El terapeuta se registró exitosamente',
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
        },
        getTherapist() {
            fb.usersCollection.doc(this.therapistId).get()
            .then(res=>{
                this.therapist = res.data();
            })
            .catch(err=>console.log(err))
        },
        changeAlMun() {
            if (this.therapist.estado == "CDMX") {
                this.therapist.officeMunicipio = null;
                this.therapist.officeAlcaldia = alcaldias[0];
            } else {
                this.therapist.officeMunicipio = municipios[0];
                this.therapist.officeAlcaldia = null;
            }
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
        },
        onStatusChange(data) {
            this.therapist.disabled = data;
        }
    },
    computed: {
        fullName: function () {
            if (!this.therapistId) return null;
            return this.therapist.name + " " + this.therapist.lastName + " " + this.therapist.mothersName
        },
        currentUser() {
            return this.$store.state.currentUser;
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