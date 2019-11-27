<template>
    <div>
        <template v-if="userProfile.userType < 3">
            <nav class="breadcrumb">
                <ul>
                    <li><router-link to="/">Inicio</router-link></li>
                    <li><router-link to="/terapeutas">Terapeutas</router-link></li>
                    <li><router-link :to="'/terapeutas/' + therapistId">{{fullName}}</router-link></li>
                    <li class="is-active"><a href="#" aria-current="page">Usuarios referidos </a></li>
                </ul>
            </nav>
            <h1 class="title">Usuarios referidos a {{fullName}}</h1>
        </template>
        <h1 v-else class="title">Usuarios referenciados</h1>
        <h2 class="subtitle">Filtar por estatus de la referencia</h2>
        <b-field>
            <b-radio-button @input="getRefers" v-model="statusFilter"  :native-value="refStatuses[0]" >{{refStatuses[0]}}</b-radio-button>
            <b-radio-button @input="getRefers" v-model="statusFilter"  :native-value="refStatuses[1]" >{{refStatuses[1]}}</b-radio-button>
            <b-radio-button @input="getRefers" v-model="statusFilter"  :native-value="refStatuses[2]" >{{refStatuses[2]}}</b-radio-button>
        </b-field>
        <b-field v-if="statusFilter == refStatuses[1]">
            <b-radio-button type="is-info" v-model="secStatusFilter" native-value="Todos" :disabled="refers.loadingEnd">Todos</b-radio-button>
            <b-radio-button type="is-info" v-model="secStatusFilter" native-value="Alta" :disabled="refers.loadingEnd">Dados de alta </b-radio-button>
            <b-radio-button type="is-info" v-model="secStatusFilter" native-value="Baja" :disabled="refers.loadingEnd">Dados de baja</b-radio-button>
            <b-radio-button type="is-info" v-model="secStatusFilter" native-value="Referido" :disabled="refers.loadingEnd">Referido a otro ter.</b-radio-button>
        </b-field>
        <b-table :data="compData" :loading="compLoading">
            <template slot-scope="props">
                <b-table-column sortable field="data.patientName" label="Nombre del paciente">{{props.row.data.patientName}}</b-table-column>
                <b-table-column sortable field="data.timestamp" label="Fecha de referenciación">{{props.row.data.timestamp.toDate().toISOString().split("T")[0]}}</b-table-column>
                <b-table-column sortable field="data.status" label="Estatus de la referenciación"><span class="tag">{{props.row.data.status}}</span></b-table-column>
                <b-table-column sortable field="data.patientStatus" label="Estatus del paciente"><span class="tag">{{props.row.data.patientStatus}}</span></b-table-column>
                <b-table-column label="Datos del paciente"><router-link class="button is-success" :to="'/usuarios/' + props.row.data.patientId">Ver</router-link></b-table-column>
                <b-table-column label="Sesiones planeadas"><a @click.prevent="showModal(props.row)" class="button is-light" :class="{'is-loading':updating}">{{props.row.data.expectedAppts}}</a></b-table-column>
                <b-table-column label="Sesiones registradas">{{regSessions(props.row.data.sessions)}}</b-table-column>
                <b-table-column label="Listado de sesiones"><router-link class="button is-info" :to="'/usuarios/' + props.row.data.patientId + '/referencias/' + props.row.id">Ir</router-link></b-table-column>
                <b-table-column v-if="userProfile.userType > 1" label="Cambiar estatus de usuario">
                    <p v-if="userProfile.userType == 3 && statusFilter == refStatuses[1]" >-</p>
                    <a v-else @click.prevent="showStatusModal(props.row.id, props.row.data.patientId)" class="button is-link" :class="{'is-loading':updating}">Cambiar estatus</a>
                </b-table-column>
            </template>
            <template slot="empty">
                <section class="section">
                    <div class="content has-text-grey has-text-centered">
                        <p class="is-italic">El terapeuta no tiene usuarios referidos.</p>
                    </div>
                </section>
            </template>
        </b-table>
        <div class="modal" :class="{'is-active': isModalVisible}">
            <div class="modal-background" @click="clearModal"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Actualizar número de sesiones planeadas</p>
                    <button class="delete" aria-label="close" @click="clearModal"></button>
                </header>
                <section class="modal-card-body">
                    <div class="field">
                        <label class="label">Sesiones esperadas</label>
                        <div class="control">
                            <input type="number" class="input" v-model="newValue" min="1">
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success" @click="updateExpected" :class="{'is-loading': loading}">Actualizar</button>
                    <button class="button" @click="clearModal">Cerrar</button>
                </footer>
            </div>
        </div>
        <div class="modal" :class="{'is-active': isStatusModal}">
            <div class="modal-background" @click="clearStatusModal"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Cambiar estatus del usuario</p>
                    <button class="delete" aria-label="close" @click="clearStatusModal"></button>
                </header>
                <section class="modal-card-body">
                    <div class="field">
                        <label class="label">Nuevo estatus</label>
                        <div class="control">
                            <div class="select">
                                <select v-model="newStatus">
                                    <template v-if="statusFilter == 'Activo'">
                                        <option v-for="status in statuses" :key="status" :value="status">{{status}}</option>
                                    </template>
                                    <option selected v-else value="En tratamiento">Activar</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Comentarios</label>
                        <div class="control">
                            <textarea v-model="statusComments" placeholder="Comentarios" class="textarea"></textarea>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success" @click="updatePatientStatus" :class="{'is-loading': loading}">Actualizar</button>
                    <button class="button" @click="clearStatusModal">Cerrar</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import Swal from 'sweetalert2';
import {firebase, usersCollection, refersCollection, patientsCollection } from '@/firebaseConfig.js';

export default {
    props: {
        statuses: { type: Array, default: () => (['Alta', 'Baja']) },
        refStatuses: { type: Array, default: () => (['Activo', 'Terminado', 'Ambos']) }
    },
    data() {
        return {
            loading: false,
            // update planed session number
            updating:false,
            isModalVisible: false,
            selectedId: null,
            referStatus: null,
            newValue: null,
            therapistId: this.$route.params.id,
            therapist: null,
            // update patient status
            isStatusModal: false,
            selectedPatientId: null,
            newStatus: this.statuses[0],
            statusComments: null,
            // filter
            statusFilter: this.refStatuses[0],
            secStatusFilter: 'Todos',
        }
    },
    computed: {
        ...mapState(['currentUser', 'userProfile', 'refers']),
        fullName() {
            if (!this.therapist) return null;
            return `${this.therapist.name} ${this.therapist.lastName}`;
        },
        compLoading() {
            if (this.statusFilter == this.refStatuses[0]) {
                return this.refers.loadingAct;
            } else if (this.statusFilter == this.refStatuses[1]) {
                return this.refers.loadingEnd;
            } else {
                return (this.refers.loadingEnd || this.refers.loadingAct);
            }
        },
        compData() {
            if (this.statusFilter == this.refStatuses[0]) {
                return this.refers.active;
            } else if (this.statusFilter == this.refStatuses[1]) {
                return this.filterEnded();
            } else {
                return this.refers.active.concat(this.refers.ended);
            }
        }
    },
    methods: {
        ...mapMutations('refers', { setTher: 'SET_THER', setUnA: 'SET_UNSUB_ACT', setUnE: 'SET_UNSUB_END' }),
        ...mapActions('refers', ['getRefersOption']),
        getRefers(option) {
            if (option == this.refStatuses[0]) {
                if (!this.refers.unsubAct) {
                    this.getRefersOption(option);
                }
            } else if (option == this.refStatuses[1]) {
                if (!this.refers.unsubEnd) {
                    this.getRefersOption(option);
                }
            }
        },
        filterEnded() {
            if (this.secStatusFilter == 'Todos') {
                return this.refers.ended;
            } else {
                return this.refers.ended.filter(doc => {
                    return doc.data.patientStatus == this.secStatusFilter;
                });
            }
        },
        regSessions(sessions) {
            if(!sessions) return 0;
            return Object.keys(sessions).length;
        },
        showModal(refer) {
            this.isModalVisible = true;
            this.selectedId = refer.id;
            this.referStatus = refer.data.status;
        },
        clearModal() {
            this.isModalVisible = false;
            this.selectedId = null;
            this.referStatus = null;
        },
        updateExpected() {
            this.loading = true;
            refersCollection.doc(this.selectedId).update({
                expectedAppts: this.newValue
            })
            .then(() => {
                this.getRefersOption(this.statusFilter);
                this.clearModal();
            })
            .catch(err =>{
                Swal.fire({
                   title: 'Ocurrió un error',
                   text: err,
                   type: "error",
                   confirmButtonText: 'Aceptar' 
                });
            })
            .finally(()=>this.loading=false);
        },
        // getTherapist() {
        //     usersCollection.doc(this.therapistId).get()
        //     .then(res => this.therapist = res.data())
        //     .catch(function(error) {
        //         console.log("Error getting documents: ", error);
        //     })
        //     .finally(this.loading=false);
        // },
        showStatusModal(refId, patientId) {
            this.selectedId = refId;
            this.selectedPatientId = patientId;
            this.isStatusModal = true;
        },
        clearStatusModal() {
            this.selectedId = null;
            this.selectedPatientId = null;
            this.isStatusModal = false;
        },
        updatePatientStatus() {
            this.loading = true;
            const timestamp = Date.now().toString();
            let statusUpdate = {
                status: this.newStatus,
                statusHistory: {},
            };
            statusUpdate.statusHistory[timestamp] = {
                status: this.newStatus,
                changerId: this.currentUser.uid,
                comments: this.statusComments,
            };
            patientsCollection.doc(this.selectedPatientId).update(statusUpdate)
            .then(() => {
                let newRefStatus = this.refStatuses[1];
                if (this.statusFilter == this.refStatuses[1]) {
                    newRefStatus = this.refStatuses[0];
                }
                return refersCollection.doc(this.selectedId).update({status: newRefStatus, patientStatus: this.newStatus})
            })
            .then(() => {
                let num = -1;
                if (this.newStatus == 'En tratamiento') {
                    num = 1;
                }
                return usersCollection.doc(this.therapistId).update({activePatients: firebase.firestore.FieldValue.increment(num)})
            })
            .then(() => {
                this.getRefersOption(this.statusFilter);
                this.clearStatusModal();
            })
            .catch(err =>{
                Swal.fire({
                   title: 'Ocurrió un error',
                   text: err,
                   type: "error",
                   confirmButtonText: 'Aceptar' 
                });
            })
            .finally(()=>this.loading=false);
        },
    },
    mounted() {
        console.log('mounted')
        if (!this.therapistId) {
            this.therapistId = this.currentUser.uid;
        }
        if (this.therapistId != this.refers.therapistId) {
            if (this.refers.unsubAct) {
                this.refers.unsubAct();
                this.setUnA(null);
            }
            if (this.refers.unsubEnd) {
                this.refers.unsubEnd();
                this.setUnE(null);
            }
            this.setTher(this.therapistId);
        }
        this.getRefers(this.statusFilter);
    }
}
</script>