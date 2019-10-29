<template>
    <div class="make-ref">
        <nav class="breadcrumb">
            <ul>
                <li><router-link to="/usuarios">Usuarios</router-link></li>
                <li><router-link v-if="selectedPatient" :to="`/usuarios/${selectedPatient.id}`">{{fullName}}</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">Referenciar usuario</a></li>
            </ul>
        </nav>
        <h1 class="title">Referenciar al paciente</h1>
        <template v-if="selectedPatient">
            <table class="table">
                <tr>
                    <th>Edad</th>
                    <td>{{age}}</td>
                </tr>
                <tr>
                    <th>Dirección</th>
                    <td>{{selectedPatient.data.address}}</td>
                </tr>
                <tr>
                    <th>Estado</th>
                    <td>{{selectedPatient.data.estado}}</td>
                </tr>
                <tr>
                    <th>Alcaldía/Municipio</th>
                    <td>{{muni}}</td>
                </tr>
            </table>
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
            <br>
            <br>
            <div class="field is-horizontal">
                <div class="field-body">
                    <div class="field">
                        <label class="label">Elige un síntoma del usuario</label>
                        <div class="select">
                            <select v-model="symptom" @change="getTherapists">
                                <option v-for="sym in symptomsArray" :key="sym" :value="sym">{{sym}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Elige un estado</label>
                        <div class="select">
                            <select v-model="estado" @change="getTherapists">
                                <option value="CDMX">CDMX</option>
                                <option value="edoMex">Estado de México</option>
                            </select>
                        </div>
                    </div>
                    <div v-if="estado=='CDMX'" class="field">
                        <label class="label">Elige una alcaldía</label>
                        <div class="select">
                            <select v-model="alcaldia" @change="getTherapists">
                                <option v-for="(al, idx) in alcaldias" :key="idx" :value="al">{{al}}</option>
                            </select>
                        </div>
                    </div>
                    <div v-else class="field">
                        <label class="label">Elige un municipio</label>
                        <div class="select">
                            <select v-model="municipio" @change="getTherapists">
                                <option v-for="(mun, idx) in municipios" :key="idx" :value="mun">{{mun}}</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>
            <b-table :data="therapists" :loading="gettingTherapists" >
                    <template slot-scope="props">
                        <b-table-column field="data.name" label="Nombre" sortable>{{ props.row.data.name }}</b-table-column>
                        <b-table-column field="data.lastName" label="Apellido paterno" sortable>{{ props.row.data.lastName }}</b-table-column>
                        <b-table-column field="data.mothersName" label="Apellido materno" sortable>{{ props.row.data.mothersName }}</b-table-column>
                        <b-table-column label="Usuarios/Total">{{props.row.data.activePatients}}/{{props.row.data.maxCap}}</b-table-column>
                        <b-table-column label="Teléfono">{{props.row.data.phone1}}<template v-if="props.row.data.phone2"> / {{props.row.data.phone2}}</template></b-table-column>
                        <b-table-column label="Dirección">{{props.row.data.officeAddress}}</b-table-column>
                        <b-table-column label="Horarios">{{props.row.data.officeHours}}</b-table-column>
                        <b-table-column label="Especificaciones">{{props.row.data.specs}}</b-table-column>
                        <b-table-column label="Referenciar"><a @click.prevent="refer(props.row)" class="button is-link">Referenciar</a></b-table-column>
                    </template>
                    <template v-if="!gettingTherapists" slot="empty">
                        <section class="section">
                            <div class="content has-text-grey has-text-centered">
                                <p class="has-text-weight-bold">{{tableText}}</p>
                            </div>
                        </section>
                    </template>
                </b-table>
        </template>
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import { mapState, mapActions } from 'vuex';
import { calculateAge } from '@/utils.js';
import { alcaldias, municipios } from '@/constants.js';
import { firebase, usersCollection, patientsCollection, refersCollection } from '@/firebaseConfig.js';

export default {
    props: {
        alcaldias: { type: Array,  default: () => (alcaldias), },
        municipios: { type: Array,  default: () => (municipios), },
    },
    data() {
        return {
            symptom: null,
            estado: null,
            alcaldia: null,
            municipio: null,
            //
            gettingTherapists: true,
            referencing: false,
            therapists: [],
            tableText: 'No hay terapeutas que cumplan con los requerimentos del usuario :(',
        }
    },
    computed: {
        ...mapState(['selectedPatient', 'currentUser', 'userProfile']),
        fullName() {
            return `${this.selectedPatient.data.name} ${this.selectedPatient.data.lastName} ${this.selectedPatient.data.mothersName}`;
        },
        symptomsArray() {
            const syms = Object.keys(this.selectedPatient.data.symptoms);
            return syms.filter((id)=>this.selectedPatient.data.symptoms[id]);
        },
        age() {
            return calculateAge(this.selectedPatient.data.birthdate);
        },
        ageGroup() {
            if (this.age < 13) {
                return 'Niño';
            } else if (this.age < 18) {
                return 'Adolescente';
            } else {
                return 'Adulto';
            }
        },
        muni(){
            if (this.selectedPatient.data.estado == "CDMX") {
                return this.selectedPatient.data.alcaldia;
            } else {
                return this.selectedPatient.data.municipio;
            }
        },
    },
    methods: {
        ...mapActions(['getSelectedPatient']),
        async getTherapists() {
            this.gettingTherapists = true;
            this.therapists = [];
            let query = usersCollection;
            query = query.where('userType', '==', 3) // sean terapeutas
            query = query.where(`target.${this.ageGroup}`, '==', true) // que atiendan la edad del paciente
            query = query.where(`symptoms.${this.symptom}`, '==', true);
            query = query.where(`estado`, '==', this.estado);
            query = this.estado == "CDMX" ? query.where(`officeAlcaldia`, '==', this.alcaldia) : query.where("officeMunicipio", '==', this.municipio);
            // todo pagination?
            try {
                const docs = await query.get();
                docs.forEach(doc => {
                    const data = doc.data();
                    if (data.maxCap > data.activePatients && data.disabled != true) {
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
        refer(selectedTherapist) {
            const sendMail = firebase.functions().httpsCallable('sendNewRefEmail');
            const therapistName = `${selectedTherapist.data.name} ${selectedTherapist.data.lastName} ${selectedTherapist.data.mothersName}`;
            this.gettingTherapists = true;
            // todo mark previous refer as ended
            patientsCollection.doc(this.selectedPatient.id).update({
                status: 'Referido'
            })
            .then(()=>{
                return refersCollection.add({
                    therapistId: selectedTherapist.id,
                    therapistName,
                    patientId: this.selectedPatient.id,
                    patientName: this.fullName,
                    referrerId: this.currentUser.uid,
                    referrerName: `${this.userProfile.name} ${this.userProfile.lastName} ${this.userProfile.mothersName}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    expectedAppts: 'Sin especificar',
                    status: 'Activo',
                });
            })
            .then(() =>{
                let refsTimes = this.userProfile.refsTimes;
                if (!refsTimes) {
                    refsTimes = 0;
                } else {
                    refsTimes = parseInt(refsTimes);
                }
                refsTimes = refsTimes + 1;
                return usersCollection.doc(this.currentUser.uid).update({refsTimes})
            })
            .then(() =>{
                let activePatients = selectedTherapist.data.activePatients;
                if (!activePatients) {
                    activePatients = 0;
                } else {
                    activePatients = parseInt(activePatients);
                }
                activePatients++;
                return usersCollection.doc(selectedTherapist.id).update({activePatients});
            })
            .then(() => {
                return sendMail({
                    therapistName,
                    therapistId: selectedTherapist.id, 
                    patientName: this.fullName,
                })
            })
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El paciente se referenció exitosamente',
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
            .finally(()=>this.referencing=false)
        }
    },
    async mounted() {
        const patientId = this.$route.params.id;
        if(!this.selectedPatient || this.selectedPatient.id != patientId) {
            await this.getSelectedPatient(patientId);
        }
        this.symptom = this.symptomsArray[0];
        this.estado = this.selectedPatient.data.estado;
        if (this.estado == "CDMX") {
            this.alcaldia = this.selectedPatient.data.alcaldia;
            this.municipio = municipios[0];
        } else {
            this.municipio = this.selectedPatient.data.municipio;
            this.alcaldia = alcaldias[0];
        }
        //
        this.getTherapists();
    }
}
</script>