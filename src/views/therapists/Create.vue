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
        <ValidationObserver ref="observer" v-slot="{ passes }">
            <form class="form">
                <div v-if="!therapistId">
                    <BInputVal rules="required|email" type="email" label="Correo electrónico" v-model="userData.email" placeholder="Correo" />
                    <BInputVal rules="required|min:6" type="password" vid="contraseña" label="Contraseña" v-model="userData.password" placeholder="Contraseña" />
                    <BInputVal rules="required|confirmed:contraseña" type="password" label="Confirmar contraseña" v-model="userData.confirmation" placeholder="Confirmar contraseña" />
                </div>
                <BInputVal rules="required" type="text" label="Nombre" v-model="therapist.name" placeholder="Nombre" />
                <BInputVal rules="required" type="text" label="Apellido paterno" v-model="therapist.lastName" placeholder="Apellido paterno" />
                <BInputVal rules="required" type="text" label="Apellido materno" v-model="therapist.mothersName" placeholder="Apellido materno" />
                <BInputVal rules="required" type="text" label="Teléfono 1" v-model="therapist.phone1" placeholder="Teléfono 1" />
                <div class="field">
                    <label class="label">Teléfono 2 (opcional)</label>
                    <div class="control">
                        <input v-model="therapist.phone2" class="input" type="text" placeholder="Teléfono 2 (opcional)">
                    </div>
                </div>
                <BInputVal rules="required" type="text" label="Dirección del consultorio" v-model="therapist.officeAddress" placeholder="Dirección del consultorio" />
                <BSelectVal rules="required" label="Estado donde se encuentra el consultorio" v-model="therapist.estado" @change="changeAlMun">
                    <option v-for="(zona, i) in zonas" :key="i"  :value="zona.value">{{zona.text}}</option>
                </BSelectVal>
                <BSelectVal v-if="therapist.estado=='CDMX'" rules="required" label="Alcaldía" v-model="therapist.officeAlcaldia">
                    <option v-for="(al, idx) in alcaldias" :key="idx" :value="al">{{al}}</option>
                </BSelectVal>
                <BSelectVal v-else-if="therapist.estado=='edoMex'" rules="required" label="Municipio" v-model="therapist.officeMunicipio">
                    <option v-for="(mun, idx) in municipios" :key="idx" :value="mun">{{mun}}</option>
                </BSelectVal>
                <div class="field">
                    <label class="label">Horarios de atención</label>
                    <div class="control">
                        <input v-model="therapist.officeHours" class="input" type="text" placeholder="Horarios de atención">
                    </div>
                </div>
                <div class="field">
                    <label class="label">Cupo máximo</label>
                    <div class="control">
                        <input type="number" class="input" placeholder="Cupo máximo (número)" v-model.number="therapist.maxCap" required min="1">
                    </div>
                </div>
                <div class="field">
                    <label class="checkbox"><input type="checkbox" v-model="therapist.colPatients" > Atiende usuarios colaborativos</label>
                </div>
                <div class="field">
                    <label class="checkbox"><input type="checkbox" v-model="therapist.refPatients" > Atiende usuarios referenciados</label>
                </div>
                <div class="field">
                    <label class="label">Especificaciones (opcional)</label>
                    <div class="control">
                        <input v-model="therapist.specs" class="input" type="text" placeholder="Especificaciones (opcional)">
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

                <b-button v-if="!therapistId" type="is-info" @click.prevent="passes(registerTherapist)" :loading="performingRequest" >Registrar</b-button>
                <div v-else class="field is-grouped">
                    <div class="control">
                        <button class="button is-info" :class="{'is-loading': performingRequest}" @click.prevent="passes(update)"> Actualizar</button>
                    </div>
                    <div class="control">
                        <toggle-status :uid="therapistId" :disabled="therapist.disabled" v-on:status-changed="onStatusChange"></toggle-status>
                    </div>
                </div>
            </form>
        </ValidationObserver>
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import { problems, alcaldias, municipios, patientTypes, askedAttentions, askedTypes, zonas } from '@/constants.js';
import ToggleStatus from '@/components/ToggleStatus.vue';
import { firebase, usersCollection } from '@/firebaseConfig.js';
import {generateKeywords} from '@/utils.js';
import { therapist } from '@/models.js';
import { ValidationObserver } from 'vee-validate';
import BInputVal from '@/components/inputs/BInputVal'
import BSelectVal from '@/components/inputs/BSelectVal'

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

export default {
    components: {
        ValidationObserver,
        BInputVal,
        BSelectVal,
        ToggleStatus,
    },
    props: {
        alcaldias: { type: Array,  default: () => (alcaldias), },
        municipios: { type: Array,  default: () => (municipios), },
        symptomsList: { type: Array, default: () => (problems), },
        patientTypes: { type: Array, default: () =>(patientTypes) },
        askedAttentions: { type: Array, default: () =>(askedAttentions) },
        askedTypes: { type: Array, default: () =>(askedTypes) },
        zonas: { type: Array, default: () => (zonas), },
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
            therapist, // import from models
        }
    },
    methods: {
        registerTherapist() {
            this.performingRequest = true;
            let newTherapist = this.therapist;
            newTherapist.userType = 3;
            newTherapist.registeredBy = this.currentUser.uid;
            newTherapist.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            newTherapist.keywords = generateKeywords([this.therapist.name, this.therapist.lastName, this.therapist.mothersName]);
            const createUser = firebase.functions().httpsCallable('createNewUser');
            createUser({email:this.userData.email, password: this.userData.password})
            .then(res => {
                return usersCollection.doc(res.data.uid).set(this.therapist)
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
            usersCollection.doc(this.therapistId).get()
            .then(res=>{
                this.therapist = res.data();
                if (!this.therapist.attentionType) {
                    this.therapist.attentionType = {};
                }
            })
            .catch(err=>console.log(err))
        },
        changeAlMun() {
            console.log("cah")
            if (this.therapist.estado == "edoMex") { // todo revisar misterio
                this.therapist.officeMunicipio = null;
                this.therapist.officeAlcaldia = alcaldias[0];
            } else if (this.therapist.estado == 'CDMX') {
                this.therapist.officeMunicipio = municipios[0];
                this.therapist.officeAlcaldia = null;
            }
        },
        update() {
            this.performingRequest = true;
            this.therapist.keywords = generateKeywords([this.therapist.name, this.therapist.lastName, this.therapist.mothersName]);
            usersCollection.doc(this.therapistId).update(this.therapist)
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El terapeuta se actualizó exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    // onClose: () => this.$router.push('/terapeutas')
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