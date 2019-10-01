<template>
    <div class="signup">
        <b-notification :active.sync="errorsExist" type="is-danger" aria-close-label="Close notification" >
            {{ fbErrors.message }}
        </b-notification>
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/">Inicio</router-link></li>
                <li><router-link to="/usuarios">Usuarios</router-link></li>
                <li v-if="!patientId" class="is-active"><a href="#" aria-current="page">Registrar nuevo usuario</a></li>
                <li v-else class="is-active"><a href="#" aria-current="page">Actualizar usuario</a></li>
            </ul>
        </nav>
        <h1 v-if="!patientId" class="title">Registrar nuevo usuario</h1>
        <h1 v-else class="title">Actualizar usuario</h1>
        <!-- <div class="card">
            <div class="card-header" style="background-color: #E4AE33;">
                <p class="card-header-title">Registrar nuevo paciente</p>
            </div>
            <div class="card-content">
                <div class="content"> -->
                    <!-- <ValidationObserver ref="observer" v-slot="{ passes }"> -->
                        <BInputVal rules="required" type="text" label="Nombre" v-model="signupForm.name" placeholder="Nombre" />
                        <BInputVal rules="required" type="text" label="Apellido paterno" v-model="signupForm.lastName" placeholder="Apellido paterno" />
                        <BInputVal rules="required" type="text" label="Apellido materno" v-model="signupForm.mothersName" placeholder="Apellido materno" />
                        <BInputVal rules="required" type="date" label="Fecha de nacimiento" v-model="signupForm.birthdate" placeholder="Fecha de nacimiento" />
                        <BInputVal rules="" type="text" label="Teléfono casa" v-model="signupForm.phoneHome" placeholder="Teléfono casa (opcional)" />
                        <BInputVal rules="" type="text" label="Teléfono celular" v-model="signupForm.phoneCell" placeholder="Teléfono celular (opcional)" />
                        <BInputVal rules="" type="text" label="Teléfono trabajo" v-model="signupForm.phoneWork" placeholder="Teléfono trabajo (opcional)" />
                        <BInputVal rules="email" type="email" label="Correo electrónico" v-model="signupForm.email" placeholder="Correo (opcional)" />
                        <BSelectVal rules="required" label="¿Pertenece a la UNAM?" v-model="signupForm.isUnam">
                            <option value=false>No</option>
                            <option value=true>Si</option>
                        </BSelectVal>
                        <BInputVal rules="required" type="text" label="Número de cuenta/CURP/trabajador UNAM" v-model="signupForm.curp" placeholder="Número de cuenta/CURP/trabajador UNAM" />
                        <BInputVal rules="required" type="text" label="Estado" v-model="signupForm.estado" placeholder="Estado" />
                        <BInputVal rules="required" type="text" label="Municipio" v-model="signupForm.municipio" placeholder="Municipio" />
                        <BSelectVal rules="required" label="Estado civil" v-model="signupForm.maritalStatus">
                            <option v-for="(type, idx) in maritalStatuses" :key=idx :value="idx">{{ type }}</option>
                        </BSelectVal>
                        <BInputVal rules="required" type="text" label="Ocupación" v-model="signupForm.occupation" placeholder="Ocupación" />
                        <BInputVal rules="required" type="text" label="Motivo de llamada" v-model="signupForm.callReason" placeholder="Motivo de llamada" />
                        <BSelectVal rules="required" label="Tipo de atención" v-model="signupForm.attentionType">
                            <option v-for="(type, idx) in attentionTypes" :key=idx :value="idx">{{ type }}</option>
                        </BSelectVal>
                        <BSelectVal rules="required" label="Tipo de atención solicitada" v-model="signupForm.askedAttention">
                            <option v-for="(type, idx) in askedAttentions" :key=idx :value="idx">{{ type }}</option>
                        </BSelectVal>
                        <BSelectVal rules="required" label="Tipo de paciente" v-model="signupForm.patientType">
                            <option v-for="(type, idx) in patientTypes" :key=idx :value="idx">{{ type }}</option>
                        </BSelectVal>
                        <BSelectVal rules="required" label="Tipo de orientación solicitada" v-model="signupForm.askedType">
                            <option v-for="(type, idx) in askedTypes" :key=idx :value="idx">{{ type }}</option>
                        </BSelectVal>
                        <!-- preconsulta -->
                        <div class="field">
                            <label class="label">Motivos del paciente para solicitar terapia</label>
                            <p class="is-italic">Describa la problemática o motivo por el cual desea ayuda psicológica en este centro.</p>
                            <div class="control">
                                <textarea class="textarea" v-model="signupForm.reason" ></textarea>
                            </div>
                        </div>
                            <br>
                        <div class="field">
                            <label class="label">Listado de criterios (Sintomatología detectada por el terapeuta)</label>
                            <p class="is-italic">Seleccione sólo aquellas problemáticas que le estén afectando en la actualidad. (Obligatorio marcar al menos uno)</p>
                            <div class="control" v-for="(cat,idx) in problems" :key="idx">
                                <label class="checkbox"><input type="checkbox" v-model="signupForm.catalog[cat.toLowerCase().split(' ').join('')]"> {{cat}}</label>
                            </div>
                        </div>

                        <b-button v-if="!patientId" type="is-info" @click="signup" :loading="performingRequest" >Registrar</b-button>
                        <a v-else class="button is-info" :class="{'is-loading': performingRequest}" @click="update"> Actualizar</a>
                    <!-- </ValidationObserver> -->
                </div>
            <!-- </div>
        </div>
    </div> -->
</template>

<script>
const fb = require('@/firebaseConfig.js')
import Swal from 'sweetalert2';

import { ValidationObserver } from 'vee-validate'
import BInputVal from '@/components/inputs/BInputVal'
import BSelectVal from '@/components/inputs/BSelectVal'

import { attentionTypes, maritalStatuses, askedAttentions, patientTypes, askedTypes, problems } from '@/constants.js';

export default {
    components: {
        ValidationObserver,
        BInputVal,
        BSelectVal
    },
    data() {
        let catalog = {};
        for (let problem of problems) {
            catalog[problem.toLowerCase().split(' ').join('')] = false;
        }
        return {
            patientId:null,
            signupForm: {
                name: '',
                lastName: '',
                mothersName: '',
                birthdate: '',
                phoneHome: '',
                phoneCell: '',
                phoneWork: '',
                email: '',
                isUnam: false,
                curp: '',
                estado: '',
                municipio: '',
                maritalStatus: 0,
                education: 0,
                occupation: '',
                callReason: '',
                attentionType: 0,
                askedAttention: 0,
                patientType: 0,
                askedType: 0,
                reason: '',
                catalog,
            },
            problems,
            attentionTypes,
            maritalStatuses,
            askedAttentions,
            patientTypes,
            askedTypes,
            performingRequest: false,
            fbErrors: {},
            errorsExist: false
        }
    },
    methods: {
        signup() {
            this.performingRequest = true;
            let newPatient = this.signupForm;
            newPatient.registeredBy = this.$store.state.currentUser.uid;
            newPatient.assignations = null;
            fb.patientsCollection.add(newPatient)
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
            .catch(err=>console.log(err))
            .finally(this.performingRequest=false);
        },
        getPatient() {
            fb.patientsCollection.doc(this.patientId).get()
            .then(res=>{
                this.signupForm = res.data();
            })
            .catch(err=>console.log(err))
        },
        update() {
            this.performingRequest = true;
            fb.patientsCollection.doc(this.patientId).update(this.signupForm)
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
        }
    },
    mounted() {
        this.patientId = this.$route.params.id;
        if (this.patientId) {
            this.getPatient();
        }
    }
}
</script>