<template>
    <div class="migration" style="background-color: white;">
        <h1 class="title">Migrar</h1>
        <!-- <label v-if="therapists.length > 0" class="label">Se tienen</label> -->
        <!-- <a @click.prevent="migrar" class="button" :class="{'is-loading': loading}">Migrar terapeutas</a> -->
        <a @click.prevent="migrarPacientes" class="button" :class="{'is-loading': loading}">Migrar pacientes</a>
        <!-- <a @click.prevent="migrarRefers" class="button" :class="{'is-loading': loading}">Migrar referencias</a> -->
    </div>
</template>

<script>
import axios from 'axios';
import {generateKeywords} from '@/utils.js';
const fb = require('@/firebaseConfig.js');

let therapists = [];
let problems = [];
let patients = [];
let refers = [];

const oldStatus = ['En proceso', 'alta', 'baja', 'referenciado', 'no contesta', 'no se presentó', 'na'];

const newStatus = ['Referido', 'Alta', 'Baja', 'Referido', 'Referido', 'Referido', 'Referido'];

const delay = ms => new Promise(res=> setTimeout(res, ms));

export default {
    data() {
        return {
            loading:false,
        }
    },
    methods: {
        fetchTherapists() {
            axios.get('./ther2.json')
            .then(res=>{
                therapists= res.data;
            });
        },
        fetchProblems() {
            let res = axios.get('./ther_symptoms.json')
            .then(res =>
                problems = res.data
            );
        },
        fetchPatients() {
            // axios.get('./patients.json')
            axios.get('./allPatients.json')
            .then(res=> {
                patients = res.data;
            });
        },
        fetchRefers() {
            axios.get('./refer.json')
            // axios.get('./nuevasRefs.json')
            .then(res => {
                refers = res.data;
            })
        },
        async migrar() {
            this.loading = true;

            // therapists.forEach(terapeuta => {
            for(let i = 0; i < therapists.length; i++) {

            const terapeuta = therapists[i];

            const email = terapeuta.correo;
            const password = terapeuta.password;
            const uid = terapeuta.id_usuario;

            const newUser = { email, password, uid };

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

            try {
                let createUser = fb.firebase.functions().httpsCallable('createNewUser');
                const res = await createUser(newUser);
                console.log('usuario creado, ' + res.data.uid);
                const newRecord = await fb.usersCollection.doc(res.data.uid).set(therapist);
                console.log('ter creado');
            } catch(e) {
                console.error(e);
            }
            
            console.log('se esperarán 5 seg');
            await delay(5000);
            
            // .then(res => {
                
            // })
            // .then(res=>console.log('pasaron 5s'))
            // .catch(err=>console.error(err))
            // .finally(this.loading = false);

            
            }
            this.loading = false;
        },
        async migrarPacientes() {
            this.loading = true;
            for (let i = 0; i < patients.length - 1; i++) {
                const paciente = patients[i];

                const name = paciente.nombre;
                const lastName = paciente.a_paterno;
                const mothersName = paciente.a_materno;

                let birthdate = '';
                if (paciente.fecha_nac) {
                    birthdate = paciente.fecha_nac;
                } else {
                    let date = new Date();
                    date.setFullYear(date.getFullYear() - parseInt(paciente.edad));
                    birthdate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                }
                const phoneHome = paciente.tel_casa;
                const phoneCell = paciente.tel_celular;
                const phoneWork = paciente.tel_laboral;
                const email = paciente.correo;
                const isUnam = paciente.unam ? true: false;
                const curp = paciente.id_CURP;
                const estado = "";
                const alcaldia = "";
                const municipio = "";
                const address = paciente.direccion;
                let maritalStatus = '';
                if (paciente.estado_civ) {
                    maritalStatus = paciente.estado_civ.split(' ').join('_');
                }
                let education = '';
                if (paciente.nivel_estudio) {
                    const education = paciente.nivel_estudio.split(' ').join('_');
                }
                const occupation = paciente.ocupacion;
                const callReason = "";
                const attentionType = 0;
                const askedAttention = 0;
                const askedType = 0;
                const reason = "";
                let symptoms = {};
                if (paciente.problema) {
                    symptoms[paciente.problema.split(' ').join('_')] = true;
                }
                let status = newStatus[0];
                if (paciente.estatus) {
                    status = newStatus[paciente.estatus];
                }
                const registeredBy = "";
                const createdAt = paciente.fecha;
                const keywords = generateKeywords([name, lastName, mothersName]);

                const patient = { name, lastName, mothersName, birthdate, phoneHome, phoneCell, phoneWork, email, isUnam, curp, estado, alcaldia, municipio, address, maritalStatus, education, occupation, callReason, attentionType, askedType, reason, symptoms, status, registeredBy, createdAt, keywords };
                try {
                    let res = await fb.patientsCollection.doc(paciente.id_paciente.toString()).set(patient)
                    console.log('bien', paciente.id_paciente.toString());
                } catch (e) {
                    console.error(e);
                }
            }
            this.loading = false;
        },
        async migrarRefers() {
            this.loading = true;
            for (let i = 0; i < refers.length -1; i++) {
                const ref = refers[i];

                const expectedAppts = ref.sesiones_plan;
                const patientId = ref.id_paciente.toString();
                const patientName = ref.patientName;
                const referrerId = ref.id_responsable.toString();
                const referrerName = ref.referrerName;
                const status = ref.estado_ref ? 'Activo' : 'Terminado';
                const therapistId = ref.id_terapeuta.toString();
                if (!ref.therapistName) {
                    ref.therapistName = "";
                }
                const therapistName = ref.therapistName;
                const timestamp = fb.firebase.firestore.Timestamp.fromDate(new Date(ref.fecha));

                const refer = { expectedAppts, patientId, patientName, referrerId, referrerName, status, therapistId, therapistName, timestamp };

                try {
                    let res = await fb.refersCollection.add(refer);
                    console.log('añadido', ref.id_referenciacion);
                } catch (err) {
                    console.error(err);
                }
            }
            this.loading = false;
        },
        async registrarUno() {
        
        let createUser = fb.firebase.functions().httpsCallable('createNewUser');

        const email = "maybadtzmx@yahoo.com";
        const password = "M_glez5645654";
        const uid = "5645654";

        const newUser = { email, password, uid };
        const res = await createUser(newUser);
        console.log('usuario creado, ' + res.data.uid);

        }
    },
    mounted() {
        // this.fetchTherapists();
        // this.fetchProblems();
        // this.fetchPatients();
        // this.fetchRefers();
        // this.registrarUno();
    }
}
</script>