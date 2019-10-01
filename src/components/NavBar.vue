<template>
    <nav class="navbar is-info" role="navigation" aria-label="main navigation">
        <div class="navbar-menu">
            <div class="navbar-start">
                <router-link class="navbar-item" to="/">Inicio</router-link>
                <router-link v-if="$store.state.userProfile.userType == 2"  class="navbar-item" to="/supervisores">Supervisores/Estudiantes</router-link>
                <router-link v-if="$store.state.userProfile.userType == 2"  class="navbar-item" to="/terapeutas">Terapeutas invitados</router-link>
                <router-link v-if="$store.state.userProfile.userType < 3" class="navbar-item" to="/usuarios">Usuarios</router-link>
                <router-link v-if="$store.state.userProfile.userType == 3" class="navbar-item" to="/mis-usuarios">Usuarios referenciados</router-link>
            </div>
            <div class="navbar-end">
                <router-link class="navbar-item" to="/">Editar mis datos</router-link>
                <div class="navbar-item">
                    <a class="button is-light" @click="logout">Cerrar sesión</a>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
const fb = require('@/firebaseConfig.js')

export default {
    methods: {
        logout() {
            fb.auth.signOut()
            .then(() => {
                this.$store.dispatch('clearData')
                this.$router.push('/login')
            })
            .catch(err=>console.log(err))
        }
    }
}
</script>