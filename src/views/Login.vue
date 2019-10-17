<template>
    <div class="login">
        <!-- <b-loading :active.sync="performingRequest" ></b-loading> -->
        <div class="card">
            <div class="card-header" style="background-color: #E4AE33;">
                <p class="card-header-title">Bienvenido al sistema de terapeuta invitado</p>
            </div>
            <div class="card-content">
                <div class="content">
                    <form>
                        <ValidationObserver ref="observer" v-slot="{ passes }">
                            <BInputVal rules="required|email" type="email" label="Correo electrónico" v-model="loginForm.email" placeholder="Correo" />
                            <BInputVal rules="required" type="password" label="Contraseña" v-model="loginForm.password" placeholder="Contraseña" />
                            <br>
                            <button class="button is-info" type="submit" :class="{'is-loading': performingRequest}" @click.prevent="passes(login)">Iniciar sesión</button>
                        </ValidationObserver>
                    </form>
                    <br>
                    <br>
                    <a @click.prevent="isModalVisible=true" class="button">Olvide mi contraseña</a>
                </div>
            </div>
        </div>
        <div class="modal" :class="{'is-active': isModalVisible}">
            <div class="modal-background" @click="isModalVisible=false"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Reestablecer contraseña</p>
                    <button class="delete" aria-label="close"  @click="isModalVisible=false"></button>
                </header>
                <form class="form">
                    <section class="modal-card-body">
                        <div class="field">
                            <label class="label">Tu correo electrónico</label>
                            <div class="control">
                                <input class="input" type="email" placeholder="Tu correo electrónico" v-model="resetMail" >
                            </div>
                        </div>
                        <p>Se te mandará un enlace para reestablecer tu contraseña.</p>
                    </section>
                    <footer class="modal-card-foot">
                        <button @click.prevent="isModalVisible=false" class="button">Cancelar</button>
                        <button class="button is-info" :class="{'is-loading': sendingMail}" @click.prevent="sendMail" >Enviar correo</button>
                    </footer>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
const fb = require('../firebaseConfig.js')
import Swal from 'sweetalert2';
import { mapState } from 'vuex';

import { ValidationObserver } from 'vee-validate'
import BInputVal from '../components/inputs/BInputVal'

export default {
    name: "LoginForm",
    components: {
        ValidationObserver,
        BInputVal,
    },
    data() {
        return {
            loginForm: {
                email: '',
                password: ''
            },
            performingRequest: false,
            isModalVisible: false,
            sendingMail: false,
            resetMail: '',
        }
    },
    computed: {
        ...mapState(['userProfile']),
    },
    methods: {
        login() {
            this.performingRequest = true

            fb.auth.signInWithEmailAndPassword(this.loginForm.email, this.loginForm.password)
            .then(res=>{
                this.$store.commit('setCurrentUser', res.user)
                return fb.usersCollection.doc(res.user.uid).get()
            })
            .then(res=>{
                this.$store.commit('setUserProfile', res.data());
                if (this.userProfile.userType == 3) {
                    this.$router.push('/mis-usuarios');
                } else {
                    this.$router.push('/usuarios')
                }
            })
            .catch(err =>{
                if (err.code == "auth/wrong-password") {
                    err.message = "La contraseña no es válida";
                }
                Swal.fire({
                   title: 'Ocurrió un error',
                   text: err,
                   type: "error",
                   confirmButtonText: 'Aceptar' 
                });
            })
            .finally(()=>{
                this.performingRequest = false
            })
        },
        sendMail() {
            this.sendingMail = true;
            fb.auth.sendPasswordResetEmail(this.resetMail)
            .then(()=>{
                Swal.fire({
                    title: 'Correo enviado',
                    text: 'Por favor, revisa tu buzón.',
                    type: "success",
                    confirmButtonText: 'Aceptar',
                    onClose: () => this.isModalVisible = false
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
            .finally(this.sendingMail = false);
        }
    }
}
</script>