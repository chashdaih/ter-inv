<template>
    <div class="appts">
        <nav class="breadcrumb">
            <ul v-if="userProfile.userType < 3">
                <li><router-link to="/usuarios">Usuarios</router-link></li>
                <li><router-link v-if="ref" :to="'/usuarios/' + patientId">{{ref.patientName}}</router-link></li>
                <li><router-link v-if="ref" :to="'/usuarios/' + patientId + '/referencias/'">Referencias</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">Sesiones del usuario</a></li>
            </ul>
            <ul v-else>
                <li><router-link to="/mis-usuarios">Usuarios referenciados</router-link></li>
                <li><router-link v-if="ref" :to="'/usuarios/' + patientId">{{ref.patientName}}</router-link></li>
                <li class="is-active"><a href="#" aria-current="page">Sesiones del usuario</a></li>
            </ul>
        </nav>
        <h1 v-if="ref" class="title">Sesiones del usuario {{ref.patientName}}</h1>
        <a v-if="userProfile.userType == 3" @click.prevent="openModal" class="button is-success">Registrar sesión</a>
        <b-table v-if="ref" :loading="loading" :data="refArray">
            <template slot-scope="props">
                <b-table-column label="Fecha" sortable>{{props.row.data.date}}</b-table-column>
                <b-table-column label="Estatus" sortable>{{props.row.data.status}}</b-table-column>
                <b-table-column label="Comentarios" sortable>{{props.row.data.comments}}</b-table-column>
                <!-- <b-table-column label="Editar"><button class="button is-info">Editar</button></b-table-column> -->
                <b-table-column v-if="userProfile.userType == 3" label="Borrar registro" ><button @click="deleteSession(props.row.id)" class="button is-danger">Borrar</button></b-table-column>
            </template>
            <template slot="empty">
                <section class="section">
                    <div class="content has-text-grey has-text-centered">
                        <p class="is-italic">No hay sesiones registradas para el usuario</p>
                    </div>
                </section>
            </template>
        </b-table>
        <div class="modal" :class="{'is-active': isModalActive}">
            <div class="modal-background" @click="clearModal"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Registrar sesión</p>
                    <button class="delete" aria-label="close" @click="clearModal"></button>
                </header>
                <section class="modal-card-body">
                    <div class="field">
                        <label class="label">Fecha de la sesión</label>
                        <div class="control">
                            <input type="date" class="input" v-model="newSession.date">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Estatus de la sesión</label>
                        <div class="control">
                            <div class="select">
                                <select v-model="newSession.status">
                                    <option v-for="status in sessionStatus" :key="status" :value="status">{{status}}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Comentarios</label>
                        <div class="control">
                            <textarea v-model="newSession.comments" class="textarea" placeholder="Comentarios"></textarea>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success" @click="saveSession" :class="{'is-loading': saving}">Registrar sesión</button>
                    <button class="button" @click="clearModal">Cerrar</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
const fb = require('@/firebaseConfig.js');
import Swal from 'sweetalert2';

export default {
    props:{
        sessionStatus: { type: Array, default: () => (['Asistió', 'No asistió']) },
    },
    data() {
        return {
            patientId: this.$route.params.id,
            refId: this.$route.params.ref,
            ref: null,
            loading: true,
            isModalActive: false,
            newSession: {
                status: this.sessionStatus[0],
            },
            saving: false,
        };
    },
    computed: {
        ...mapState([
            'userProfile',
        ]),
        refArray() {
            let arr = [];
            for (const key in this.ref.sessions) {
                arr.push({id:key, data:this.ref.sessions[key]})
            }
            return arr;
        }
    },
    methods: {
        getRef() {
            this.loading = true;
            fb.refersCollection.doc(this.refId).get()
            .then(res=>{
                this.ref = res.data();
            })
            .catch(err=>console.log(err))
            .finally(this.loading = false);
        },
        openModal() {
            this.isModalActive = true;
        },
        clearModal() {
            this.isModalActive = false;
            this.newSession = {status:this.sessionStatus[0]}
        },
        saveSession() {
            this.saving = true;
            const timestamp = Date.now();
            let sessionUpdate = {};
            sessionUpdate[`sessions.${timestamp}`] = this.newSession;
            fb.refersCollection.doc(this.refId).update(sessionUpdate)
            .then(()=>{
                // todo snapshot auto update, vuex
                if (this.ref.sessions) {
                    this.ref.sessions[timestamp]= this.newSession;
                } else {
                    this.ref['sessions'] = this.newSession;
                }
                this.ref = {...this.ref};
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
            .finally(()=>this.saving=false)
        },
        deleteSession(id) {
            this.loading = true;
            let deleteObject = {};
            deleteObject[`sessions.${id}`] = fb.firebase.firestore.FieldValue.delete();
            fb.refersCollection.doc(this.refId).update(deleteObject)
            .then(() => {
                delete this.ref.sessions[id];
                this.ref = {...this.ref};
            })
            .catch(err =>{
                Swal.fire({
                   title: 'Ocurrió un error',
                   text: err,
                   type: "error",
                   confirmButtonText: 'Aceptar' 
                });
            })
            .finally(()=>this.loading=false)
        }
    },
    mounted() {
        this.getRef();
    }
}
</script>