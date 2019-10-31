<template>
    <div class="signup">
        <!-- <b-notification :active.sync="errorsExist" type="is-danger" aria-close-label="Close notification" >
            {{ fbErrors.message }}
        </b-notification> -->
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/">Inicio</router-link></li>
                <li><router-link to="/usuarios">Usuarios</router-link></li>
                <li v-if="!patientId" class="is-active"><a href="#" aria-current="page">Registrar nuevo usuario</a></li>
                <template v-else>
                    <li><router-link :to="`/usuarios/${patientId}`">{{fullName}}</router-link></li>
                    <li class="is-active"><a href="#" aria-current="page">Editar</a></li>
                </template>
            </ul>
        </nav>
        <h1 v-if="!patientId" class="title">Registrar nuevo usuario</h1>
        <h1 v-else class="title">Actualizar usuario</h1>
        <ValidationObserver ref="observer" v-slot="{ passes }">
            <form v-if="patient">
                <BInputVal rules="required" type="text" label="Nombre" v-model="patient.name" placeholder="Nombre" />
                <BInputVal rules="required" type="text" label="Apellido paterno" v-model="patient.lastName" placeholder="Apellido paterno" />
                <BInputVal rules="required" type="text" label="Apellido materno" v-model="patient.mothersName" placeholder="Apellido materno" />
                <BInputVal rules="required" type="date" label="Fecha de nacimiento" v-model="patient.birthdate" placeholder="Fecha de nacimiento" />
                <div class="field">
                    <label class="label">Teléfono de casa (opcional)</label>
                    <div class="control">
                        <input type="text" class="input" v-model="patient.phoneHome" placeholder="Teléfono casa (opcional)" >
                    </div>
                </div>
                <div class="field">
                    <label class="label">Teléfono celular (opcional)</label>
                    <div class="control">
                        <input type="text" class="input" v-model="patient.phoneCell" placeholder="Teléfono celular (opcional)" >
                    </div>
                </div>
                <div class="field">
                    <label class="label">Teléfono de trabajo (opcional)</label>
                    <div class="control">
                        <input type="text" class="input" v-model="patient.phoneWork" placeholder="Teléfono trabajo (opcional)" >
                    </div>
                </div>
                <!-- <BInputVal rules="email" type="email" label="Correo electrónico" v-model="patient.email" placeholder="Correo (opcional)" /> -->
                <div class="field">
                    <label class="label">Correo electrónico (opcional)</label>
                    <div class="control">
                        <input type="email" class="input" v-model="patient.email" placeholder="Correo electrónico (opcional)" >
                    </div>
                </div>
                <BSelectVal rules="required" label="¿Pertenece a la UNAM?" v-model="patient.isUnam">
                    <option value=false>No</option>
                    <option value=true>Si</option>
                </BSelectVal>
                <BInputVal rules="required" type="text" label="Número de cuenta/CURP/trabajador UNAM" v-model="patient.curp" placeholder="Número de cuenta/CURP/trabajador UNAM" />
                <a href="https://www.gob.mx/curp/" class="button is-info" target="_blank">
                    <span>Ir a página para buscar el CURP</span>
                    <span class="icon">
                        <b-icon
                            pack="fas"
                            icon="external-link-alt"
                            size="is-small">
                        </b-icon>
                    </span>
                </a>
                <BSelectVal rules="required" label="Estado" v-model="patient.estado" @change="changeAlMun">
                    <option value="CDMX">CDMX</option>
                    <option value="edoMex">Estado de México</option>
                </BSelectVal>
                <BSelectVal v-if="patient.estado=='CDMX'" rules="required" label="Alcaldía" v-model="patient.alcaldia">
                    <option v-for="(al, idx) in alcaldias" :key="idx" :value="al">{{al}}</option>
                </BSelectVal>
                <BSelectVal v-else rules="required" label="Municipio" v-model="patient.municipio">
                    <option v-for="(mun, idx) in municipios" :key="idx" :value="mun">{{mun}}</option>
                </BSelectVal>
                <div class="field">
                    <label class="label">Dirección</label>
                    <div class="control">
                        <input type="text" class="input" placeholder="Dirección (opcional)" v-model="patient.address">
                    </div>
                </div>
                <BSelectVal rules="required" label="Estado civil" v-model="patient.maritalStatus">
                    <option v-for="(type, idx) in maritalStatuses" :key=idx :value="type">{{ type }}</option>
                </BSelectVal>
                <div class="field">
                    <label class="label">Ocupación (opcional)</label>
                    <div class="control">
                        <input type="text" class="input" v-model="patient.occupation" placeholder="Ocupación">
                    </div>
                </div>
                <BSelectVal rules="required" label="Modalidad de supervisión" v-model="patient.attentionType">
                    <option v-for="(type, idx) in attentionTypes" :key=idx :value="type">{{ type }}</option>
                </BSelectVal>
                <BSelectVal rules="required" label="Tipo de servicio" v-model="patient.askedAttention">
                    <option v-for="(type, idx) in askedAttentions" :key=idx :value="type">{{ type }}</option>
                </BSelectVal>
                <!-- <BSelectVal rules="required" label="Tipo de paciente" v-model="patient.patientType">
                    <option v-for="(type, idx) in patientTypes" :key=idx :value="idx">{{ type }}</option>
                </BSelectVal> -->
                <BSelectVal rules="required" label="Orientación solicitada" v-model="patient.askedType">
                    <option v-for="(type, idx) in askedTypes" :key=idx :value="type">{{ type }}</option>
                </BSelectVal>
                <!-- preconsulta -->
                <div class="field">
                    <label class="label">Motivo de la persona para solicitar atención psicológica</label>
                    <p class="is-italic">Describa la problemática o motivo por el cual solicita el programa de terapeuta invitado.</p>
                    <div class="control">
                        <textarea class="textarea" v-model="patient.reason" ></textarea>
                    </div>
                </div>
                <!-- <div class="field">
                    <label class="label">Síntoma principal</label>
                    <div class="control">
                        <div class="select">
                            <select v-model="patient.mainProblem">
                                <option v-for="symptom in symptomsList" :key="symptom" :value="symptom">{{symptom}}</option>
                            </select>
                        </div>
                    </div>
                </div> -->
                <!-- <BSelectVal rules="required" label="Síntoma principal" v-model="patient.mainProblem">
                    <option v-for="symptom in symptomsList" :key="symptom" :value="symptom">{{symptom}}</option>
                </BSelectVal> -->
                <div class="field">
                    <label class="label">Listado de criterios (Sintomatología detectada por el terapeuta)</label>
                    <p class="is-italic">Seleccione sólo aquellas problemáticas que le estén afectando en la actualidad</p>
                    <div class="control" v-for="(symptom,idx) in symptomsList" :key="idx">
                        <label class="checkbox"><input type="checkbox" v-model="patient.symptoms[symptomsList[idx]]"> {{symptom}}</label>
                    </div>
                </div>

                <!-- <b-button v-if="!patientId" type="is-info" @click="signup" :loading="performingRequest" >Registrar</b-button> -->
                <a v-if="!patientId" @click="passes(signup)" class="button is-info" :class="{'is-loading': performingRequest}">Registrar</a>
                <a v-else class="button is-info" :class="{'is-loading': performingRequest}" @click="passes(update)"> Actualizar</a>
            </form>
        </ValidationObserver>
        <br>
        <br>
        <div v-if="currentUser.uid=='s8R9yKP5uJQRNwp1MT8f1PfzPKr1' && patientId" class="control">
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
                    <button class="button is-danger" type="button" @click.prevent="showDel">Borrar paciente</button>
                </div>
            </b-collapse>
        </div>
    </div>
</template>

<script>
// const fb = require('@/firebaseConfig.js')
import { firebase, patientsCollection, refersCollection } from '@/firebaseConfig.js'; 
import Swal from 'sweetalert2';

import { ValidationObserver } from 'vee-validate'
import BInputVal from '@/components/inputs/BInputVal'
import BSelectVal from '@/components/inputs/BSelectVal'

import { attentionTypes, educationLevels, maritalStatuses, askedAttentions, patientTypes, askedTypes, problems, alcaldias, municipios } from '@/constants.js';
import {generateKeywords} from '@/utils.js';
import { mapState } from 'vuex';

export default {
    components: {
        ValidationObserver,
        BInputVal,
        BSelectVal
    },
    props: {
        alcaldias: {
            type: Array,
            default: () => (alcaldias),
        },
        municipios: {
            type: Array,
            default: () => (municipios),
        },
        symptomsList: {
            type: Array,
            default: () => (problems),
        },
        attentionTypes: { type: Array, default: () => (attentionTypes) },
        maritalStatuses: { type: Array, default: () => (maritalStatuses) },
        askedAttentions: { type: Array, default: () => (askedAttentions) },
        patientTypes: { type: Array, default: () => (patientTypes) },
        askedTypes: { type: Array, default: () => (askedTypes) },
        educationLevels: { type: Array, default: () => (educationLevels) },
    },
    data() {
        return {
            patientId: this.$route.params.id,
            patient: {
                name: null,
                lastName: '',
                mothersName: '',
                birthdate: '',
                phoneHome: '',
                phoneCell: '',
                phoneWork: '',
                email: '',
                isUnam: false,
                curp: '',
                estado: 'CDMX',
                alcaldia: alcaldias[0],
                municipio: null,
                address: null,
                maritalStatus: maritalStatuses[0],
                education: educationLevels[0],
                occupation: '',
                callReason: '',
                attentionType: attentionTypes[0],
                askedAttention: askedAttentions[0],
                // patientType: ,
                askedType: askedTypes[0],
                reason: '',
                symptoms: {},
                // mainProblem: problems[0],
            },
            performingRequest: false,
            // fbErrors: ,
            // errorsExist: false
        }
    },
    computed: {
        ...mapState(['currentUser']),
        fullName() {
            return `${this.patient.name} ${this.patient.lastName} ${this.patient.mothersName}`;
        }
    },
    methods: {
        signup() {
            this.performingRequest = true;
            let newPatient = this.patient;
            newPatient.registeredBy = this.$store.state.currentUser.uid;
            newPatient.status = 'Por referir';
            newPatient.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            newPatient.keywords = generateKeywords([this.patient.name, this.patient.lastName, this.patient.mothersName]);
            patientsCollection.add(newPatient)
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El paciente se registró exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => this.$router.push('/usuarios')
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
            .finally(this.performingRequest=false);
        },
        getPatient() {
            patientsCollection.doc(this.patientId).get()
            .then(res=>{
                this.patient = res.data();
            })
            .catch(err=>console.log(err))
        },
        update() {
            this.performingRequest = true;
            this.patient.keywords = generateKeywords([this.patient.name, this.patient.lastName, this.patient.mothersName]);
            patientsCollection.doc(this.patientId).update(this.patient)
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El paciente se actualizó exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => this.$router.push('/usuarios')
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
        changeAlMun() {
            if (this.patient.estado != "CDMX") {
                this.patient.municipio = null;
                this.patient.alcaldia = alcaldias[0];
            } else {
                this.patient.municipio = municipios[0];
                this.patient.alcaldia = null;
            }
        },
        showDel() {
            Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no es reversible",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Borrar',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                // return patientsCollection.doc(this.patientId).delete()
                return refersCollection.where('patientId', '==', this.patientId).get()
                .then(docs => {
                    docs.forEach(doc => {
                        doc.ref.delete();
                    })
                })
                .then(() => {
                    return patientsCollection.doc(this.patientId).delete()
                })
                .catch(error => {
                    Swal.showValidationMessage(
                    `Request failed: ${error}`
                    )
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
                if (result.value) {
                    Swal.fire({
                        title: 'Éxito',
                        text: 'El paciente eliminó exitosamente',
                        type: "success",
                        confirmButtonText: 'Aceptar',
                        onClose: () => this.$router.push('/usuarios')
                    })
                }
            })
        }
    },
    mounted() {
        // this.patientId = this.$route.params.id;
        if (this.patientId) {
            this.getPatient();
        }
    }
}
</script>