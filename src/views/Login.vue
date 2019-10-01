<template>
    <div class="login">
        <!-- <b-loading :active.sync="performingRequest" ></b-loading> -->
        <div class="card">
            <div class="card-header" style="background-color: #E4AE33;">
                <p class="card-header-title">Bienvenido</p>
            </div>
            <div class="card-content">
                <div class="content">
                    <ValidationObserver ref="observer" v-slot="{ passes }">
                        <BInputVal rules="required|email" type="email" label="Correo electrónico" v-model="loginForm.email" placeholder="Correo" />
                        <BInputVal rules="required" type="password" label="Contraseña" v-model="loginForm.password" placeholder="Contraseña" />
                        <b-button type="is-info" @click="passes(login)" :loading="performingRequest" >Iniciar sesión</b-button>
                    </ValidationObserver>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const fb = require('../firebaseConfig.js')

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
            performingRequest: false
        }
    },
    methods: {
        login() {
            this.performingRequest = true

            fb.auth.signInWithEmailAndPassword(this.loginForm.email, this.loginForm.password)
            .then(res=>{
                this.$store.commit('setCurrentUser', res.user)
                this.$store.dispatch('fetchUserProfile')
                this.$router.push('/')
            })
            .catch(err=>{
                console.log(err)
            })
            .finally(()=>{
                this.performingRequest = false
            })
        }
    }
}
</script>