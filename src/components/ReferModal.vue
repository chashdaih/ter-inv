<template>
    <div v-if="patient" class="modal">
        <div class="modal-background" @click="closeModal"></div>
        <div class="modal-card" style="width: 75%; height: 75%">
            <header class="modal-card-head">
                <p class="modal-card-title">Referenciar al usuario {{fullName}}</p>
            </header>
            <section class="modal-card-body">
                <p>La siguiente lista muestra los terapeutas que atienden los problemas indicados por el usuario.</p>
                <!-- <p>El usuario vive en {{muni}}</p> -->
                <br>
                <a href="https://maps.google.com" class="button is-info" target="_blank">
                    <span>Google Maps</span>
                    <span class="icon">
                        <b-icon
                            pack="fas"
                            icon="external-link-alt"
                            size="is-small">
                        </b-icon>
                    </span>
                </a>
                <!-- <p class="is-italic">Has click sobre el nombre del terapeuta deseado y después presiona el botón "Referenciar"</p> -->
                <b-table :data="therapists" :loading="gettingTherapists" :selected.sync="selectedTherapist" >
                    <template slot-scope="props">
                        <b-table-column field="data.name" label="Nombre" sortable>{{ props.row.data.name }}</b-table-column>
                        <b-table-column field="data.lastName" label="Apellido paterno" sortable>{{ props.row.data.lastName }}</b-table-column>
                        <b-table-column field="data.mothersName" label="Apellido materno" sortable>{{ props.row.data.mothersName }}</b-table-column>
                        <b-table-column label="Usuarios/Total">{{props.row.data.activePatients}}/{{props.row.data.maxCap}}</b-table-column>
                        <b-table-column label="Teléfono">{{props.row.data.phone1}}<template v-if="props.row.data.phone2"> / {{props.row.data.phone2}}</template></b-table-column>
                        <b-table-column label="Dirección">{{props.row.data.officeAddress}}</b-table-column>
                    </template>
                    <template v-if="!gettingTherapists" slot="empty">
                        <section class="section">
                            <div class="content has-text-grey has-text-centered">
                                <p class="has-text-weight-bold">{{tableText}}</p>
                            </div>
                        </section>
                    </template>
                </b-table>
                <!-- <p v-else>No hay terapeutas que cumplan con los requerimentos del usuario.</p> -->
            </section>
            <footer class="modal-card-foot">
                <a class="button" type="button" @click="closeModal">Cerrar</a>
                <a class="button is-primary" :disabled="!selectedTherapist" @click="refer" :class="{'is-loading': referencing}">Referenciar</a>
            </footer>
        </div>
        <button class="modal-close is-large" aria-label="close" @click="closeModal"></button>
    </div>
</template>

<script>
const fb = require('@/firebaseConfig.js');
import Swal from 'sweetalert2';
import { mapState } from 'vuex';

import { patientTypes } from '@/constants.js';
import { calculateAge } from '@/utils.js';

export default {
    props: {
        patient: { type: Object },
        patientTypes: { type: Array, default: () => (patientTypes)},
    },
    data() {
        return {
            gettingTherapists: true,
            referencing: false,
            therapists: [],
            selectedTherapist: null,
            tableText: 'No hay terapeutas que cumplan con los requerimentos del usuario :(',
        }
    },
    computed: {
        patientType() {
            const age = calculateAge(this.patient.data.birthdate);
            if (age < 12) {
                return this.patientTypes[0]
            } else if (age < 20) {
                return this.patientTypes[1]
            } else {
                return this.patientTypes[2];
            }
        },
        fullName() {
            return `${this.patient.data.name} ${this.patient.data.lastName}`;
        },
        muni(){
            if (this.patient.data.estado == "CDMX") {
                return `la alcaldía ${this.patient.data.alcaldia}`
            } else if (this.patient.data.estado == 'edoMex') {
                return `el municipio ${this.patient.data.municipio}`
            } else {
                return '';
            }
        },
        ...mapState(['currentUser', 'userProfile']),
    },
    methods: {
        closeModal() {
            this.$emit('close-refer-modal')
        },
        async getTherapists() {
            this.gettingTherapists = true;
            this.therapists = [];
            let query = fb.usersCollection;
            query = query.where('userType', '==', 3) // sean terapeutas
            query = query.where(`target.${this.patientType}`, '==', true) // que atiendan la edad del paciente
            // todo hacer un select con todos los síntomas del paciente
            // query = query.where(`symptoms.${this.patient.data.mainProblem}`, '==', true);
            
            // todo where is not disabled
            // todo pagination
            try {
                const docs = await query.get();
                docs.forEach(doc => {
                    const data = doc.data();
                    if (data.maxCap > data.activePatients) {
                        this.therapists.push({ id: doc.id,  data });
                    }
                });
                this.gettingTherapists = false;
            } catch (err) {
                this.$buefy.toast.open({
                    message: err,
                    type: 'is-danger',
                    position: 'is-bottom'
                });
            }
        },
        refer() {
            this.referencing = true;
            fb.patientsCollection.doc(this.patient.id).update({
                status: 'Referido'
            })
            .then(()=>{
                return fb.refersCollection.add({
                    therapistId: this.selectedTherapist.id,
                    therapistName: `${this.selectedTherapist.data.name} ${this.selectedTherapist.data.lastName} ${this.selectedTherapist.data.mothersName}`,
                    patientId: this.patient.id,
                    patientName: `${this.patient.data.name} ${this.patient.data.lastName} ${this.patient.data.mothersName}`,
                    referrerId: this.currentUser.uid,
                    referrerName: `${this.userProfile.name} ${this.userProfile.lastName} ${this.userProfile.mothersName}`,
                    timestamp: fb.firebase.firestore.FieldValue.serverTimestamp(),
                    expectedAppts: 'Sin especificar',
                    status: 'Activo',
                    patientStatus: 'En tratamiento',
                });
            })
            .then(() =>{
                let refsTimes = this.patient.refsTimes;
                if (!refsTimes) {
                    refsTimes = 0;
                }
                refsTimes++;
                return fb.usersCollection.doc(this.currentUser.uid).update({refsTimes})
            })
            .then(() =>{
                let activePatients = this.selectedTherapist.activePatients;
                if (!activePatients) {
                    activePatients = 0;
                }
                activePatients++;
                return fb.usersCollection.doc(this.selectedTherapist.id).update({activePatients});
            })
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El paciente se referenció exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => {
                        // this.$emit('reload-patients');
                        this.closeModal();
                    }
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
            .finally(()=>this.referencing=false)
        }
    },
    watch: {
        patient() {
            if (this.patient) {
                this.getTherapists();
            }
        }
    }
}
</script>