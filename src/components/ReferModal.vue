<template>
    <div class="modal">
        <div class="modal-background" @click="closeModal"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Referenciar paciente</p>
            </header>
            <section class="modal-card-body">
                <p>La siguiente lista muestra los terapeutas que atienden los problemas indicados por el paciente</p>
                <p class="is-italic">Has click sobre el nombre del terapeuta deseado y después presiona el botón "Referenciar"</p>
                <b-table :data="therapists" :loading="gettingTherapists" :selected.sync="selectedTherapist" >
                    <template slot-scope="props">
                        <b-table-column field="data.name" label="Nombre" sortable>{{ props.row.data.name }}</b-table-column>
                        <b-table-column field="data.lastName" label="Apellido paterno" sortable>{{ props.row.data.lastName }}</b-table-column>
                        <b-table-column field="data.mothersName" label="Apellido materno" sortable>{{ props.row.data.mothersName }}</b-table-column>
                    </template>
                </b-table>
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

export default {
    props: ['patient'],
    data() {
        return {
            gettingTherapists: false,
            referencing: false,
            therapists: [],
            selectedTherapist: null
        }
    },
    methods: {
        closeModal() {
            this.$emit('close-refer-modal')
        },
        getTherapists() {
            this.gettingTherapists = true;
            fb.usersCollection.where('userType', '==', 3).get()
            .then(querySnapshot=>{
                querySnapshot.forEach(doc=> {
                    this.therapists.push({ id: doc.id,  data: doc.data() });
                });
            })
            .catch(err=>console.log(err)) // todo poner un banner de error
            .finally(this.gettingTherapists = false);
        },
        refer() {
            this.referencing = true;
            fb.patientsCollection.doc(this.patient).update({
                assignations: {
                    timestamps: fb.firebase.firestore.FieldValue.serverTimestamp(),
                    therapist: this.selectedTherapist.id,
                    referrer: this.$store.state.currentUser.uid,
                }
            })
            .then(()=>{
                Swal.fire({
                    title: 'Éxito',
                    text: 'El paciente se referenció exitosamente',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => {
                        this.$emit('reload-patients');
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
    mounted() {
        this.getTherapists();
    }
}
</script>