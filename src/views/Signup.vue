<template>
    <div class="signup">
        <b-notification :active.sync="errorsExist" type="is-danger" aria-close-label="Close notification" >
            {{ fbErrors.message }}
        </b-notification>
        <div class="card">
            <div class="card-header" style="background-color: #E4AE33;">
                <p class="card-header-title">Registrar nuevo supervisor</p>
            </div>
            <div class="card-content">
                <div class="content">
                    <ValidationObserver ref="observer" v-slot="{ passes }">
                        <BInputVal rules="required|email" type="email" label="Correo electrónico" v-model="signupForm.email" placeholder="Correo" />
                        <BInputVal rules="required" type="password" label="Contraseña" vid="password" v-model="signupForm.password" placeholder="Contraseña" />
                        <BInputVal rules="required|confirmed:password" type="password" label="Confirmar contraseña" v-model="signupForm.confirmation" placeholder="Confirmar contraseña" />
                        <BInputVal rules="required" type="text" label="Nombre" v-model="signupForm.name" placeholder="Nombre" />
                        <BInputVal rules="required" type="text" label="Apellido paterno" v-model="signupForm.lastName" placeholder="Apellido paterno" />
                        <BInputVal rules="required" type="text" label="Apellido materno" v-model="signupForm.mothersName" placeholder="Apellido materno" />
                        <BSelectVal rules="required" label="Tipo de usuario" v-model="signupForm.userType">
                            <option value=0>Supervisor</option>
                            <option value=1>Estudiante</option>
                        </BSelectVal>
                        <b-button type="is-info" @click="passes(signup)" :loading="performingRequest" >Registrar</b-button>
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
import BSelectVal from '../components/inputs/BSelectVal'

export default {
    components: {
        ValidationObserver,
        BInputVal,
        BSelectVal
    },
    data() {
        return {
            signupForm: {
                email: '',
                password: '',
                confirmation: '',
                name: '',
                lastName: '',
                mothersName: '',
                userType: 0,
                accountNum: ''
            },
            performingRequest: false,
            fbErrors: {},
            errorsExist: false
        }
    },
    methods: {
        signup() {
            this.performingRequest = true;
            fb.auth.createUserWithEmailAndPassword(this.signupForm.email, this.signupForm.password).then(res => {
                console.log(res);
                this.$store.commit('setCurrentUser', res.user)

                // create user obj
                fb.usersCollection.doc(res.user.uid).set({
                    name: this.signupForm.name,
                    lastName: this.signupForm.lastName,
                    mothersName: this.signupForm.mothersName,
                    userType: this.signupForm.userType,
                    accountNum: this.signupForm.accountNum
                })
                .then(()=>{
                    this.$store.dispatch('fetchUserProfile')
                    this.$router.push('/home')
                })
                .catch(err=>console.log(err))
            })
            .catch(err =>{
                this.errorsExist = true
                this.fbErrors = err
            })
            .finally(()=>this.performingRequest=false)
        }
    }
}
</script>