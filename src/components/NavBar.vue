<template>
    <nav class="navbar" :class="navColor" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <a href="https://psicologia.unam.mx" class="navbar-item">
                <img src="/img/psiw.png" alt="Logo facultad Psicología UNAM" />
            </a>
            <a role="button" class="navbar-burger burger" :class="{'is-active': isActive}" @click="toggleMenu" aria-label="menu" aria-expanded="false">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>
        <template v-if="currentUser">
        <div class="navbar-menu" :class="{'is-active': isActive}">
            <div class="navbar-start">
                <router-link v-if="$store.state.userProfile.userType < 3" class="navbar-item" to="/usuarios">Usuarios</router-link>
                <router-link v-if="$store.state.userProfile.userType == 2"  class="navbar-item" to="/supervisores">Supervisores/Estudiantes</router-link>
                <router-link v-if="$store.state.userProfile.userType == 2"  class="navbar-item" to="/terapeutas">Terapeutas invitados</router-link>
                <router-link v-if="$store.state.userProfile.userType == 3" class="navbar-item" to="/mis-usuarios">Usuarios referenciados</router-link>
            </div>
            <div class="navbar-end">
                <router-link class="navbar-item" to="/mis-datos">Editar mis datos</router-link>
                <div class="navbar-item">
                    <a class="button is-light" @click="logout">Cerrar sesión</a>
                </div>
            </div>
        </div>
        </template>
    </nav>
</template>

<script>
// const fb = require('@/firebaseConfig.js');
import { auth } from '@/firebaseConfig.js';
import { mapState } from 'vuex';

export default {
    data() {
        return {
            isActive: false,
        }
    },
    computed: {
        navColor() {
            const type = this.$store.state.userProfile.userType;
            if (type == 1) {
                return 'is-info';
            } else if (type == 2) {
                return 'is-dark';
            } else if (type == 3) {
                return 'is-link';
            } else {
                return 'is-unam';
            }
        },
        ...mapState(['currentUser'])
    },
    methods: {
        logout() {
            if (this.$store.state.unsubscribeFromPats != null) {
                this.$store.state.unsubscribeFromPats();
            }
            auth.signOut()
            .then(() => {
                this.$store.dispatch('clearData')
                this.$router.push('/login')
            })
            .catch(err=>console.log(err))

        },
        toggleMenu() {
            this.isActive = !this.isActive;
        }
    }
}
</script>