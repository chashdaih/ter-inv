<template>
    <div class="migration" style="background-color: white;">
        <h1 class="title">Migrar</h1>
        <!-- <label v-if="therapists.length > 0" class="label">Se tienen</label> -->
        <a @click.prevent="migrar" class="button" :class="{'is-loading': loading}">Migrar terapeutas</a>
        <a @click.prevent="migrarPacientes" class="button" :class="{'is-loading': loading}">Migrar pacientes</a>
    </div>
</template>

<script>
import axios from 'axios';
import {generateKeywords} from '@/utils.js';
const fb = require('@/firebaseConfig.js');

let therapists = [];
let problems = [];
let patients = [];

const oldStatus = ['En proceso', 'alta', 'baja', 'referenciado', 'no contesta', 'no se presentó', 'na'];

const newStatus = ['Referido', 'Alta', 'Baja', 'Referido', 'Referido', 'Referido', 'Referido'];

export default {
    data() {
        return {
            loading:false,
        }
    },
    methods: {
        // fetchTherapists() {
        //     axios.get('./ther.json')
        //     .then(res=>{
        //         therapists= res.data;
        //     });
        // },
        // fetchProblems() {
        //     let res = axios.get('./ther_symptoms.json')
        //     .then(res =>
        //         problems = res.data
        //     );
        // },
        fetchPatients() {
            axios.get('./patients.json')
            .then(res=> {
                patients = res.data;
            });
        },
        migrar() {
            this.loading = true;
            const terapeuta = therapists[0];

            const email = terapeuta.correo;
            const password = terapeuta.password;

            const newUser = { email, password };

            // partir el nombre
            const arrayName = terapeuta.terapeuta.split(" ");
            const lastName = arrayName.shift();
            const mothersName = arrayName.shift();
            const name = arrayName.join(" ");

            const keywords = generateKeywords([name, lastName, mothersName]);

            const phone1 = terapeuta.telefono.trim();
            const officeAddress = terapeuta.direccion.trim();
            const officeHours = terapeuta.horario;
            const maxCap = terapeuta.cupo_max;
            const activePatients = terapeuta.referido;
            const specs = terapeuta.especificaciones.trim();
            
            let target = {};
            if (terapeuta.poblacion_at.toLowerCase().includes('ni')) {
                target['Niño'] = true;
            }
            if (terapeuta.poblacion_at.toLowerCase().includes('do')) {
                target['Adolescente'] = true;
            }
            if (terapeuta.poblacion_at.toLowerCase().includes('du')) {
                target['Adulto'] = true;
            }

            let orientation = {};
            if (terapeuta.campo_con.toLowerCase().includes('cog')) {
                orientation['Cognitivo-conductual'] = true;
            }
            if (terapeuta.campo_con.toLowerCase().includes('ge')) {
                orientation['Gestalt'] = true;
            }
            if (terapeuta.campo_con.toLowerCase().includes('lis')) {
                orientation['Psicoanalista'] = true;
            }
            if (terapeuta.campo_con.toLowerCase().includes('din')) {
                orientation['Psicodinámica'] = true;
            }
            if (terapeuta.campo_con.toLowerCase().includes('sis')) {
                orientation['Sistémica'] = true;
            }

            let symptoms = {};
            let therProblems = problems.filter((obj) => {
                return obj.id_terapeuta == terapeuta.id_terapeuta;
            });
            therProblems.forEach((val, idx, arr) => {
                let symptom = val.nombre.split(' ').join('_');
                symptoms[symptom] = true;
            })

            const degree = terapeuta.grado;
            const colPatients = terapeuta.colaborativo ? true: false;
            const refPatients = terapeuta.referenciado ? true: false;
            const userType = 3;

            const therapist = { name, lastName, mothersName, phone1, officeAddress, officeHours, maxCap, activePatients, specs, target, orientation, degree, colPatients, refPatients, userType, symptoms, keywords };

            const createUser = fb.firebase.functions().httpsCallable('createNewUser');
            createUser(newUser)
            .then(res => {
                return fb.usersCollection.doc(res.data.uid).set(therapist)
            })
            .then(res=>console.log('bien'))
            .catch(err=>console.error(err))
            .finally(this.loading = false);

        },
        migrarPacientes() {
            const paciente = patients[0];

            const name = paciente.nombre;
            const lastName = paciente.a_paterno;
            const mothersName = paciente.a_materno;
            const birthdate = paciente.fecha_nac;
            const phoneHome = paciente.tel_casa;
            const phoneCell = paciente.tel_celular;
            const phoneWork = paciente.tel_laboral;
            const email = paciente.correo;
            const isUnam = paciente.unam ? true: false;
            const curp = paciente.id_CURP;
            const estado = "";
            const alcaldia = "";
            const municipio = null;
            const address = paciente.direccion;
            const maritalStatus = paciente.estado_civ.split(' ').join('_');
            const education = paciente.nivel_estudio.split(' ').join('_');
            const occupation = paciente.ocupacion;
            const callReason = "";
            const attentionType = 0;
            const askedAttention = 0;
            const askedType = 0;
            const reason = "";
            const symptoms = {};
            const mainProblem = paciente.problema;
            const status = newStatus[paciente.estatus];
            const registeredBy = "";
            const createdAt = paciente.fecha;
            const keywords = generateKeywords([name, lastName, mothersName]);

            const patient = { name, lastName, mothersName, birthdate, phoneHome, phoneCell, phoneWork, email, isUnam, curp, estado, alcaldia, municipio, address, maritalStatus, education, occupation, callReason, attentionType, askedType, reason, symptoms, mainProblem, status, registeredBy, createdAt, keywords };

            fb.patientsCollection.add(patient)
            .then(res=>console.log(res))
            .catch(err=>console.log(err));

        }
    },
    mounted() {
        // this.fetchTherapists();
        // this.fetchProblems();
        this.fetchPatients();
    }
}
</script>